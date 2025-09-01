// lib/contract.js
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./config.js";

class ContractService {
  constructor() {}

  // Get provider from user's wallet
  async _getProvider() {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error(
        "No wallet provider found (MetaMask/Rainbow not detected)"
      );
    }
    return new ethers.BrowserProvider(window.ethereum); // v6
  }

  // Create a new post
  async createPost(imageRootHash) {
    const provider = await this._getProvider();
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    const tx = await contract.createPost(imageRootHash);
    const receipt = await tx.wait();
    return {
      hash: tx.hash,
      receipt,
      success: receipt.status === 1,
    };
  }

  // Get posts of a user
  async getUserPosts() {
    const provider = await this._getProvider();
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  
    // Call getMyPosts WITHOUT any argument
    const posts = await contract.getMyPosts();
  
    // Map the posts
    return posts.map((post) => ({
      id: post.id.toString(),
      author: post.author,
      image: post.image,
      timestamp: new Date(Number(post.timestamp) * 1000),
      timestampUnix: Number(post.timestamp),
    }));
  }
  

  // Get total posts
  async getTotalPosts() {
    const provider = await this._getProvider();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const total = await contract.totalPosts();
    return Number(total);
  }
}

// Factory to get instance safely in browser
export function getContractService() {
  if (typeof window === "undefined") {
    throw new Error("ContractService can only be used in the browser");
  }
  return new ContractService();
}
