import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { RefreshCw, User } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import PostCard from '../components/PostCard';
import { getContractService } from '../lib/contract';
import toast from 'react-hot-toast';
import Username from '@/components/Username';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useReadContract } from 'wagmi';
import { SOCIAL_GRAPH_CONTRACT } from '@/lib/config3';
import FollowListModal from '../components/FollowListModal';

export default function Dashboard() {
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalPosts: 0, totalGlobal: 0 });
  const [contractService, setContractService] = useState(null);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const { data: followersArray } = useReadContract({
    address: SOCIAL_GRAPH_CONTRACT.address,
    abi: SOCIAL_GRAPH_CONTRACT.abi,
    functionName: 'getFollowers',
    args: [address],
    enabled: Boolean(address),
  });

  const { data: followingArray } = useReadContract({
    address: SOCIAL_GRAPH_CONTRACT.address,
    abi: SOCIAL_GRAPH_CONTRACT.abi,
    functionName: 'getFollowing',
    args: [address],
    enabled: Boolean(address),
  });

  const followerCount = followersArray?.length || 0;
  const followingCount = followingArray?.length || 0;

  useEffect(() => {
    if (isConnected && address && publicClient) {
      try {
        const service = getContractService(publicClient, walletClient);
        setContractService(service);
      } catch (error) {
        setContractService(null);
      }
    } else {
      setContractService(null);
    }
  }, [isConnected, address, publicClient, walletClient]);

  const loadUserPosts = async () => {
    if (!isConnected || !address || !contractService || loading) return;

    setLoading(true);
    try {
      const posts = await contractService.getUserPosts(address);
      const formatted = posts
        .filter((p) => !p.isDeleted)
        .map((p) => ({
          ...p,
          pieceCid: p.image,
          timestamp: p.timestampUnix * 1000,
        }))
        .sort((a, b) => b.timestampUnix - a.timestampUnix);

      setUserPosts(formatted);

      const totalGlobal = await contractService.getTotalPosts();
      setStats({
        totalPosts: formatted.length,
        totalGlobal,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contractService) {
      loadUserPosts();
    }
  }, [contractService]);

  const handleDeletePost = async (postId) => {
    if (!contractService) return;
    const toastId = toast.loading('Deleting...');
    try {
      const result = await contractService.deletePost(postId);
      if (result.success) {
        toast.success('Deleted', { id: toastId });
        setUserPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    } catch {
      toast.error('Failed to delete', { id: toastId });
    }
  };

  const handleTogglePrivacy = async (postId, currentPrivacy) => {
    if (!contractService) return;
    const newPrivacy = !currentPrivacy;
    const toastId = toast.loading('Updating...');
    try {
      const result = await contractService.setPostPrivacy(postId, newPrivacy);
      if (result.success) {
        toast.success('Updated', { id: toastId });
        setUserPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, isPrivate: newPrivacy } : p))
        );
      }
    } catch {
      toast.error('Failed to update', { id: toastId });
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="clean-card p-8 max-w-sm w-full text-center space-y-4">
          <div className="w-11 h-11 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center mx-auto">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white">Your Arc Dashboard</h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto leading-relaxed">
              Connect your wallet on Arc Mainnet to view your identity, manage followers, and update post privacy.
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <ConnectButton chainStatus="none" />
          </div>
          <div className="pt-3 border-t border-zinc-800/80 text-[11px] font-mono text-zinc-500">
            Network: Arc Mainnet (5042)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 max-w-2xl mx-auto">
      {/* Profile Header */}
      <Username />

      {/* Subtle Stats Row */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <div className="clean-card p-3 text-center">
          <span className="text-[11px] text-zinc-500 block">Posts</span>
          <span className="text-base font-semibold text-white">{stats.totalPosts}</span>
        </div>
        <div className="clean-card p-3 text-center">
          <span className="text-[11px] text-zinc-500 block">Network</span>
          <span className="text-base font-semibold text-white">{stats.totalGlobal}</span>
        </div>
        <button
          onClick={() => setShowFollowersModal(true)}
          className="clean-card p-3 text-center hover:bg-zinc-800/50 transition cursor-pointer"
        >
          <span className="text-[11px] text-zinc-500 block">Followers</span>
          <span className="text-base font-semibold text-white">{followerCount}</span>
        </button>
        <button
          onClick={() => setShowFollowingModal(true)}
          className="clean-card p-3 text-center hover:bg-zinc-800/50 transition cursor-pointer"
        >
          <span className="text-[11px] text-zinc-500 block">Following</span>
          <span className="text-base font-semibold text-white">{followingCount}</span>
        </button>
      </div>

      {/* Upload Component */}
      <ImageUpload onUploadSuccess={() => loadUserPosts()} />

      {/* Posts Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-white">
            Your Posts ({userPosts.length})
          </h2>
          <button
            onClick={() => loadUserPosts()}
            disabled={loading}
            className="flex items-center space-x-1 text-xs text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading && userPosts.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500">
            Loading your posts...
          </div>
        ) : userPosts.length === 0 ? (
          <div className="clean-card p-8 text-center text-xs text-zinc-500">
            No posts yet. Share your first image above.
          </div>
        ) : (
          <div className="space-y-4">
            {userPosts.map((post) => (
              <PostCard
                key={`${post.id}-${post.timestampUnix}`}
                post={post}
                showAuthor={false}
                isOwner={true}
                onDelete={handleDeletePost}
                onTogglePrivacy={handleTogglePrivacy}
              />
            ))}
          </div>
        )}
      </div>

      <FollowListModal
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        title="Followers"
        addresses={followersArray}
      />
      <FollowListModal
        isOpen={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
        title="Following"
        addresses={followingArray}
      />
    </div>
  );
}