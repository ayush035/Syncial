import { useEffect, useState } from "react";
import { useWalletClient } from "wagmi";
import { ethers } from "ethers";
import { USERNAME_CONTRACT } from "@/lib/username_congif";

// Public RPC endpoint for Arc Mainnet
const PUBLIC_RPC = "https://rpc.mainnet.arc.io";

// Cache to avoid repeated calls for the same address
const usernameCache = new Map();

export function useUsername(walletAddress) {
  const { data: walletClient } = useWalletClient();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!walletAddress) {
      setUsername("");
      return;
    }

    // Check cache first
    if (usernameCache.has(walletAddress.toLowerCase())) {
      setUsername(usernameCache.get(walletAddress.toLowerCase()));
      return;
    }

    resolveUsername(walletAddress);
  }, [walletAddress, walletClient]);

  const resolveUsername = async (address) => {
    setLoading(true);
    try {
      let provider;

      if (walletClient) {
        provider = new ethers.BrowserProvider(walletClient.transport);
      } else {
        provider = new ethers.JsonRpcProvider(PUBLIC_RPC);
      }

      const contract = new ethers.Contract(USERNAME_CONTRACT.address, USERNAME_CONTRACT.abi, provider);
      const resolvedUsername = await contract.checkUsernameFromRainbow(address);

      const result = resolvedUsername || "";
      usernameCache.set(address.toLowerCase(), result);
      setUsername(result);
    } catch (err) {
      usernameCache.set(address.toLowerCase(), "");
      setUsername("");
    } finally {
      setLoading(false);
    }
  };

  return { username, loading };
}