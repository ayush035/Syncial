const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const ARC_RPC_URL = 'https://rpc.mainnet.arc.io';
const ARC_CHAIN_ID = 5042;

const config2 = require('../lib/config2.js');
const postConfig = require('../lib/config.js');
const PRED_ABI = require('../abi/PredictionMarketplace.json');
const POST_ABI = postConfig.CONTRACT_ABI;

const PRED_ADDRESS = config2.PREDICTION_MARKET_ADDRESS;
const POST_ADDRESS = postConfig.CONTRACT_ADDRESS;

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/ARC_DEPLOYER_PRIVATE_KEY=(0x[a-fA-F0-9]{64}|[a-fA-F0-9]{64})/);
const privateKey = match ? (match[1].startsWith('0x') ? match[1] : '0x' + match[1]) : null;

async function populateData() {
  console.log('====================================================');
  console.log('       Syncial - Populate Arc Mainnet On-Chain Data ');
  console.log('====================================================\n');

  if (!privateKey) {
    console.error('No private key found in .env.local');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(ARC_RPC_URL, {
    chainId: ARC_CHAIN_ID,
    name: 'arc-mainnet',
  });

  const wallet = new ethers.Wallet(privateKey, provider);
  console.log(`📡 Connected to Arc Mainnet (${ARC_RPC_URL})`);
  console.log(`👤 Using Account: ${wallet.address}`);

  const balance = await provider.getBalance(wallet.address);
  console.log(`💰 Available Balance: ${ethers.formatUnits(balance, 18)} USDC\n`);

  const predContract = new ethers.Contract(PRED_ADDRESS, PRED_ABI, wallet);
  const postContract = new ethers.Contract(POST_ADDRESS, POST_ABI, wallet);

  // 1. Create Prediction Markets
  console.log('--- Step 1: Creating Diverse Prediction Markets ---');
  const marketsToCreate = [
    {
      question: 'Will Bitcoin break above $85,000 this month?',
      duration: 86400 * 14, // 14 days
      priceFeed: config2.PRICE_FEEDS.BTC_USD,
      targetPrice: 8500000000000n, // $85,000.00
    },
    {
      question: 'Will Solana surge past $120 before next Friday?',
      duration: 86400 * 7, // 7 days
      priceFeed: config2.PRICE_FEEDS.SOL_USD,
      targetPrice: 12000000000n, // $120.00
    },
    {
      question: 'Will Ethereum cross $2,600 following Arc L1 expansion?',
      duration: 86400 * 10, // 10 days
      priceFeed: config2.PRICE_FEEDS.ETH_USD,
      targetPrice: 260000000000n, // $2,600.00
    },
  ];

  for (const m of marketsToCreate) {
    console.log(`\nCreating: "${m.question}"...`);
    const tx = await predContract.createPoll(
      m.question,
      m.duration,
      m.priceFeed,
      m.targetPrice
    );
    console.log(`⏳ Tx Hash: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Confirmed in block ${receipt.blockNumber}`);
  }

  const currentPollCount = await predContract.pollCount();
  console.log(`\n🎉 Total Prediction Markets Now on Arc: ${currentPollCount}`);

  // 2. Create Social Posts with Beautiful Photos
  console.log('\n--- Step 2: Publishing Social Posts with Photos ---');
  const photos = [
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1642790106117-e829e14a795f?q=80&w=1200&auto=format&fit=crop',
  ];

  for (let i = 0; i < photos.length; i++) {
    const photoUrl = photos[i];
    console.log(`\nPublishing Post #${i + 1} with photo: ${photoUrl.slice(0, 55)}...`);
    const tx = await postContract.createPost(photoUrl, false);
    console.log(`⏳ Tx Hash: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Confirmed in block ${receipt.blockNumber}`);
  }

  const currentPostCount = await postContract.totalPosts();
  console.log(`\n🎉 Total Posts Now on Arc: ${currentPostCount}`);

  // 3. Place a sample bet on Poll #0 to show betting activity
  try {
    console.log('\n--- Step 3: Placing Bet on Market #0 ("Will ETH exceed $2,500 on Arc?") ---');
    const betAmount = ethers.parseUnits('0.05', 18); // 0.05 native USDC
    const betTx = await predContract.placeBetNative(0, true, { value: betAmount });
    console.log(`⏳ Bet Tx Hash: ${betTx.hash}`);
    const betReceipt = await betTx.wait();
    console.log(`✅ Bet placed in block ${betReceipt.blockNumber}!`);
  } catch (err) {
    console.log('Note: Betting note:', err.message);
  }

  const endingBal = await provider.getBalance(wallet.address);
  console.log(`\n💰 Final Deployer Balance: ${ethers.formatUnits(endingBal, 18)} USDC`);
  console.log('====================================================');
  console.log('       ON-CHAIN POPULATION COMPLETED SUCCESSFULLY!   ');
  console.log('====================================================');
}

populateData().catch((err) => {
  console.error('\n❌ Execution failed:', err);
  process.exit(1);
});
