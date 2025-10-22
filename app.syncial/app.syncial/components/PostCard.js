import { useState, useEffect, useRef } from 'react';
import {
  ExternalLink,
  Calendar,
  User,
  AlertCircle,
  MoreVertical,
  Trash2,
  Lock,
  Globe,
} from 'lucide-react';

export default function PostCard({ post, showAuthor = true, onDelete, onTogglePrivacy, isOwner = false }) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Debug logging
  useEffect(() => {
    console.log('PostCard props:', { 
      postId: post.id, 
      isOwner, 
      showAuthor,
      hasDelete: !!onDelete,
      hasTogglePrivacy: !!onTogglePrivacy,
      isPrivate: post.isPrivate,
      timestamp: post.timestamp
    });
  }, [post.id, isOwner, showAuthor, onDelete, onTogglePrivacy]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (timestamp) => {
    try {
      // Handle both unix timestamps (seconds) and milliseconds
      const ts = Number(timestamp);
      const date = ts > 10000000000 ? new Date(ts) : new Date(ts * 1000);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const formatRelativeTime = (timestamp) => {
    try {
      const now = new Date();
      // Handle both unix timestamps (seconds) and milliseconds
      const ts = Number(timestamp);
      const postDate = ts > 10000000000 ? new Date(ts) : new Date(ts * 1000);
      const diff = now - postDate;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return `${days}d ago`;
    } catch (e) {
      return 'Recently';
    }
  };

  const truncateAddress = (address) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Lighthouse gateway URL - support both 'image' and 'pieceCid' fields
  const ipfsHash = post.image || post.pieceCid;
  const imageUrl = ipfsHash ? `https://gateway.lighthouse.storage/ipfs/${ipfsHash}` : null;

  const handleImageLoad = () => setImageLoading(false);
  
  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const openInNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      if (onDelete) onDelete(post.id);
      setShowMenu(false);
    }
  };

  const handleTogglePrivacy = () => {
    if (onTogglePrivacy) onTogglePrivacy(post.id, post.isPrivate);
    setShowMenu(false);
  };

  const retryLoad = () => {
    setImageError(false);
    setImageLoading(true);
  };

  return (
    <div className="bg-black rounded-lg shadow-md overflow-hidden mb-6 outline outline-2 outline-[#39071f]">
      {/* Header */}
      <div className="px-4 py-3 outline outline-2 outline-[#39071f]">
        <div className="flex items-center justify-between">
          {/* Left side: Author info or timestamp */}
          {showAuthor ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#ED3968] rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">
                  {truncateAddress(post.author)}
                </p>
                <div className="flex items-center space-x-2 text-xs text-white mt-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatRelativeTime(post.timestamp)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>{formatRelativeTime(post.timestamp)}</span>
              </div>
              {post.isPrivate && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-[#39071f] rounded-md">
                  <Lock className="h-3 w-3 text-[#ED3968]" />
                  <span className="text-xs text-[#ED3968] font-medium">Private</span>
                </div>
              )}
            </div>
          )}

          {/* Right side: Private status & Three-dot menu */}
          <div className="flex items-center space-x-2">
            {showAuthor && post.isPrivate && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-[#39071f] rounded-md">
                <Lock className="h-3 w-3 text-[#ED3968]" />
                <span className="text-xs text-[#ED3968] font-medium">Private</span>
              </div>
            )}

            {/* Three-dot menu (only show for owner) */}
            {isOwner && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-[#39071f] rounded-lg transition-colors"
                  aria-label="Post options"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#0a0a0a] border-2 border-[#39071f] rounded-lg shadow-xl z-50 overflow-hidden">
                    <button
                      onClick={handleTogglePrivacy}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-white hover:bg-[#16030d] transition-colors"
                    >
                      {post.isPrivate ? (
                        <>
                          <Globe className="h-4 w-4 text-green-400" />
                          <span>Make Public</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 text-[#ED3968]" />
                          <span>Make Private</span>
                        </>
                      )}
                    </button>

                    <div className="border-t border-[#39071f]"></div>

                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-400 hover:bg-[#16030d] transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Post</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="relative bg-[#16030d] min-h-[300px] flex items-center justify-center">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ED3968]"></div>
              <p className="text-gray-400 text-sm">Loading from Lighthouse...</p>
            </div>
          </div>
        )}

        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={`Post ${post.id}`}
            className={`w-full h-auto max-h-[600px] object-contain transition-opacity duration-300 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-400 text-sm mb-2">Failed to load from Lighthouse</p>
            {ipfsHash && (
              <p className="text-xs text-gray-500 px-4 text-center mb-3 font-mono">
                IPFS: {ipfsHash.slice(0, 20)}...
              </p>
            )}
            <button
              onClick={retryLoad}
              className="text-xs text-[#ED3968] hover:text-white font-semibold hover:cursor-pointer underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-black">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Post #{post.id}</span>
            <span>•</span>
            <span>Stored on Lighthouse</span>
            <span>•</span>
            <span>{formatDate(post.timestamp)}</span>
          </div>
          {imageUrl && (
            <button
              onClick={() => openInNewTab(imageUrl)}
              className="text-[#ED3968] hover:text-white hover:cursor-pointer flex items-center space-x-1"
            >
              <ExternalLink className="h-3 w-3" />
              <span>View Original</span>
            </button>
          )}
        </div>
        
        {/* IPFS Hash */}
        {ipfsHash && (
          <div className="mt-2 text-xs text-gray-600 break-all font-mono">
            IPFS: {ipfsHash}
          </div>
        )}
      </div>
    </div>
  );
}