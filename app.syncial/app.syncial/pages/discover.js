import { useEffect, useState } from "react";
import { ethers } from "ethers";
import PostCard from "../components/PostCard"; // you already have this

// contract details
const CONTRACT_ADDRESS = "0xA46B02adA701EB34Ad9AC8feB786F575208a4c46";
const abi = [
  {
    "inputs": [],
    "name": "getAllPosts",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "address", "name": "author", "type": "address" },
          { "internalType": "string", "name": "image", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "internalType": "struct SocialPosts.Post[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export default function FeedPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function loadFeed() {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

        const allPosts = await contract.getAllPosts();

        console.log("Raw posts from contract:", allPosts);

        // Normalize data: convert BigInt -> string/number
        const formatted = allPosts.map((p) => ({
          id: Number(p.id), // or p.id.toString() if very large
          author: p.author,
          image: p.image,
          timestamp: Number(p.timestamp) * 1000 // ms for Date()
        }));

        setPosts(formatted);
      } catch (err) {
        console.error("Error loading feed:", err);
      }
    }

    loadFeed();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Discover </h1>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-white">No posts yet.</p>
        ) : (
          posts.map((post, index) => <PostCard key={index} post={post} />)
        )}
      </div>
    </div>
  );
}
