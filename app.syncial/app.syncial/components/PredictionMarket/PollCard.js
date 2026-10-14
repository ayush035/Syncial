import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { usePollData, useUserBets, useContract } from '../../hooks/useContract';
import { formatUSDC } from '@/lib/units';
import BetModal from './BetModal';
import toast from 'react-hot-toast';

const PollCard = ({ pollId }) => {
  const { address } = useAccount();
  const { data: pollData, isLoading: pollLoading, refetch } = usePollData(pollId);
  const { data: userBets, refetch: refetchUserBets } = useUserBets(pollId, address);
  
  const { resolvePoll, updateMaxPrice } = useContract();

  const [showBetModal, setShowBetModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 25000);
    return () => clearInterval(interval);
  }, [refetch]);

  if (pollLoading) {
    return (
      <div className="clean-card p-5 h-44 animate-pulse flex flex-col justify-between">
        <div className="h-4 bg-zinc-800 rounded w-2/3"></div>
        <div className="h-3 bg-zinc-800 rounded w-1/3"></div>
        <div className="h-8 bg-zinc-800 rounded w-full"></div>
      </div>
    );
  }

  if (!pollData || pollData.length === 0) return null;

  const question = pollData[0] || 'Unknown Question';
  const startTime = Number(pollData[1]);
  const endTime = Number(pollData[2]);
  const assetPriceId = pollData[3];
  const targetPrice = pollData[4];
  const maxPriceDuringPoll = pollData[5];
  const totalYes = pollData[6] || 0n;
  const totalNo = pollData[7] || 0n;
  const isResolved = Boolean(pollData[8]);
  const host = pollData[9];

  if (endTime === 0 || !question || question === 'Unknown Question') return null;

  const totalYesUSDC = formatUSDC(totalYes);
  const totalNoUSDC = formatUSDC(totalNo);
  const totalPoolUSDC = formatUSDC(BigInt(totalYes) + BigInt(totalNo));

  const userYesUSDC = userBets ? formatUSDC(userBets[0]) : '0.00';
  const userNoUSDC = userBets ? formatUSDC(userBets[1]) : '0.00';

  const formatPyth = (val) => {
    if (!val) return '0.00';
    return (Number(val) / 1e8).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const targetUSD = formatPyth(targetPrice);
  const maxUSD = formatPyth(maxPriceDuringPoll);

  const now = Date.now();
  const pollEndTime = endTime > 1e12 ? endTime : endTime * 1000;
  const isActive = now < pollEndTime && !isResolved;
  const canResolve = now >= pollEndTime && !isResolved;

  const yesNum = Number(totalYes);
  const noNum = Number(totalNo);
  const totalPot = yesNum + noNum;

  const yesPercent = totalPot > 0 ? Math.round((yesNum / totalPot) * 100) : 50;
  const noPercent = 100 - yesPercent;

  const handleResolve = async () => {
    if (!canResolve) return;
    setLoading(true);
    const toastId = toast.loading('Resolving on Arc...');
    try {
      await resolvePoll(BigInt(pollId));
      toast.success('Market resolved!', { id: toastId });
      setTimeout(() => {
        refetch();
        refetchUserBets();
      }, 1200);
    } catch (err) {
      toast.error(err.reason || err.shortMessage || 'Failed to resolve', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrice = async () => {
    if (!isActive) return;
    setLoading(true);
    const toastId = toast.loading('Syncing Pyth price...');
    try {
      await updateMaxPrice(BigInt(pollId));
      toast.success('Price synced', { id: toastId });
      setTimeout(() => refetch(), 1000);
    } catch (err) {
      toast.error('Failed to sync price', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const openBet = (opt) => {
    setSelectedOption(opt);
    setShowBetModal(true);
  };

  return (
    <div className="clean-card p-5 space-y-4">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-white leading-snug flex-1">
          {question}
        </h3>
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
          isResolved
            ? 'bg-zinc-800 text-zinc-400'
            : isActive
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
        }`}>
          {isResolved ? 'Resolved' : isActive ? 'Active' : 'Ended'}
        </span>
      </div>

      {/* Metrics Row */}
      <div className="flex flex-wrap items-center justify-between text-xs text-zinc-400 pt-1">
        <div>
          <span>Target: </span>
          <span className="font-semibold text-white">${targetUSD}</span>
        </div>
        <div>
          <span>Peak Observed: </span>
          <span className="font-semibold text-white">${maxUSD}</span>
        </div>
        <div>
          <span>Pool: </span>
          <span className="font-semibold text-white">{totalPoolUSDC} USDC</span>
        </div>
      </div>

      {/* Probability Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="font-medium text-emerald-400">YES {yesPercent}%</span>
          <span className="font-medium text-[#ED3968]">NO {noPercent}%</span>
        </div>
        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden flex">
          <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${yesPercent}%` }}></div>
          <div className="bg-[#ED3968] h-full transition-all duration-300" style={{ width: `${noPercent}%` }}></div>
        </div>
      </div>

      {/* User Bets (if any) */}
      {(parseFloat(userYesUSDC) > 0 || parseFloat(userNoUSDC) > 0) && (
        <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs flex justify-between">
          <span className="text-zinc-400">Your Position:</span>
          <div className="space-x-3">
            {parseFloat(userYesUSDC) > 0 && <span className="text-emerald-400 font-medium">YES {userYesUSDC} USDC</span>}
            {parseFloat(userNoUSDC) > 0 && <span className="text-[#ED3968] font-medium">NO {userNoUSDC} USDC</span>}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-1">
        {isActive ? (
          <>
            <button
              onClick={() => openBet(true)}
              disabled={loading}
              className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition cursor-pointer"
            >
              Bet YES
            </button>
            <button
              onClick={() => openBet(false)}
              disabled={loading}
              className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold bg-[#ED3968]/10 text-[#ED3968] border border-[#ED3968]/20 hover:bg-[#ED3968]/20 transition cursor-pointer"
            >
              Bet NO
            </button>
            <button
              onClick={handleUpdatePrice}
              disabled={loading}
              className="py-2 px-3 rounded-lg text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 transition cursor-pointer"
              title="Sync latest price from Pyth"
            >
              Sync Price
            </button>
          </>
        ) : canResolve ? (
          <button
            onClick={handleResolve}
            disabled={loading}
            className="w-full py-2 btn-primary text-xs cursor-pointer"
          >
            {loading ? 'Resolving...' : 'Resolve Market & Payout'}
          </button>
        ) : (
          <div className="w-full text-center py-1.5 text-xs text-zinc-500">
            Market concluded
          </div>
        )}
      </div>

      {showBetModal && (
        <BetModal
          pollId={pollId}
          initialOption={selectedOption}
          onClose={() => setShowBetModal(false)}
          onSuccess={() => {
            setShowBetModal(false);
            setTimeout(() => {
              refetch();
              refetchUserBets();
            }, 800);
          }}
        />
      )}
    </div>
  );
};

export default PollCard;