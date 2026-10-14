import { useState } from 'react';
import { PRICE_FEEDS } from '@/lib/config2';
import { usePredictionMarket } from '../../hooks/usePredictionMarket';
import { AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const CreatePoll = () => {
  const [formData, setFormData] = useState({
    question: '',
    duration: 24, // hours
    assetPriceId: PRICE_FEEDS.ETH_USD,
    targetPrice: '',
  });
  const [error, setError] = useState('');

  const { isConnected } = useAccount();
  const { handleCreatePoll, loading } = usePredictionMarket();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.question.trim()) {
      setError('Question is required');
      return;
    }

    if (!formData.targetPrice || parseFloat(formData.targetPrice) <= 0) {
      setError('Please enter a target price');
      return;
    }

    const toastId = toast.loading('Creating market...');

    try {
      const durationInSeconds = formData.duration * 3600;
      const targetPriceWithDecimals = Math.floor(parseFloat(formData.targetPrice) * 1e8);

      await handleCreatePoll({
        question: formData.question,
        duration: durationInSeconds,
        assetPriceId: formData.assetPriceId,
        targetPrice: targetPriceWithDecimals,
      });

      toast.success('Market created on Arc!', { id: toastId });
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      console.error('Create market error:', err);
      const msg = err.reason || err.shortMessage || 'Failed to create market';
      setError(msg);
      toast.error(msg, { id: toastId });
    }
  };

  return (
    <div className="clean-card p-6 max-w-md mx-auto space-y-4">
      <div>
        <h2 className="text-base font-semibold text-white">Create Prediction Market</h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Settled in native Arc USDC with Pyth Oracles
        </p>
      </div>

      {error && (
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">
            Question
          </label>
          <input
            type="text"
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            placeholder="e.g. Will ETH reach $3,500 before Friday?"
            required
            disabled={loading}
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-lg py-2 px-3 text-sm text-white placeholder-zinc-600 outline-none transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Asset
            </label>
            <select
              value={formData.assetPriceId}
              onChange={(e) => setFormData({ ...formData, assetPriceId: e.target.value })}
              disabled={loading}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-lg py-2 px-2 text-xs text-white outline-none transition"
            >
              <option value={PRICE_FEEDS.ETH_USD}>ETH / USD</option>
              <option value={PRICE_FEEDS.BTC_USD}>BTC / USD</option>
              <option value={PRICE_FEEDS.SOL_USD}>SOL / USD</option>
              <option value={PRICE_FEEDS.HBAR_USD}>HBAR / USD</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Target Price ($)
            </label>
            <input
              type="number"
              step="any"
              min="0.01"
              value={formData.targetPrice}
              onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
              placeholder="3500.00"
              required
              disabled={loading}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-600 outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">
            Duration (Hours)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[24, 72, 168].map((hours) => (
              <button
                key={hours}
                type="button"
                onClick={() => setFormData({ ...formData, duration: hours })}
                className={`py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  formData.duration === hours
                    ? 'bg-zinc-700 text-white'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {hours === 24 ? '24 Hours' : hours === 72 ? '3 Days' : '7 Days'}
              </button>
            ))}
          </div>
        </div>

        {!isConnected ? (
          <div className="pt-2 flex flex-col items-center gap-2 text-center">
            <span className="text-[11px] text-zinc-400">
              Connect your wallet on Arc Mainnet to deploy this market
            </span>
            <ConnectButton chainStatus="none" />
          </div>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 btn-primary text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? 'Creating...' : 'Create Market'}
          </button>
        )}
      </form>
    </div>
  );
};

export default CreatePoll;