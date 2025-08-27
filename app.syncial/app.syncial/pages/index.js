import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import Navbar from '@/components/Navbar';
import SuccessModal from '@/components/SuccessModal';
import { ConnectButton } from '@rainbow-me/rainbowkit';

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
  const [showModal, setShowModal] = useState(false);
  const [existingUsername, setExistingUsername] = useState('');
  const { isConnected, address } = useAccount();

  useEffect(() => {
    if (isConnected && address) {
      checkIfAlreadyMinted();
    }
  }, [isConnected, address]);

  const checkIfAlreadyMinted = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const existing = await contract.getUsernameFromWallet(address);
      if (existing && existing.length > 0) {
        setExistingUsername(existing);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error checking username:", error);
    }
  };

  const mintUsername = async () => {
    if (!username) {
      setStatus('⚠️ Please enter a username.');
      return;
    }

    if (!isConnected || !address) {
      setStatus('Wallet not connected.');
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const available = await contract.isUsernameAvailable(username);
      if (!available) {
        setStatus('Username is already taken. Please try another.');
        return;
      }

      setStatus('Minting username...');
      const tx = await contract.mintUsername(username);
      await tx.wait();

      setStatus('✅ Username minted successfully!');
      setShowModal(true);
    } catch (error) {
      console.error(error);
      setStatus('❌ Error minting username.');
    }
  };

  return (
    <>

      {!isConnected ? (
        <div className="min-h-screen flex flex-col justify-center items-center bg-black text-white px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">Connect your wallet to continue</h1>
          <ConnectButton />
        </div>
      ) : (
        <>
          {showModal && (
            <SuccessModal
              onClose={() => setShowModal(false)}
              username={existingUsername || username}
            />
          )}

          <div className="flex justify-center items-center py-20 px-4">
            <div className="w-full max-w-md">
              <div className="text-white text-4xl md:text-6xl font-bold text-center">WELCOME TO</div>
              <p className="text-[#ED3968] text-4xl md:text-6xl font-bold text-center mt-2">SYNCIAL</p>

              <div className="text-rose-100 text-center text-sm md:text-md mt-4">
                Enter your preferred Username to create an account
              </div>

              <div className="flex justify-center py-4">
                <input
                  className="rounded-xl text-rose-100 px-4 py-2 bg-[#16030d] w-full text-lg outline outline-[#39071f]"
                  placeholder="Username"
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="text-rose-100 text-center text-sm mt-2">
                By signing up, you are agreeing to Syncial's
              </div>
              <p className="text-center text-[#ED3968] text-sm">Terms and Privacy Policy</p>

              <div className="flex justify-center py-4">
                <button
                  onClick={mintUsername}
                  className="bg-[#ED3968] hover:bg-rose-400 rounded-2xl text-lg font-semibold transition w-full py-3"
                >
                  Sign Up
                </button>
              </div>

              {status && (
                <div className="text-center text-white font-semibold py-2">
                  {status}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MintUsername;
