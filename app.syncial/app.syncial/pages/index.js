import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import SuccessModal from '@/components/SuccessModal';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { USERNAME_CONTRACT } from '@/lib/username_congif';
import { ArrowRight, Check, User } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const MintUsername = () => {
  const [username, setUsername] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [existingUsername, setExistingUsername] = useState('');
  const [minting, setMinting] = useState(false);
  const { isConnected, address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    if (isConnected && address) {
      checkIfAlreadyMinted();
    }
  }, [isConnected, address, publicClient]);

  const getProvider = async () => {
    if (publicClient) {
      const rpcUrl = publicClient.transport.url || publicClient.chain.rpcUrls.default.http[0];
      return new ethers.JsonRpcProvider(rpcUrl);
    }
    if (typeof window !== "undefined" && window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum);
    }
    return new ethers.JsonRpcProvider("https://rpc.mainnet.arc.io");
  };

  const checkIfAlreadyMinted = async () => {
    try {
      const provider = await getProvider();
      const contract = new ethers.Contract(USERNAME_CONTRACT.address, USERNAME_CONTRACT.abi, provider);
      const existing = await contract.getUsernameFromWallet(address);
      if (existing && existing.length > 0) {
        setExistingUsername(existing);
      }
    } catch (error) {
      console.log("Username check:", error?.message);
    }
  };

  const handleMint = async () => {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      toast.error('Please enter a username');
      return;
    }

    if (cleanUsername.length < 3 || cleanUsername.length > 20) {
      toast.error('Must be 3-20 characters');
      return;
    }

    if (!isConnected || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    setMinting(true);
    const toastId = toast.loading('Checking handle...');

    try {
      const provider = await getProvider();
      const contract = new ethers.Contract(USERNAME_CONTRACT.address, USERNAME_CONTRACT.abi, provider);
      const isAvailable = await contract.isUsernameAvailable(cleanUsername);

      if (!isAvailable) {
        toast.error('Handle already taken', { id: toastId });
        setMinting(false);
        return;
      }

      toast.loading('Confirming in wallet...', { id: toastId });

      if (walletClient) {
        const hash = await walletClient.writeContract({
          address: USERNAME_CONTRACT.address,
          abi: USERNAME_CONTRACT.abi,
          functionName: 'mintUsername',
          args: [cleanUsername],
        });

        if (publicClient) {
          await publicClient.waitForTransactionReceipt({ hash });
        }
      } else if (typeof window !== 'undefined' && window.ethereum) {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const signer = await browserProvider.getSigner();
        const contractWithSigner = new ethers.Contract(USERNAME_CONTRACT.address, USERNAME_CONTRACT.abi, signer);
        const tx = await contractWithSigner.mintUsername(cleanUsername);
        await tx.wait();
      } else {
        throw new Error('No wallet detected');
      }

      toast.success('Username registered!', { id: toastId });
      setExistingUsername(cleanUsername);
      setShowModal(true);
    } catch (err) {
      console.error('Minting error:', err);
      const errorMsg = err.reason || err.shortMessage || 'Failed to mint handle';
      toast.error(errorMsg, { id: toastId });
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 max-w-5xl mx-auto flex flex-col justify-between">
      {showModal && (
        <SuccessModal
          onClose={() => setShowModal(false)}
          username={existingUsername || username}
        />
      )}

      {/* Hero & Onboarding */}
      <div className="w-full max-w-xl mx-auto text-center pt-4 pb-10">
        {/* Subtle Arc Pill */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#ED3968]/10 border border-[#ED3968]/30 text-xs text-[#ED3968] font-mono mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ED3968] animate-pulse"></span>
          <span>Arc Mainnet • 0.48s Finality • USDC Gas</span>
        </div>

        {/* Clean Hero Header with Signature Pink */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
          Social & Predictions,
          <span className="block text-[#ED3968] font-bold text-2xl sm:text-4xl mt-1">
            Built Purely for Arc.
          </span>
        </h1>
        <p className="text-sm text-zinc-400 max-w-md mx-auto mb-8 leading-relaxed">
          Mint your on-chain handle, trade binary prediction markets settled by Pyth oracles, and publish decentralized media.
        </p>

        {/* Active Guided Onboarding Card */}
        <div className="max-w-sm mx-auto text-left">
          {!isConnected ? (
            /* State 1: Disconnected */
            <div className="clean-card p-6 text-center space-y-4">
              <div className="w-11 h-11 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center mx-auto">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Connect Arc Wallet</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Connect your Web3 wallet on Arc Mainnet to start
                </p>
              </div>
              <div className="pt-2 flex justify-center">
                <ConnectButton chainStatus="none" />
              </div>
            </div>
          ) : existingUsername ? (
            /* State 2: Registered User */
            <div className="clean-card p-6 text-center space-y-4">
              <div className="w-11 h-11 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">
                  @{existingUsername}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                  {address.slice(0, 6)}...{address.slice(-4)} • Arc Mainnet
                </p>
              </div>
              <div className="pt-2 space-y-2">
                <Link
                  href="/dashboard"
                  className="w-full py-2.5 px-4 btn-primary text-xs flex items-center justify-center space-x-2"
                >
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/predict"
                    className="py-2 px-3 btn-secondary text-xs text-center"
                  >
                    Predictions
                  </Link>
                  <Link
                    href="/discover"
                    className="py-2 px-3 btn-secondary text-xs text-center"
                  >
                    Feed
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* State 3: Mint Handle */
            <div className="clean-card p-6 space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-white">Step 1: Mint Your Handle</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Claim your unique on-chain handle on Arc Mainnet
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="handle"
                    disabled={minting}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-lg py-2.5 pl-8 pr-3 text-sm text-white placeholder-zinc-600 outline-none transition"
                  />
                </div>
                <p className="text-[11px] text-zinc-500">
                  Letters, numbers, underscores (3-20 chars)
                </p>
              </div>

              <button
                onClick={handleMint}
                disabled={minting || !username.trim()}
                className="w-full py-2.5 btn-primary text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {minting ? 'Minting on Arc...' : 'Mint Handle (USDC Gas)'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Guided 3-Pillar Experience */}
      <div className="pt-6 pb-12 border-t border-zinc-800/80">
        <div className="text-center mb-8">
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
            Guided Platform Architecture
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1 */}
          <Link
            href="/dashboard"
            className="clean-card p-5 group flex flex-col justify-between hover:bg-zinc-900/50 transition cursor-pointer"
          >
            <div>
              <span className="text-xs font-mono text-[#ED3968] font-semibold block mb-2">01 / IDENTITY</span>
              <h3 className="text-sm font-semibold text-white group-hover:text-[#ED3968] transition">
                On-Chain Handles
              </h3>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                Mint permanent ERC-721 usernames natively on Arc Mainnet. Portable, immutable, and censorship-resistant.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center text-xs text-[#ED3968] font-medium group-hover:translate-x-0.5 transition">
              <span>View Profile</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 text-[#ED3968]" />
            </div>
          </Link>

          {/* Card 2 */}
          <Link
            href="/predict"
            className="clean-card p-5 group flex flex-col justify-between hover:bg-zinc-900/50 transition cursor-pointer"
          >
            <div>
              <span className="text-xs font-mono text-[#ED3968] font-semibold block mb-2">02 / MARKETS</span>
              <h3 className="text-sm font-semibold text-white group-hover:text-[#ED3968] transition">
                Prediction Markets
              </h3>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                Trade on real-time price movements settled transparently with Pyth Network oracle feeds and native USDC stakes.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center text-xs text-[#ED3968] font-medium group-hover:translate-x-0.5 transition">
              <span>Explore Markets</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 text-[#ED3968]" />
            </div>
          </Link>

          {/* Card 3 */}
          <Link
            href="/discover"
            className="clean-card p-5 group flex flex-col justify-between hover:bg-zinc-900/50 transition cursor-pointer"
          >
            <div>
              <span className="text-xs font-mono text-[#ED3968] font-semibold block mb-2">03 / SOCIAL FEED</span>
              <h3 className="text-sm font-semibold text-white group-hover:text-[#ED3968] transition">
                Decentralized Media
              </h3>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                Publish images and posts stored on decentralized networks with verified creator provenance and privacy toggles.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center text-xs text-[#ED3968] font-medium group-hover:translate-x-0.5 transition">
              <span>Discover Posts</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 text-[#ED3968]" />
            </div>
          </Link>

        </div>
      </div>

      {/* Quiet Chain Specs Strip */}
      <div className="py-4 border-t border-zinc-900 flex flex-wrap items-center justify-between text-[11px] font-mono text-zinc-500 gap-2">
        <span>Network: Arc Mainnet</span>
        <span>Chain ID: 5042</span>
        <span>Native Currency: USDC (6 Decimals)</span>
        <span>Oracles: Pyth Network</span>
      </div>

    </div>
  );
};

export default MintUsername;