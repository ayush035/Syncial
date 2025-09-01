"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import Navbar from "../components/Navbar"; // adjust path if needed

const contractAddress = "0x0E51e917f9B397CF654Ad009B2b60ae2d7525b46"; 
const contractABI = [
  {
    "inputs": [{ "internalType": "address", "name": "_wallet", "type": "address" }],
    "name": "checkUsernameFromRainbow",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const Profile = () => {
  const { address, isConnected } = useAccount();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      resolveUsername(address);
    }
  }, [isConnected, address]);

  const resolveUsername = async (walletAddress) => {
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum); // v6
      const contract = new ethers.Contract(contractAddress, contractABI, provider);

      const resolvedUsername = await contract.checkUsernameFromRainbow(walletAddress);
      setUsername(resolvedUsername);
    } catch (err) {
      console.error("Error resolving username:", err);
      setUsername(""); // fallback if no username exists
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className=" my-8">
        <h1 className="text-[#ED3968] font-semibold text-lg">GM ☀️,</h1>
        {loading ? (
          <p>Loading your username...</p>
        ) : username ? (
          <div className="text-white text-5xl font-bold font-sans">{username}</div>
        ) : (
          <p className="text-white">No username found. Please mint one!</p>
        )}
      </div>
    </>
  );
};

export default Profile;

