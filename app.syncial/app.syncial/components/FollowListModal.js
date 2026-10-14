import { X } from 'lucide-react';
import { useReadContract } from 'wagmi';
import { USERNAME_CONTRACT } from '@/lib/username_congif';

function UserListItem({ address }) {
  const { data: username } = useReadContract({
    address: USERNAME_CONTRACT.address,
    abi: USERNAME_CONTRACT.abi,
    functionName: 'getUsernameFromWallet',
    args: [address],
    enabled: Boolean(address),
  });

  const displayName = username ? `@${username}` : (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '');

  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs">
      <span className="font-medium text-white">{displayName}</span>
      <span className="font-mono text-[10px] text-zinc-500">
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </span>
    </div>
  );
}

export default function FollowListModal({ isOpen, onClose, title, addresses }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#121215] border border-zinc-800 rounded-2xl w-full max-w-sm max-h-[70vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-white">
            {title} ({addresses?.length || 0})
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {addresses && addresses.length > 0 ? (
            addresses.map((address, index) => (
              <UserListItem key={`${address}-${index}`} address={address} />
            ))
          ) : (
            <div className="text-center py-8 text-xs text-zinc-500">
              {title === 'Followers' ? 'No followers yet' : 'Not following anyone yet'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}