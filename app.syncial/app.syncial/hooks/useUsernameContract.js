import { USERNAME_CONTRACT } from '@/lib/username_congif';

const USERNAME_CONTRACT_ADDRESS = USERNAME_CONTRACT.address;

const USERNAME_ABI = [
  {
    inputs: [{ internalType: "address", name: "_wallet", type: "address" }],
    name: "getUsernameFromWallet",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "string", name: "username", type: "string" }],
    name: "usernames",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  }
];

export const useUsernameContract = () => {
  return {
    contractAddress: USERNAME_CONTRACT_ADDRESS,
    abi: USERNAME_ABI
  };
};