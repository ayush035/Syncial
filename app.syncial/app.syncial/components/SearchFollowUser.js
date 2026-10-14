import { useState, useEffect, useRef } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useUsernameContract } from '../hooks/useUsernameContract';
import { useSocialGraphContract, useIsFollowing } from '../hooks/useSocialGraphContract';
import { Search, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UsernameSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const dropdownRef = useRef(null);

  const { address: currentUserAddress, isConnected } = useAccount();
  const { contractAddress: usernameContractAddress, abi: usernameAbi } = useUsernameContract();
  const { followUser, unfollowUser, isConfirming, isPending } = useSocialGraphContract();

  const { data: walletAddress, refetch: refetchWallet } = useReadContract({
    address: usernameContractAddress,
    abi: usernameAbi,
    functionName: 'usernames',
    args: [searchQuery.trim().toLowerCase()],
    enabled: false,
  });

  const { data: verifiedUsername, refetch: refetchUsername } = useReadContract({
    address: usernameContractAddress,
    abi: usernameAbi,
    functionName: 'getUsernameFromWallet',
    args: [walletAddress],
    enabled: false,
  });

  const { isFollowing, refetch: refetchFollowStatus } = useIsFollowing(
    currentUserAddress,
    searchResult?.address
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchResult(null);
      return;
    }

    setSearching(true);
    setShowDropdown(true);

    try {
      const { data: wallet } = await refetchWallet();
      if (wallet && wallet !== '0x0000000000000000000000000000000000000000') {
        const { data: uName } = await refetchUsername();
        setSearchResult({
          username: uName || q,
          address: wallet,
          isCurrentUser: wallet.toLowerCase() === currentUserAddress?.toLowerCase(),
        });
        if (currentUserAddress) {
          await refetchFollowStatus();
        }
      } else {
        setSearchResult({ error: 'User not found' });
      }
    } catch {
      setSearchResult({ error: 'Search failed' });
    } finally {
      setSearching(false);
    }
  };

  const handleFollowToggle = async (e) => {
    e.stopPropagation();
    if (!isConnected) {
      toast.error('Connect wallet first');
      return;
    }

    if (!searchResult?.address || searchResult.isCurrentUser) return;

    const toastId = toast.loading(isFollowing ? 'Unfollowing...' : 'Following...');
    try {
      if (isFollowing) {
        await unfollowUser(searchResult.address);
        toast.success(`Unfollowed @${searchResult.username}`, { id: toastId });
      } else {
        await followUser(searchResult.address);
        toast.success(`Following @${searchResult.username}`, { id: toastId });
      }
      setTimeout(() => refetchFollowStatus(), 1000);
    } catch {
      toast.error('Action failed', { id: toastId });
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative flex items-center">
        <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search @handle"
          className="w-40 sm:w-52 bg-zinc-900 border border-zinc-800 focus:border-zinc-600 rounded-lg py-1.5 pl-8 pr-7 text-xs text-white placeholder-zinc-500 outline-none transition"
        />
        {searchQuery ? (
          <button
            onClick={() => {
              setSearchQuery('');
              setSearchResult(null);
              setShowDropdown(false);
            }}
            className="absolute right-2 text-zinc-500 hover:text-white"
          >
            <X className="w-3 h-3" />
          </button>
        ) : null}
      </div>

      {showDropdown && (
        <div
          className="absolute top-full mt-1.5 right-0 bg-[#121215] border border-zinc-800 rounded-xl shadow-xl z-50 min-w-[280px] p-2.5 text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          {searching ? (
            <div className="py-4 text-center text-zinc-500 flex items-center justify-center space-x-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Searching...</span>
            </div>
          ) : searchResult?.error ? (
            <div className="py-2.5 text-center text-zinc-500">
              {searchResult.error}
            </div>
          ) : searchResult ? (
            <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60">
              <div className="min-w-0 pr-2">
                <div className="font-semibold text-white truncate">
                  @{searchResult.username}
                </div>
                <div className="text-[10px] font-mono text-zinc-500 truncate">
                  {searchResult.address.slice(0, 6)}...{searchResult.address.slice(-4)}
                </div>
              </div>

              {!searchResult.isCurrentUser && (
                <button
                  type="button"
                  onClick={handleFollowToggle}
                  disabled={isPending || isConfirming || !isConnected}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                    isFollowing
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-[#ED3968] text-white hover:bg-[#F45B82]'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}