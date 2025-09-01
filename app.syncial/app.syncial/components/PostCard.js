import { useState } from 'react';
import { ExternalLink, Calendar, User, AlertCircle } from 'lucide-react';
import { zgStorage } from '../lib/0g-storage';

export default function PostCard({ post, showAuthor = true }) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const truncateAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const imageUrl = zgStorage.getImageUrl(post.image);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const openInNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-black rounded-lg shadow-md overflow-hidden mb-6  outline outline-2 outline-[#39071f]">
      {/* Header */}
      {showAuthor && (
        <div className="px-4 py-3 outline outline-2 outline-[#39071f]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  {truncateAddress(post.author)}
                </p>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>{formatRelativeTime(post.timestamp)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                #{post.id}
              </span>
              <button
                onClick={() => openInNewTab(`https://chainscan-newton.0g.ai/`)}
                className="text-gray-400 hover:text-gray-600"
                title="View on Explorer"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Image */}
      <div className="relative bg-[#16030d]">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {!imageError ? (
          <img
            src={imageUrl}
            alt={`Post ${post.id}`}
            className={`w-full h-auto max-h-96 object-cover transition-opacity duration-300 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-48 bg-[#16030d] flex flex-col items-center justify-center">
            <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-gray-500 text-sm">Failed to load from 0G Storage</p>
            <p className="text-xs text-gray-400 mt-1 px-4 text-center">
              Root Hash: {post.image.slice(0, 16)}...
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-[#ED3968] hover:text-white mt-2 font-semibold hover:cursor-pointer"
            >
              Retry Loading
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-black">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Stored on 0G Network</span>
            <span>•</span>
            <span>{formatDate(post.timestamp)}</span>
          </div>
          <button
            onClick={() => openInNewTab(imageUrl)}
            className="text-[#ED3968] hover:text-white hover:cursor-pointer flex items-center space-x-1"
          >
            <ExternalLink className="h-3 w-3" />
            <span>View Original</span>
          </button>
        </div>
      </div>
    </div>
  );
}