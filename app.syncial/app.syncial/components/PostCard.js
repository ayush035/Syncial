import { useState, useRef, useEffect } from 'react';
import {
  ExternalLink,
  MoreVertical,
  Trash2,
  Lock,
  Globe,
  Heart,
  Copy,
  Check,
  User,
} from 'lucide-react';
import { useUsername } from '@/hooks/useUsername';
import toast from 'react-hot-toast';

export default function PostCard({
  post,
  showAuthor = true,
  onDelete,
  onTogglePrivacy,
  isOwner = false,
}) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(() => (post.id ? (Number(post.id) * 3) % 11 + 1 : 1));
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);

  const { username: authorUsername } = useUsername(post.author);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatRelativeTime = (timestamp) => {
    try {
      const now = Date.now();
      const ts = Number(timestamp);
      const postDate = ts > 1e12 ? ts : ts * 1000;
      const diff = now - postDate;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return `${days}d ago`;
    } catch {
      return '';
    }
  };

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const rawImage = post.image || post.pieceCid;
  const isDirectUrl = Boolean(
    rawImage && (rawImage.startsWith('http://') || rawImage.startsWith('https://') || rawImage.startsWith('/'))
  );

  const gateways = rawImage && !isDirectUrl ? [
    `https://gateway.lighthouse.storage/ipfs/${rawImage}`,
    `https://ipfs.io/ipfs/${rawImage}`,
    `https://cf-ipfs.com/ipfs/${rawImage}`,
  ] : [];

  const [gatewayIdx, setGatewayIdx] = useState(0);
  const imageUrl = rawImage
    ? isDirectUrl
      ? rawImage
      : (gateways[gatewayIdx] || gateways[0])
    : null;

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!rawImage) return;
    navigator.clipboard.writeText(rawImage);
    setCopied(true);
    toast.success('Hash copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="clean-card overflow-hidden">
      {/* Header */}
      <div className="p-3.5 flex items-center justify-between border-b border-zinc-800/80">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-[#ED3968]/10 text-[#ED3968] border border-[#ED3968]/30 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-white text-xs sm:text-sm">
                {authorUsername ? `@${authorUsername}` : truncateAddress(post.author)}
              </span>
              {authorUsername && (
                <span className="text-[10px] text-zinc-400 font-mono">
                  ({truncateAddress(post.author)})
                </span>
              )}
            </div>
            <span className="text-[11px] text-zinc-500">
              {formatRelativeTime(post.timestamp)}
            </span>
          </div>
        </div>

        {/* Right Status / Menu */}
        <div className="flex items-center space-x-2">
          {post.isPrivate && (
            <span className="text-[10px] text-[#ED3968] bg-[#ED3968]/10 border border-[#ED3968]/20 px-2 py-0.5 rounded flex items-center space-x-1">
              <Lock className="w-3 h-3" />
              <span>Private</span>
            </span>
          )}

          {isOwner && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded text-zinc-500 hover:text-white"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 w-36 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg z-30 py-1 text-xs">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onTogglePrivacy?.(post.id, post.isPrivate);
                    }}
                    className="w-full px-3 py-1.5 text-left text-zinc-300 hover:bg-zinc-800 flex items-center space-x-2"
                  >
                    {post.isPrivate ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>{post.isPrivate ? 'Make Public' : 'Make Private'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      if (window.confirm('Delete post?')) onDelete?.(post.id);
                    }}
                    className="w-full px-3 py-1.5 text-left text-rose-400 hover:bg-zinc-800 flex items-center space-x-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Container */}
      <div className="relative bg-black flex items-center justify-center min-h-[260px] max-h-[500px]">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-500">
            Loading...
          </div>
        )}

        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={`Post ${post.id}`}
            loading="lazy"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              if (!isDirectUrl && gatewayIdx < gateways.length - 1) {
                setGatewayIdx(prev => prev + 1);
              } else {
                setImageLoading(false);
                setImageError(true);
              }
            }}
            className={`w-full h-auto max-h-[500px] object-contain transition-opacity ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
          />
        ) : (
          <div className="p-8 text-center text-xs text-zinc-500">
            Image unavailable
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800/80">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setIsLiked(!isLiked);
              setLikeCount((c) => (isLiked ? c - 1 : c + 1));
            }}
            className={`flex items-center space-x-1 cursor-pointer ${
              isLiked ? 'text-rose-400' : 'hover:text-white'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likeCount}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 hover:text-white transition cursor-pointer"
            title="Copy CID"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="font-mono text-[11px]">{ipfsHash ? `${ipfsHash.slice(0, 6)}...` : 'CID'}</span>
          </button>
        </div>

        {imageUrl && (
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white flex items-center space-x-1"
          >
            <span>Open</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}