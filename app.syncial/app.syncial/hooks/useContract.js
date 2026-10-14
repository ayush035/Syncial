import { useReadContract, useWriteContract } from 'wagmi';
import { PREDICTION_MARKET_ADDRESS } from '@/lib/config2';
import CONTRACT_ABI from '@/abi/PredictionMarketplace.json';

export const useContract = () => {
  // one writeContractAsync handles all write actions
  const { writeContractAsync, data: hash, error, isPending } = useWriteContract();

  // --- Write functions ---

  const createPoll = async (pollData) => {
    return writeContractAsync({
      address: PREDICTION_MARKET_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'createPoll',
      args: [
        pollData.question,
        BigInt(pollData.duration),
        pollData.assetPriceId,
        BigInt(pollData.targetPrice),
      ],
      gas: 800000n,
    });
  };

  // ERC-20 USDC Bet (6 decimals)
  const placeBet = async (pollId, option, amountUSDC6) => {
    return writeContractAsync({
      address: PREDICTION_MARKET_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'placeBet',
      args: [BigInt(pollId), option, amountUSDC6],
      gas: 500000n,
    });
  };

  // Native Arc USDC Bet (18 decimals via msg.value)
  const placeBetNative = async (pollId, option, amountNativeWei) => {
    return writeContractAsync({
      address: PREDICTION_MARKET_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'placeBetNative',
      args: [BigInt(pollId), option],
      value: amountNativeWei,
      gas: 500000n,
    });
  };

  const resolvePoll = async (pollId) => {
    return writeContractAsync({
      address: PREDICTION_MARKET_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'resolvePoll',
      args: [BigInt(pollId)],
      gas: 600000n,
    });
  };

  const updateMaxPrice = async (pollId) => {
    return writeContractAsync({
      address: PREDICTION_MARKET_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'updateMaxPrice',
      args: [BigInt(pollId)],
      gas: 300000n,
    });
  };

  // --- Expose API ---
  return {
    createPoll,
    placeBet,
    placeBetNative,
    resolvePoll,
    updateMaxPrice,
    hash,
    isPending,
    error,
  };
};

// --- Read helpers ---

export const usePollData = (pollId) => {
  return useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'polls',
    args: [pollId],
    query: {
      refetchInterval: 10000,
      enabled: pollId !== undefined && pollId !== null,
    },
  });
};

export const useUserBets = (pollId, userAddress) => {
  return useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getUserBets',
    args: [pollId, userAddress],
    query: {
      enabled: !!userAddress && pollId !== undefined,
      refetchInterval: 10000,
    },
  });
};

export const usePollCount = () => {
  return useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'pollCount',
    query: {
      refetchInterval: 30000,
    },
  });
};
