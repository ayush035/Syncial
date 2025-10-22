import { useState } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { Upload, X, Image as ImageIcon, Lock, Globe } from 'lucide-react';
import lighthouse from '@lighthouse-web3/sdk';
import { getContractService } from '@/lib/contract';
import toast from 'react-hot-toast';

const LIGHTHOUSE_API_KEY = "6456139b.ae52e2f7b68e4b459ded2bd267a5df4e"; // 🔑 Replace with env variable later

export default function ImageUpload({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  // Handle file selection
  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    } else {
      toast.error('Please select a valid image file');
    }
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Upload workflow with Lighthouse
  const uploadPost = async () => {
    if (!selectedFile || !address) {
      toast.error('Please select a file and ensure wallet is connected');
      return;
    }
  
    if (!publicClient) {
      toast.error('Wallet connection not ready. Please try again.');
      return;
    }
  
    setUploading(true);
    const loadingToast = toast.loading('Preparing upload...');
  
    try {
      // Step 1: Upload image to Lighthouse
      toast.loading('Uploading image to Lighthouse...', { id: loadingToast });
      console.log('Starting upload for file:', selectedFile.name);
  
      // Try the updated SDK method signature
      const uploadResponse = await lighthouse.upload(
        [selectedFile],
        LIGHTHOUSE_API_KEY
      );
  
      console.log('Lighthouse upload result:', uploadResponse);
  
      // Handle different response formats
      const ipfsHash = uploadResponse.data?.Hash || uploadResponse.Hash;
      
      if (!ipfsHash) {
        throw new Error('No IPFS hash returned from Lighthouse');
      }
  
      const gatewayUrl = `https://gateway.lighthouse.storage/ipfs/${ipfsHash}`;
  
      // Step 2: Call contract with IPFS hash and privacy setting
      toast.loading('Creating post on blockchain...', { id: loadingToast });
      const contractService = getContractService(publicClient, walletClient);
      
      // Pass isPrivate parameter to createPost
      const contractResult = await contractService.createPost(ipfsHash, isPrivate);
  
      console.log('Contract transaction successful:', contractResult);
  
      if (contractResult.success) {
        toast.success(`Post created successfully! ${isPrivate ? '(Private)' : '(Public)'}`, { id: loadingToast });
        
        setSelectedFile(null);
        setIsPrivate(false); // Reset privacy toggle
  
        if (onUploadSuccess) {
          onUploadSuccess({
            ipfsHash,
            gatewayUrl,
            contractTx: contractResult.hash,
            postCreated: true,
            isPrivate
          });
        }
      } else {
        throw new Error('Transaction failed');
      }
  
    } catch (error) {
      console.error('Upload failed:', error);
      console.error('Error details:', error.response?.data || error.message);
  
      let errorMessage = 'Upload failed';
      
      // Check for specific Lighthouse errors
      if (error.response?.status === 400) {
        errorMessage = 'Invalid upload request. Please check your API key or try a different file.';
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = 'API key is invalid or expired. Please generate a new one.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Rate limit exceeded. Please wait and try again.';
      } else if (error.message.includes('wallet provider')) {
        errorMessage = 'Wallet connection issue. Please reconnect and try again.';
      } else if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction cancelled by user';
      } else if (error.message) {
        errorMessage = `Upload failed: ${error.message}`;
      }
  
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setIsPrivate(false); // Reset when removing file
  };

  if (!isConnected) {
    return (
      <div className="bg-[#16030d] outline outline-2 outline-[#39071f] rounded-lg shadow-md p-6 mb-6">
        <div className="text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-white">Connect Wallet</h3>
          <p className="mt-1 text-sm text-gray-400">
            Connect your wallet to start sharing images
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#16030d] outline outline-2 outline-[#39071f] rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 flex items-center text-white">
        <Upload className="mr-2 h-5 w-5" />
        Create New Post
      </h2>
      
      <div className="space-y-4">
        {!selectedFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-[#ED3968]' 
                : 'border-rose-100 hover:border-[#ED3968]'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-rose-100">
                  Drop an image here, or click to select
                </span>
                <span className="mt-1 block text-xs text-rose-100">
                  PNG, JPG, GIF up to 10MB
                </span>
              </label>
              <input
                id="file-upload"
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={removeFile}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-400">
                <p className="font-medium">{selectedFile.name}</p>
                <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>

            {/* Privacy Toggle */}
            <div className="bg-[#0a0a0a] border border-[#39071f] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isPrivate ? (
                    <Lock className="h-5 w-5 text-[#ED3968]" />
                  ) : (
                    <Globe className="h-5 w-5 text-green-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">
                      {isPrivate ? 'Private Post' : 'Public Post'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {isPrivate 
                        ? 'Only you can see this post' 
                        : 'Everyone can see this post'}
                    </p>
                  </div>
                </div>
                
                {/* Toggle Switch */}
                <button
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#ED3968] focus:ring-offset-2 focus:ring-offset-[#16030d] ${
                    isPrivate ? 'bg-[#ED3968]' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isPrivate ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedFile && (
          <button
            onClick={uploadPost}
            disabled={uploading || !publicClient}
            className="w-full bg-[#ED3968] text-white py-3 px-4 rounded-lg hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Share to Blockchain</span>
              </>
            )}
          </button>
        )}
        
        {selectedFile && !uploading && (
          <div className="text-xs text-gray-500 text-center">
            Your image will be stored on <span className="text-[#ED3968]">Lighthouse</span> and linked to your wallet
          </div>
        )}
      </div>
    </div>
  );
}