import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi'; // To check wallet connection
import Navbar from '@/components/Navbar';


const contractAddress = "0x213dBCCe2A6af7F5f1a4d15CE4950eb4006B1D2F";
const contractABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "string", "name": "username", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "UsernameMinted",
    "type": "event"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_wallet", "type": "address" }],
    "name": "checkUsernameFromRainbow",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_wallet", "type": "address" }],
    "name": "getUsernameFromWallet",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "_username", "type": "string" }],
    "name": "isUsernameAvailable",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "_username", "type": "string" }],
    "name": "mintUsername",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "name": "usernames",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "walletToUsername",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  }
];


const MintUsername = () => {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState('');
  const { isConnected, address } = useAccount();

  const mintUsername = async () => {
    if (!username) {
      setStatus('⚠️ Please enter a username.');
      return;
    }

    if (!isConnected || !address) {
      setStatus(' Wallet not connected.');
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // Check username availability
      const available = await contract.isUsernameAvailable(username);

      if (!available) {
        setStatus(' Username is already taken. Please try another.');
        return;
      }

      // Proceed to mint
      setStatus('Minting username');
      const tx = await contract.mintUsername(username);
      await tx.wait();

      setStatus('Username minted successfully!');
    } catch (error) {
      console.error(error);
      setStatus('Error minting username.');
    }
  };

  return (
    <>
      <Navbar />

      <div className="flex justify-center items-center py-26">
        <div>
          <div className="text-white text-7xl font-bold">WELCOME TO</div>

          <p className="text-[#ED3968] text-7xl font-bold px-22">SYNCIAL</p>

          <div className="text-rose-100 text-md px-14 my-2">
            Enter your preferred Username to create an account
          </div>

          <div className="flex justify-center py-4">
            <input
              className="rounded-xl text-rose-100 px-4 py-2 bg-[#16030d] w-120 h-13 text-lg outline-1 outline-[#39071f]"
              placeholder="Username"
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="text-rose-100 text-md mx-24">
            By signing up, you are agreeing to Syncial's
          </div>
          <p className="px-38 text-[#ED3968]">Terms and Privacy Policy</p>

          <div className="flex justify-center py-4">
            <button
              onClick={mintUsername}
              className="inline-block bg-[#ED3968] hover:bg-rose-400 rounded-2xl text-lg font-semibold transition w-120 h-13 cursor-pointer"
            >
              Sign Up
            </button>
          </div>

          {status && (
            <div className="flex justify-center text-white font-semibold py-2">
              {status}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MintUsername;
