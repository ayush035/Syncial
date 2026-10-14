const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');

// Arc Mainnet Constants
const ARC_RPC_URL = 'https://rpc.mainnet.arc.io';
const ARC_CHAIN_ID = 5042;
const ARC_USDC_ERC20 = '0x3600000000000000000000000000000000000000';
const ARC_PYTH_ADDRESS = '0xACeA761c27A909d4D3895128EBe6370FDE2dF481';

function findImports(importPath) {
  if (importPath.startsWith('@openzeppelin/')) {
    const fullPath = path.resolve(__dirname, '../node_modules', importPath);
    if (fs.existsSync(fullPath)) {
      return { contents: fs.readFileSync(fullPath, 'utf8') };
    }
  }
  return { error: 'File not found: ' + importPath };
}

function compileContract(filename, contractName) {
  const source = fs.readFileSync(path.resolve(__dirname, '../contracts', filename), 'utf8');
  const input = {
    language: 'Solidity',
    sources: { [filename]: { content: source } },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } },
    },
  };
  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
  if (output.errors) {
    const errors = output.errors.filter((e) => e.severity === 'error');
    if (errors.length > 0) {
      console.error(`Compilation errors in ${filename}:`, errors);
      process.exit(1);
    }
  }
  return output.contracts[filename][contractName];
}

async function main() {
  console.log('====================================================');
  console.log('       Syncial - Arc Mainnet Contract Deployer      ');
  console.log('====================================================\n');

  // Load private key from env or .env.local
  let privateKey = process.env.ARC_DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
  if (!privateKey) {
    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/ARC_DEPLOYER_PRIVATE_KEY=(0x[a-fA-F0-9]{64}|[a-fA-F0-9]{64})/);
      if (match) privateKey = match[1];
    }
  }

  if (!privateKey) {
    console.log('⚠️  No private key found in process.env or .env.local.');
    console.log('\nTo deploy directly to Arc Mainnet (Chain ID 5042):');
    console.log('1. Set ARC_DEPLOYER_PRIVATE_KEY in .env.local or pass it as an environment variable:');
    console.log('   ARC_DEPLOYER_PRIVATE_KEY=0x<YOUR_PRIVATE_KEY> node scripts/deploy.js\n');
    console.log('2. Ensure your deployer address has native USDC for gas on Arc Mainnet.');
    console.log('   (USDC is the native gas token on Arc: ~0.01 USDC per deployment tx).\n');
    return;
  }

  if (!privateKey.startsWith('0x')) {
    privateKey = '0x' + privateKey;
  }

  const provider = new ethers.JsonRpcProvider(ARC_RPC_URL, {
    chainId: ARC_CHAIN_ID,
    name: 'arc-mainnet',
  });

  const wallet = new ethers.Wallet(privateKey, provider);
  console.log(`📡 Connected to Arc Mainnet (${ARC_RPC_URL})`);
  console.log(`👤 Deployer Address: ${wallet.address}`);

  const balance = await provider.getBalance(wallet.address);
  console.log(`💰 Native Gas Balance: ${ethers.formatUnits(balance, 18)} USDC`);

  if (balance === 0n) {
    console.error('\n❌ Insufficient native USDC balance to pay for gas on Arc Mainnet.');
    console.error(`Please fund ${wallet.address} with native USDC on Arc Mainnet (Chain ID 5042).`);
    return;
  }

  // 1. Compile & Deploy ArcPredictionMarketplace
  console.log('\n[1/3] Compiling and deploying ArcPredictionMarketplace (USDC-Compatible)...');
  const predCompiled = compileContract('Prediction.sol', 'ArcPredictionMarketplace');
  const PredFactory = new ethers.ContractFactory(predCompiled.abi, predCompiled.evm.bytecode.object, wallet);
  
  const predContract = await PredFactory.deploy(
    ARC_USDC_ERC20,
    ARC_PYTH_ADDRESS,
    wallet.address // Platform fee receiver
  );
  console.log(`⏳ Tx submitted: ${predContract.deploymentTransaction().hash}`);
  await predContract.waitForDeployment();
  const predAddress = await predContract.getAddress();
  console.log(`✅ ArcPredictionMarketplace deployed at: ${predAddress}`);

  // 2. Compile & Deploy SocialPosts
  console.log('\n[2/3] Compiling and deploying SocialPosts...');
  const postCompiled = compileContract('Post.sol', 'SocialPosts');
  const PostFactory = new ethers.ContractFactory(postCompiled.abi, postCompiled.evm.bytecode.object, wallet);
  const postContract = await PostFactory.deploy();
  console.log(`⏳ Tx submitted: ${postContract.deploymentTransaction().hash}`);
  await postContract.waitForDeployment();
  const postAddress = await postContract.getAddress();
  console.log(`✅ SocialPosts deployed at: ${postAddress}`);

  // 3. Compile & Deploy UsernameMinting
  console.log('\n[3/3] Compiling and deploying UsernameMinting...');
  const usernameCompiled = compileContract('Username.sol', 'UsernameMinting');
  const UsernameFactory = new ethers.ContractFactory(usernameCompiled.abi, usernameCompiled.evm.bytecode.object, wallet);
  const usernameContract = await UsernameFactory.deploy();
  console.log(`⏳ Tx submitted: ${usernameContract.deploymentTransaction().hash}`);
  await usernameContract.waitForDeployment();
  const usernameAddress = await usernameContract.getAddress();
  console.log(`✅ UsernameMinting deployed at: ${usernameAddress}`);

  // 4. Update configuration files automatically
  console.log('\nUpdating configuration files with new deployed addresses...');
  
  // Update lib/config2.js
  const config2Path = path.resolve(__dirname, '../lib/config2.js');
  let config2 = fs.readFileSync(config2Path, 'utf8');
  config2 = config2.replace(/PREDICTION_MARKET_ADDRESS = "0x[a-fA-F0-9]{40}"/, `PREDICTION_MARKET_ADDRESS = "${predAddress}"`);
  fs.writeFileSync(config2Path, config2);
  console.log(`  ✓ Updated PREDICTION_MARKET_ADDRESS in lib/config2.js -> ${predAddress}`);

  // Update .env.local
  const envPath = path.resolve(__dirname, '../.env.local');
  let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  if (env.includes('NEXT_PUBLIC_SOCIAL_POSTS_ADDRESS=')) {
    env = env.replace(/NEXT_PUBLIC_SOCIAL_POSTS_ADDRESS=0x[a-fA-F0-9]{40}/, `NEXT_PUBLIC_SOCIAL_POSTS_ADDRESS=${postAddress}`);
  } else {
    env += `\nNEXT_PUBLIC_SOCIAL_POSTS_ADDRESS=${postAddress}\n`;
  }
  fs.writeFileSync(envPath, env);
  console.log(`  ✓ Updated NEXT_PUBLIC_SOCIAL_POSTS_ADDRESS in .env.local -> ${postAddress}`);

  // Update lib/username_congif.js
  const userConfigPath = path.resolve(__dirname, '../lib/username_congif.js');
  let userConfig = fs.readFileSync(userConfigPath, 'utf8');
  userConfig = userConfig.replace(/address: "0x[a-fA-F0-9]{40}"/, `address: "${usernameAddress}"`);
  fs.writeFileSync(userConfigPath, userConfig);
  console.log(`  ✓ Updated USERNAME_CONTRACT in lib/username_congif.js -> ${usernameAddress}`);

  console.log('\n🎉 All contracts deployed and synchronized with the frontend successfully!');
}

main().catch((err) => {
  console.error('\n❌ Deployment failed:', err);
  process.exit(1);
});
