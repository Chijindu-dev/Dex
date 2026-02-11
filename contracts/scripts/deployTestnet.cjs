// scripts/deployTestnet.cjs - Complete deployment for Sepolia testnet
const hre = require("hardhat");
const ethers = require("ethers");

async function main() {
  console.log("🚀 Deploying DEX to Sepolia Testnet...\n");

  // Get signers using ethers provider
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log("📍 Deploying contracts with account:", wallet.address);
  
  const balance = await provider.getBalance(wallet.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Step 1: Deploy Test Tokens
  console.log("=" .repeat(50));
  console.log("STEP 1: Deploying Test Tokens");
  console.log("=" .repeat(50));

  const Token = await hre.ethers.getContractFactory("Token", wallet);

  const token1 = await Token.deploy("Test Token 1", "TEST1", ethers.parseEther("1000000"));
  await token1.waitForDeployment();
  const token1Address = await token1.getAddress();
  console.log("✅ TEST1 deployed to:", token1Address);

  const token2 = await Token.deploy("Test Token 2", "TEST2", ethers.parseEther("1000000"));
  await token2.waitForDeployment();
  const token2Address = await token2.getAddress();
  console.log("✅ TEST2 deployed to:", token2Address);

  const token3 = await Token.deploy("Test Token 3", "TEST3", ethers.parseEther("1000000"));
  await token3.waitForDeployment();
  const token3Address = await token3.getAddress();
  console.log("✅ TEST3 deployed to:", token3Address);

  // Step 2: Deploy DexFactory
  console.log("\n" + "=" .repeat(50));
  console.log("STEP 2: Deploying DexFactory");
  console.log("=" .repeat(50));

  const DexFactory = await hre.ethers.getContractFactory("DexFactory", wallet);
  const factory = await DexFactory.deploy(wallet.address);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("✅ DexFactory deployed to:", factoryAddress);

  // Step 3: Deploy DexRouter
  console.log("\n" + "=" .repeat(50));
  console.log("STEP 3: Deploying DexRouter");
  console.log("=" .repeat(50));

  const DexRouter = await hre.ethers.getContractFactory("DexRouter", wallet);
  const router = await DexRouter.deploy(factoryAddress);
  await router.waitForDeployment();
  const routerAddress = await router.getAddress();
  console.log("✅ DexRouter deployed to:", routerAddress);

  // Step 4: Create test pairs and add liquidity
  console.log("\n" + "=" .repeat(50));
  console.log("STEP 4: Creating Trading Pairs");
  console.log("=" .repeat(50));

  // Create pair: TEST1 / TEST2
  let tx = await factory.createPair(token1Address, token2Address);
  await tx.wait();
  const pair1Address = await factory.getPair(token1Address, token2Address);
  console.log("✅ TEST1/TEST2 Pair created at:", pair1Address);

  // Create pair: TEST2 / TEST3
  tx = await factory.createPair(token2Address, token3Address);
  await tx.wait();
  const pair2Address = await factory.getPair(token2Address, token3Address);
  console.log("✅ TEST2/TEST3 Pair created at:", pair2Address);

  // Step 5: Approve tokens for router
  console.log("\n" + "=" .repeat(50));
  console.log("STEP 5: Approving Tokens for Router");
  console.log("=" .repeat(50));

  const approveAmount = parseEther("100000");
  
  tx = await token1.approve(routerAddress, approveAmount);
  await tx.wait();
  console.log("✅ TEST1 approved for router");

  tx = await token2.approve(routerAddress, approveAmount);
  await tx.wait();
  console.log("✅ TEST2 approved for router");

  tx = await token3.approve(routerAddress, approveAmount);
  await tx.wait();
  console.log("✅ TEST3 approved for router");

  // Step 6: Add initial liquidity
  console.log("\n" + "=" .repeat(50));
  console.log("STEP 6: Adding Initial Liquidity");
  console.log("=" .repeat(50));

  const liquidityAmount = parseEther("1000");
  const deadline = Math.floor(Date.now() / 1000) + 300;

  tx = await router.addLiquidity(
    token1Address,
    token2Address,
    liquidityAmount,
    liquidityAmount,
    0,
    0,
    deployer.address,
    deadline
  );
  await tx.wait();
  console.log("✅ Added liquidity to TEST1/TEST2 pair");

  tx = await router.addLiquidity(
    token2Address,
    token3Address,
    liquidityAmount,
    liquidityAmount,
    0,
    0,
    deployer.address,
    deadline
  );
  await tx.wait();
  console.log("✅ Added liquidity to TEST2/TEST3 pair");

  // Summary
  console.log("\n" + "=" .repeat(50));
  console.log("✨ DEPLOYMENT COMPLETE!");
  console.log("=" .repeat(50));
  console.log("\n📋 Contract Addresses:");
  console.log("   DexFactory:  ", factoryAddress);
  console.log("   DexRouter:   ", routerAddress);
  console.log("   TEST1 Token: ", token1Address);
  console.log("   TEST2 Token: ", token2Address);
  console.log("   TEST3 Token: ", token3Address);
  console.log("\n🔧 Update your .env file with:");
  console.log(`   VITE_ROUTER_ADDRESS=${routerAddress}`);
  console.log(`   VITE_FACTORY_ADDRESS=${factoryAddress}`);
  console.log("\n💡 Token addresses for TokenSelector.jsx:");
  console.log(`   { symbol: 'TEST1', address: '${token1Address}', decimals: 18 }`);
  console.log(`   { symbol: 'TEST2', address: '${token2Address}', decimals: 18 }`);
  console.log(`   { symbol: 'TEST3', address: '${token3Address}', decimals: 18 }`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
