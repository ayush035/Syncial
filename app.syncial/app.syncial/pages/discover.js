import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { ethers } from "ethers";
import PostCard from "../components/PostCard";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/config";
import { RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export default function FeedPage() {
  const publicClient = usePublicClient();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeed();
  }, [publicClient]);

  const loadFeed = async () => {
    setLoading(true);
    try {
      let provider;
      if (publicClient) {
        provider = new ethers.JsonRpcProvider(
          publicClient.transport.url || publicClient.chain.rpcUrls.default.http[0]
        );
      } else {
        provider = new ethers.JsonRpcProvider("https://rpc.mainnet.arc.io");
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const allPosts = await contract.getAllPosts();

      const formatted = allPosts
        .filter((p) => !p.isDeleted && !p.isPrivate)
        .map((p) => ({
          id: Number(p.id),
          author: p.author,
          image: p.image,
          timestamp: Number(p.timestamp) * 1000,
          isPrivate: p.isPrivate,
          isDeleted: p.isDeleted,
        }))
        .sort((a, b) => b.timestamp - a.timestamp);

      setPosts(formatted);
    } catch (err) {
      console.error("Error loading feed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Discover</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Public feed on Arc Mainnet
          </p>
        </div>

        <button
          onClick={() => {
            loadFeed();
            toast.success("Feed refreshed");
          }}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stream */}
      {loading ? (
        <div className="py-16 text-center text-xs text-zinc-500">
          Loading posts...
        </div>
      ) : posts.length === 0 ? (
        <div className="clean-card p-10 text-center space-y-3">
          <h3 className="text-sm font-semibold text-white">No public posts</h3>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            Be the first to share an image to the Syncial network.
          </p>
          <a href="/dashboard" className="inline-block py-2 px-4 btn-primary text-xs">
            Create Post
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} showAuthor={true} isOwner={false} />
          ))}
        </div>
      )}
    </div>
  );
}
