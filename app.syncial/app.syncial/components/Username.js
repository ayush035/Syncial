"use client";
import { useEffect, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import { USERNAME_CONTRACT } from "@/lib/username_congif";

const PUBLIC_RPC = "https://rpc.mainnet.arc.io";

export default function Profile() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      resolveUsername(address);
    } else {
      setUsername("");
    }
  }, [address, walletClient]);

  const resolveUsername = async (walletAddress) => {
    setLoading(true);
    try {
      let provider;
      if (walletClient) {
        provider = new ethers.BrowserProvider(walletClient.transport);
      } else {
        provider = new ethers.JsonRpcProvider(PUBLIC_RPC);
      }

      const contract = new ethers.Contract(USERNAME_CONTRACT.address, USERNAME_CONTRACT.abi, provider);
      const resolved = await contract.checkUsernameFromRainbow(walletAddress);
      setUsername(resolved || "");
    } catch {
      setUsername("");
    } finally {
      setLoading(false);
    }
  };

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  return (
    <div className="flex items-center justify-between pb-6 border-b border-zinc-800 mb-6">
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-white">
            GM, <span className="text-[#ED3968]">{loading ? "..." : username ? `@${username}` : (shortAddress || "Connected Wallet")}</span>
          </h1>
          {username && (
            <span className="text-[11px] text-[#ED3968] bg-[#ED3968]/10 border border-[#ED3968]/20 px-2 py-0.5 rounded">
              Verified
            </span>
          )}
        </div>
        {address && (
          <p className="text-xs font-mono text-zinc-500 mt-0.5">
            {address}
          </p>
        )}
      </div>
    </div>
  );
}
