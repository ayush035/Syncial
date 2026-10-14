// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";

interface IPyth {
    struct Price {
        int64 price;
        uint64 conf;
        int32 expo;
        uint256 publishTime;
    }

    function getPriceUnsafe(bytes32 id) external view returns (Price memory price);
}

/**
 * @title ArcPredictionMarketplace
 * @notice Binary pari-mutuel prediction marketplace on Arc Network (Chain ID 5042).
 * Dual-compatible with Arc's native USDC architecture:
 *  - ERC-20 USDC interface (0x3600000000000000000000000000000000000000) using 6 decimals.
 *  - EIP-2612 Permit support for 1-click gasless bet approvals.
 *  - Native payable USDC support (18 decimals converted seamlessly to 6-decimal pool units).
 */
contract ArcPredictionMarketplace is ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Poll {
        string question;
        uint256 startTime;
        uint256 endTime;
        bytes32 assetPriceId;
        int256 targetPrice;
        uint256 maxPriceDuringPoll;
        uint256 totalYes;
        uint256 totalNo;
        mapping(address => uint256) yesBets;
        mapping(address => uint256) noBets;
        mapping(address => bool) isNativeBettor;
        address[] yesBettors;
        address[] noBettors;
        bool isResolved;
        address host;
    }

    IERC20 public immutable usdc;
    IPyth public pyth;
    address public platform;
    uint256 public pollCount;

    // Fees in Basis Points (10,000 = 100%)
    uint256 public constant HOST_FEE_BPS = 200;      // 2.0%
    uint256 public constant PLATFORM_FEE_BPS = 100;  // 1.0%
    uint256 public constant MIN_VOLUME_BPS = 400;    // 4.0%
    uint256 public constant MIN_BET_USDC = 1e6;      // 1 USDC in standard 6 decimals
    uint256 public constant MIN_BET_NATIVE = 1e18;   // 1 USDC in Arc native gas wei (18 decimals)

    mapping(uint256 => Poll) public polls;

    // Events
    event PollCreated(
        uint256 indexed pollId,
        string question,
        uint256 startTime,
        uint256 endTime,
        bytes32 assetPriceId,
        int256 targetPrice,
        address indexed host
    );
    event BetPlaced(
        uint256 indexed pollId,
        address indexed bettor,
        bool option,
        uint256 amountUSDC,
        bool isNative
    );
    event MaxPriceUpdated(uint256 indexed pollId, uint256 maxPrice);
    event PollResolved(uint256 indexed pollId, bool outcome, uint256 totalPot);
    event PollRefunded(uint256 indexed pollId, uint256 totalPot);

    constructor(address _usdc, address _pyth, address _platform) {
        require(_usdc != address(0), "Invalid USDC address");
        require(_pyth != address(0), "Invalid Pyth address");
        require(_platform != address(0), "Invalid platform address");
        usdc = IERC20(_usdc);
        pyth = IPyth(_pyth);
        platform = _platform;
    }

    modifier validPoll(uint256 _pollId) {
        require(_pollId < pollCount, "Invalid poll ID");
        _;
    }

    /// @notice Create a new binary prediction market
    function createPoll(
        string memory _question,
        uint256 _duration,
        bytes32 _assetPriceId,
        int256 _targetPrice
    ) external {
        require(bytes(_question).length > 0, "Question cannot be empty");
        require(_duration >= 300, "Duration must be at least 5 minutes");

        Poll storage p = polls[pollCount];
        p.question = _question;
        p.startTime = block.timestamp;
        p.endTime = block.timestamp + _duration;
        p.assetPriceId = _assetPriceId;
        p.targetPrice = _targetPrice;
        p.maxPriceDuringPoll = 0;
        p.totalYes = 0;
        p.totalNo = 0;
        p.isResolved = false;
        p.host = msg.sender;

        emit PollCreated(pollCount, _question, p.startTime, p.endTime, _assetPriceId, _targetPrice, msg.sender);
        pollCount++;
    }

    /// @notice Place a bet using ERC-20 USDC (6 decimals)
    function placeBet(uint256 _pollId, bool _option, uint256 _amount) external nonReentrant validPoll(_pollId) {
        require(_amount >= MIN_BET_USDC, "Min bet 1 USDC");
        Poll storage p = polls[_pollId];
        require(block.timestamp < p.endTime, "Poll ended");

        usdc.safeTransferFrom(msg.sender, address(this), _amount);
        _recordBet(p, _pollId, msg.sender, _option, _amount, false);
    }

    /// @notice 1-Click Bet with EIP-2612 Permit (no separate approval transaction needed)
    function placeBetWithPermit(
        uint256 _pollId,
        bool _option,
        uint256 _amount,
        uint256 _deadline,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) external nonReentrant validPoll(_pollId) {
        require(_amount >= MIN_BET_USDC, "Min bet 1 USDC");
        Poll storage p = polls[_pollId];
        require(block.timestamp < p.endTime, "Poll ended");

        IERC20Permit(address(usdc)).permit(msg.sender, address(this), _amount, _deadline, _v, _r, _s);
        usdc.safeTransferFrom(msg.sender, address(this), _amount);
        _recordBet(p, _pollId, msg.sender, _option, _amount, false);
    }

    /// @notice Place a bet using Arc's native gas USDC (18 decimals converted to 6-decimal pool units)
    function placeBetNative(uint256 _pollId, bool _option) external payable nonReentrant validPoll(_pollId) {
        require(msg.value >= MIN_BET_NATIVE, "Min bet 1 USDC");
        Poll storage p = polls[_pollId];
        require(block.timestamp < p.endTime, "Poll ended");

        // Convert 18-decimal native gas wei into 6-decimal USDC units
        uint256 usdcAmount = msg.value / 1e12;
        require(usdcAmount >= MIN_BET_USDC, "Min bet 1 USDC");

        // Refund any wei dust below 6 decimals
        uint256 dust = msg.value % 1e12;
        if (dust > 0) {
            (bool refunded, ) = msg.sender.call{value: dust}("");
            require(refunded, "Dust refund failed");
        }

        _recordBet(p, _pollId, msg.sender, _option, usdcAmount, true);
    }

    function _recordBet(
        Poll storage p,
        uint256 _pollId,
        address _bettor,
        bool _option,
        uint256 _amountUSDC,
        bool _isNative
    ) internal {
        p.isNativeBettor[_bettor] = _isNative;
        if (_option) {
            if (p.yesBets[_bettor] == 0) p.yesBettors.push(_bettor);
            p.yesBets[_bettor] += _amountUSDC;
            p.totalYes += _amountUSDC;
        } else {
            if (p.noBets[_bettor] == 0) p.noBettors.push(_bettor);
            p.noBets[_bettor] += _amountUSDC;
            p.totalNo += _amountUSDC;
        }

        emit BetPlaced(_pollId, _bettor, _option, _amountUSDC, _isNative);
    }

    /// @notice Update the highest price observed during the poll using Pyth oracle
    function updateMaxPrice(uint256 _pollId) external validPoll(_pollId) {
        Poll storage p = polls[_pollId];
        require(block.timestamp >= p.startTime && block.timestamp < p.endTime, "Poll inactive");

        IPyth.Price memory assetPriceStruct = pyth.getPriceUnsafe(p.assetPriceId);
        int64 price = assetPriceStruct.price;
        require(price > 0, "Invalid asset price from Pyth");

        uint256 currentPrice = uint256(uint64(price));
        if (currentPrice > p.maxPriceDuringPoll) {
            p.maxPriceDuringPoll = currentPrice;
            emit MaxPriceUpdated(_pollId, currentPrice);
        }
    }

    /// @notice Resolve the market and payout winnings in USDC
    function resolvePoll(uint256 _pollId) external nonReentrant validPoll(_pollId) {
        Poll storage p = polls[_pollId];
        require(block.timestamp >= p.endTime, "Poll not ended");
        require(!p.isResolved, "Already resolved");

        p.isResolved = true;

        uint256 totalPot = p.totalYes + p.totalNo;
        require(totalPot > 0, "No bets placed in poll");

        uint256 minVolume = (totalPot * MIN_VOLUME_BPS) / 10000;
        if (p.totalYes < minVolume || p.totalNo < minVolume) {
            // Insufficient volume on one side; refund all bets
            _refundPoll(p);
            emit PollRefunded(_pollId, totalPot);
            return;
        }

        bool outcome = p.maxPriceDuringPoll >= uint256(p.targetPrice);

        uint256 hostFee = (totalPot * HOST_FEE_BPS) / 10000;
        uint256 platformFee = (totalPot * PLATFORM_FEE_BPS) / 10000;
        uint256 remaining = totalPot - hostFee - platformFee;

        address[] storage winners = outcome ? p.yesBettors : p.noBettors;
        uint256 totalWinningBets = outcome ? p.totalYes : p.totalNo;

        if (remaining > 0 && totalWinningBets > 0) {
            for (uint256 i = 0; i < winners.length; i++) {
                address winner = winners[i];
                uint256 betAmount = outcome ? p.yesBets[winner] : p.noBets[winner];
                uint256 share = (betAmount * remaining) / totalWinningBets;
                _payoutUSDC(winner, share, p.isNativeBettor[winner]);
            }
        }

        if (platformFee > 0) {
            _payoutUSDC(platform, platformFee, false);
        }

        if (hostFee > 0) {
            _payoutUSDC(p.host, hostFee, false);
        }

        emit PollResolved(_pollId, outcome, totalPot);
    }

    function _refundPoll(Poll storage p) internal {
        // Refund YES bettors
        for (uint256 i = 0; i < p.yesBettors.length; i++) {
            address bettor = p.yesBettors[i];
            uint256 amount = p.yesBets[bettor];
            if (amount > 0) {
                _payoutUSDC(bettor, amount, p.isNativeBettor[bettor]);
            }
        }
        // Refund NO bettors
        for (uint256 i = 0; i < p.noBettors.length; i++) {
            address bettor = p.noBettors[i];
            uint256 amount = p.noBets[bettor];
            if (amount > 0) {
                _payoutUSDC(bettor, amount, p.isNativeBettor[bettor]);
            }
        }
    }

    function _payoutUSDC(address _recipient, uint256 _amount6Decimals, bool _preferNative) internal {
        if (_preferNative && address(this).balance >= (_amount6Decimals * 1e12)) {
            (bool sent, ) = _recipient.call{value: _amount6Decimals * 1e12}("");
            if (sent) return;
        }
        // Standard ERC-20 payout fallback
        usdc.safeTransfer(_recipient, _amount6Decimals);
    }

    /// @notice Helper to get user bets
    function getUserBets(uint256 _pollId, address _user) external view validPoll(_pollId) returns (uint256 yes, uint256 no) {
        Poll storage p = polls[_pollId];
        yes = p.yesBets[_user];
        no = p.noBets[_user];
    }

    /// @notice Allow contract to receive native gas USDC
    receive() external payable {}
}
