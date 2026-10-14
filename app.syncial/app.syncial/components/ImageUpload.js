import { useState } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { Upload, X, Lock, Globe } from 'lucide-react';
import lighthouse from '@lighthouse-web3/sdk';
import { getContractService } from '@/lib/contract';
import toast from 'react-hot-toast';

const LIGHTHOUSE_API_KEY = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY || "6456139b.ae52e2f7b68e4b459ded2bd267a5df4e";

export default function ImageUpload({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    } else {
      toast.error('Please select an image file');
    }
  };

  const uploadPost = async () => {
    if (!selectedFile || !address) return;
    setUploading(true);
    const toastId = toast.loading('Uploading to IPFS...');

    try {
      const uploadResponse = await lighthouse.upload(
        [selectedFile],
        LIGHTHOUSE_API_KEY
      );

      const ipfsHash = uploadResponse.data?.Hash || uploadResponse.Hash;
      if (!ipfsHash) {
        throw new Error('No IPFS hash returned');
      }

      toast.loading('Publishing to Arc...', { id: toastId });
      const contractService = getContractService(publicClient, walletClient);
      const result = await contractService.createPost(ipfsHash, isPrivate);

      if (result.success) {
        toast.success('Post published!', { id: toastId });
        setSelectedFile(null);
        setIsPrivate(false);
        onUploadSuccess?.();
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.shortMessage || error.message || 'Upload failed', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  if (!isConnected) return null;

  return (
    <div className="clean-card p-4 sm:p-5 mb-6 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">New Post</h2>
        <span className="text-xs text-zinc-500 font-mono">Arc • IPFS</span>
      </div>

      {!selectedFile ? (
        <div
          className={`border border-dashed rounded-xl p-6 text-center transition cursor-pointer ${
            dragActive
              ? 'border-[#ED3968] bg-[#ED3968]/5'
              : 'border-zinc-800 hover:border-[#ED3968]/40 bg-zinc-900/30'
          }`}
          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
          }}
        >
          <label htmlFor="file-upload" className="cursor-pointer block text-xs text-zinc-400">
            <span>Drag & drop an image or <span className="text-[#ED3968] font-medium underline">browse</span></span>
            <span className="block text-[11px] text-zinc-500 mt-1">PNG, JPG, WebP up to 10MB</span>
          </label>
          <input
            id="file-upload"
            type="file"
            className="sr-only"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden bg-black max-h-60 flex items-center justify-center">
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Preview"
              className="max-h-60 w-auto object-contain"
            />
            <button
              onClick={() => setSelectedFile(null)}
              className="absolute top-2 right-2 p-1 rounded-md bg-zinc-900/80 text-white hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
            <div className="flex items-center space-x-1.5">
              {isPrivate ? <Lock className="w-3.5 h-3.5 text-zinc-300" /> : <Globe className="w-3.5 h-3.5 text-zinc-300" />}
              <span>{isPrivate ? 'Private post' : 'Public post'}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsPrivate(!isPrivate)}
              className="text-xs text-white hover:underline cursor-pointer"
            >
              Switch to {isPrivate ? 'Public' : 'Private'}
            </button>
          </div>

          <button
            onClick={uploadPost}
            disabled={uploading}
            className="w-full py-2 btn-primary text-xs disabled:opacity-40 cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? 'Publishing...' : 'Publish Post'}</span>
          </button>
        </div>
      )}
    </div>
  );
}