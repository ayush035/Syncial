import { useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { usePredictionMarket } from '../../hooks/usePredictionMarket';
import { X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const BetModal = ({ pollId, initialOption = true, onClose, onSuccess }) => {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const [option, setOption] = useState(initialOption);
  const [amount, setAmount] = useState('');
  const [localError, setLocalError] = useState('');
  
  const { handlePlaceBet, loading } = usePredictionMarket();

  const formattedBalance = balance
    ? Number(formatUnits(balance.value, balance.decimals || 6)).toFixed(2)
    : '0.00';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) {
      setLocalError('Please enter a valid amount');
      return;
    }

    if (num < 1) {
      setLocalError('Minimum bet is 1.00 USDC');
      return;
    }

    if (balance && num > Number(formatUnits(balance.value, balance.decimals || 6))) {
      setLocalError(`Insufficient balance (${formattedBalance} USDC available)`);
      return;
    }

    try {
      const toastId = toast.loading('Submitting bet...');
      await handlePlaceBet(pollId, option, amount);
      toast.success('Bet placed on Arc!', { id: toastId });
      setTimeout(() => onSuccess?.(), 1000);
    } catch (err) {
      console.error('Bet error:', err);
      const msg = err.reason || err.shortMessage || 'Transaction failed';
      setLocalError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#121215] border border-zinc-800 rounded-2xl max-w-sm w-full p-5 shadow-xl space-y-4">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
          <div>
            <h3 className="text-base font-semibold text-white">Place Bet</h3>
            <p className="text-xs text-zinc-400">Poll #{pollId} • Arc Mainnet</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Balance Display */}
        <div className="flex justify-between items-center text-xs text-zinc-400 px-1">
          <span>Available balance</span>
          <span className="font-semibold text-white">{formattedBalance} USDC</span>
        </div>

        {localError && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{localError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Option Selector */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Prediction Outcome
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOption(true)}
                className={`py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  option
                    ? 'bg-emerald-500 text-white'
                    : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
                }`}
              >
                YES
              </button>
              <button
                type="button"
                onClick={() => setOption(false)}
                className={`py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  !option
                    ? 'bg-[#ED3968] text-white'
                    : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
                }`}
              >
                NO
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-zinc-300">Amount</label>
              <span className="text-[11px] text-zinc-500">Min 1.00 USDC</span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10"
                disabled={loading}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-lg py-2 pl-3 pr-14 text-sm text-white placeholder-zinc-600 outline-none transition"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400">
                USDC
              </span>
            </div>

            {/* Quick chips */}
            <div className="flex gap-1.5 mt-2">
              {['1', '5', '10', '25'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className="flex-1 py-1 rounded bg-zinc-800/60 hover:bg-zinc-800 text-[11px] text-zinc-300 transition cursor-pointer"
                >
                  ${val}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  if (balance) {
                    const max = Math.max(0, Number(formatUnits(balance.value, balance.decimals || 6)) - 0.05);
                    setAmount(max.toFixed(2));
                  }
                }}
                className="px-2 py-1 rounded bg-zinc-800/60 hover:bg-zinc-800 text-[11px] font-semibold text-white transition cursor-pointer"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2 btn-secondary text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="flex-1 py-2 btn-primary text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Confirming...' : `Stake ${amount ? `${amount} USDC` : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BetModal;