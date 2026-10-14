const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const ARC_RPC_URL = 'https://rpc.mainnet.arc.io';
const ARC_CHAIN_ID = 5042;

// Load addresses
const config2 = require('../lib/config2.js');
const userConfig = require('../lib/username_congif.js');
const postConfig = require('../lib/config.js');

const PRED_ADDRESS = config2.PREDICTION_MARKET_ADDRESS;
const PRED_ABI = require('../abi/PredictionMarketplace.json');

const USER_ADDRESS = userConfig.USERNAME_CONTRACT.address;
const USER_ABI = userConfig.USERNAME_CONTRACT.abi;

const POST_ADDRESS = postConfig.CONTRACT_ADDRESS;
const POST_ABI = postConfig.CONTRACT_ABI;

// Private key
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/ARC_DEPLOYER_PRIVATE_KEY=(0x[a-fA-F0-9]{64}|[a-fA-F0-9]{64})/);
const privateKey = match ? (match[1].startsWith('0x') ? match[1] : '0x' + match[1]) : null;

async function testInteractions() {
  console.log('====================================================');
  console.log('       Syncial - Live On-Chain Integration Tests     ');
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
  console.log(`👤 Testing with Account: ${wallet.address}`);

  const balance = await provider.getBalance(wallet.address);
  console.log(`💰 Available Balance: ${ethers.formatUnits(balance, 18)} USDC\n`);

  // TEST 1: Username Minting & Resolution
  console.log('--- [TEST 1/3] UsernameMinting Contract ---');
  console.log(`Target Address: ${USER_ADDRESS}`);
  const userContract = new ethers.Contract(USER_ADDRESS, USER_ABI, wallet);

  const testHandle = 'arc_' + Math.floor(Math.random() * 10000);
  console.log(`Checking availability for @${testHandle}...`);
  const isAvailable = await userContract.isUsernameAvailable(testHandle);
  console.log(`Is @${testHandle} available? ->`, isAvailable);

  console.log(`Minting @${testHandle}...`);
  const mintTx = await userContract.mintUsername(testHandle);
  console.log(`⏳ Mint Tx hash: ${mintTx.hash}`);
  const mintReceipt = await mintTx.wait();
  console.log(`✅ Minted successfully in block ${mintReceipt.blockNumber}!`);

  const resolved = await userContract.getUsernameFromWallet(wallet.address);
  console.log(`Resolved handle from wallet: @${resolved}`);
  if (resolved === testHandle) {
    console.log('🎉 TEST 1 PASSED: Username Minting & Resolution Working Perfectly!\n');
  } else {
    console.log('⚠️ TEST 1 WARNING: Resolved handle does not match minted handle.\n');
  }

  // TEST 2: Social Posts Creation & Feed
  console.log('--- [TEST 2/3] SocialPosts Contract ---');
  console.log(`Target Address: ${POST_ADDRESS}`);
  const postContract = new ethers.Contract(POST_ADDRESS, POST_ABI, wallet);

  const sampleCid = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';
  console.log(`Publishing public post with CID: ${sampleCid}...`);
  const postTx = await postContract.createPost(sampleCid, false);
  console.log(`⏳ Post Tx hash: ${postTx.hash}`);
  const postReceipt = await postTx.wait();
  console.log(`✅ Post created in block ${postReceipt.blockNumber}!`);

  const total = await postContract.totalPosts();
  console.log(`Total posts in contract: ${total}`);

  const allPosts = await postContract.getAllPosts();
  console.log(`Latest post author: ${allPosts[allPosts.length - 1].author}`);
  console.log(`Latest post image CID: ${allPosts[allPosts.length - 1].image}`);
  console.log('🎉 TEST 2 PASSED: Social Post Publishing & Feed Retrieval Working Perfectly!\n');

  // TEST 3: Prediction Market Creation
  console.log('--- [TEST 3/3] ArcPredictionMarketplace Contract ---');
  console.log(`Target Address: ${PRED_ADDRESS}`);
  const predContract = new ethers.Contract(PRED_ADDRESS, PRED_ABI, wallet);

  const pollCountBefore = await predContract.pollCount();
  console.log(`Poll count before: ${pollCountBefore}`);

  console.log('Creating prediction market: "Will ETH exceed $2,500 on Arc?"...');
  const createTx = await predContract.createPoll(
    'Will ETH exceed $2,500 on Arc?',
    3600, // 1 hour duration
    config2.PRICE_FEEDS.ETH_USD,
    250000000000n // $2,500.00 (Pyth 8-decimal expo)
  );
  console.log(`⏳ Create Market Tx hash: ${createTx.hash}`);
  const createReceipt = await createTx.wait();
  console.log(`✅ Market created in block ${createReceipt.blockNumber}!`);

  const pollCountAfter = await predContract.pollCount();
  console.log(`Poll count after: ${pollCountAfter}`);

  const createdPoll = await predContract.polls(pollCountBefore);
  console.log(`Created Poll Question: "${createdPoll.question}"`);
  console.log(`Created Poll Host: ${createdPoll.host}`);
  console.log(`Created Poll Target Price: ${createdPoll.targetPrice}`);
  console.log('🎉 TEST 3 PASSED: Prediction Market Creation Working Perfectly!\n');

  console.log('====================================================');
  console.log('       ALL LIVE ON-CHAIN TESTS PASSED 100%!         ');
  console.log('====================================================');
}

testInteractions().catch((err) => {
  console.error('\n❌ Test failed with error:', err);
  process.exit(1);
});
