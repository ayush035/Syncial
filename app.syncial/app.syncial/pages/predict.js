import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import CreatePoll from '../components/PredictionMarket/CreatePoll';
import PollCard from '../components/PredictionMarket/PollCard';
import { usePollCount } from '../hooks/useContract';
import { usePyth } from '../hooks/usePyth';
import { RefreshCw } from 'lucide-react';

const PredictionMarket = () => {
  const { isConnected } = useAccount();
  const { data: pollCount, isLoading: pollCountLoading, refetch: refetchPollCount } = usePollCount();
  const { prices, getFormattedPrice } = usePyth();
  const [activeTab, setActiveTab] = useState('polls');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    refetchPollCount();
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const count = Number(pollCount) || 0;

  return (
    <div className="min-h-screen py-8 px-4 max-w-3xl mx-auto">
      
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Prediction Markets</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Pyth Oracles • Settled in Arc USDC
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Disconnected Notice */}
      {!isConnected && (
        <div className="clean-card p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/40">
          <div>
            <span className="text-xs font-semibold text-white block">Arc Mainnet Wallet Not Connected</span>
            <span className="text-[11px] text-zinc-400">
              Connect your wallet on Arc to place bets in native USDC or create new markets.
            </span>
          </div>
          <ConnectButton chainStatus="none" />
        </div>
      )}

      {/* Live Pyth Price Feed */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ED3968] animate-pulse"></span>
          <span className="text-[11px] font-mono font-medium text-zinc-400 tracking-wider">
            LIVE PYTH ORACLE FEEDS (USD)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="clean-card p-3 text-center group hover:border-[#ED3968]/40 transition">
            <span className="text-[11px] font-mono text-zinc-400 block mb-0.5">ETH / USD</span>
            <span className="text-base font-semibold text-white group-hover:text-[#ED3968] transition">
              ${getFormattedPrice('0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace') || '2,425.00'}
            </span>
          </div>
          <div className="clean-card p-3 text-center group hover:border-[#ED3968]/40 transition">
            <span className="text-[11px] font-mono text-zinc-400 block mb-0.5">BTC / USD</span>
            <span className="text-base font-semibold text-white group-hover:text-[#ED3968] transition">
              ${getFormattedPrice('0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43') || '81,900.00'}
            </span>
          </div>
          <div className="clean-card p-3 text-center group hover:border-[#ED3968]/40 transition">
            <span className="text-[11px] font-mono text-zinc-400 block mb-0.5">SOL / USD</span>
            <span className="text-base font-semibold text-white group-hover:text-[#ED3968] transition">
              ${getFormattedPrice('0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d') || '105.00'}
            </span>
          </div>
          <div className="clean-card p-3 text-center group hover:border-[#ED3968]/40 transition">
            <span className="text-[11px] font-mono text-zinc-400 block mb-0.5">HBAR / USD</span>
            <span className="text-base font-semibold text-white group-hover:text-[#ED3968] transition">
              ${getFormattedPrice('0x3728e591097635310e6341af53db8b7ee42da9b3a8d918f9463ce9cca886dfbd') || '0.0850'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs with Signature Pink */}
      <div className="flex border-b border-zinc-800 mb-6">
        <button
          onClick={() => setActiveTab('polls')}
          className={`pb-2.5 px-3 text-sm font-medium transition border-b-2 cursor-pointer ${
            activeTab === 'polls'
              ? 'border-[#ED3968] text-[#ED3968] font-semibold'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Markets ({count})
        </button>

        <button
          onClick={() => setActiveTab('create')}
          className={`pb-2.5 px-3 text-sm font-medium transition border-b-2 cursor-pointer ${
            activeTab === 'create'
              ? 'border-[#ED3968] text-[#ED3968] font-semibold'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Create Market
        </button>
      </div>

      {/* Content */}
      {activeTab === 'polls' ? (
        <div>
          {pollCountLoading ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              Loading prediction markets...
            </div>
          ) : count === 0 ? (
            <div className="clean-card p-10 text-center space-y-3">
              <h3 className="text-sm font-semibold text-white">No active markets yet</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Create the first binary prediction market and earn creator host fees in USDC.
              </p>
              <button
                onClick={() => setActiveTab('create')}
                className="py-2 px-4 btn-primary text-xs cursor-pointer"
              >
                Create Market
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from({ length: count }, (_, i) => (
                <PollCard key={`${i}-${refreshKey}`} pollId={i} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <CreatePoll />
      )}
    </div>
  );
};

export default PredictionMarket;