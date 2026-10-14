import { useState, useCallback } from 'react';
import { parseUSDC, parseUSDCNative } from '@/lib/units';
import { useContract } from './useContract';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';

export const usePredictionMarket = () => {
  const { address } = useAccount();
  const { createPoll, placeBet, placeBetNative, resolvePoll, updateMaxPrice, hash, error } = useContract();
  const [loading, setLoading] = useState(false);

  // Wait for transaction confirmation on Arc (sub-second finality)
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const handleCreatePoll = useCallback(
    async (pollData) => {
      setLoading(true);
      try {
        console.log('Creating poll with data on Arc:', pollData);
        const txHash = await createPoll(pollData);
        console.log('Poll creation transaction:', txHash);
        return txHash;
      } finally {
        setLoading(false);
      }
    },
    [createPoll]
  );

  const handlePlaceBet = useCallback(
    async (pollId, option, amountUSDC, isNative = true) => {
      setLoading(true);
      try {
        console.log('Placing bet in Arc USDC:', { pollId, option, amountUSDC, isNative });
        let txHash;
        if (isNative) {
          // Native Arc gas USDC: 18 decimals via msg.value
          const parsedNative = parseUSDCNative(amountUSDC);
          txHash = await placeBetNative(pollId, option, parsedNative);
        } else {
          // ERC-20 USDC: 6 decimals
          const parsed6 = parseUSDC(amountUSDC);
          txHash = await placeBet(pollId, option, parsed6);
        }
        console.log('Bet transaction:', txHash);
        return txHash;
      } finally {
        setLoading(false);
      }
    },
    [placeBet, placeBetNative]
  );

  const handleResolvePoll = useCallback(
    async (pollId) => {
      setLoading(true);
      try {
        console.log('Resolving poll on Arc:', pollId);
        const txHash = await resolvePoll(pollId);
        console.log('Resolution transaction:', txHash);
        return txHash;
      } finally {
        setLoading(false);
      }
    },
    [resolvePoll]
  );

  const handleUpdateMaxPrice = useCallback(
    async (pollId) => {
      try {
        console.log('Updating max price from Pyth on Arc:', pollId);
        const txHash = await updateMaxPrice(pollId);
        console.log('Price update transaction:', txHash);
        return txHash;
      } catch (err) {
        console.error('Error updating max price:', err);
        throw err;
      }
    },
    [updateMaxPrice]
  );

  return {
    handleCreatePoll,
    handlePlaceBet,
    handleResolvePoll,
    handleUpdateMaxPrice,
    loading: loading || isConfirming,
    isConfirmed,
    hash,
    error,
  };
};
