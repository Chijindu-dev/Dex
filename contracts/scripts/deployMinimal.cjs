// scripts/deployMinimal.cjs - Minimal deployment with optimized gas usage
const hre = require("hardhat");
const ethers = require("ethers");

async function main() {
  console.log("🚀 Deploying DEX (Minimal) to Sepolia Testnet...\n");

  // Get signers using ethers provider
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log("📍 Deploying contracts with account:", wallet.address);
  
  const balance = await provider.getBalance(wallet.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  if (balance === BigInt(0)) {
    console.error("❌ Error: Account has no ETH. Please fund the wallet from a faucet.");
    console.log("Wallet address:", wallet.address);
    console.log("Sepolia faucets:");
    console.log("  - https://sepoliafaucet.com/");
    console.log("  - https://www.alchemy.com/faucets/ethereum-sepolia");
    console.log("  - https://faucets.chain.link/sepolia");
    process.exit(1);
  }

  // Step 1: Deploy DexFactory (cheapest contract)
  console.log("=" .repeat(50));
  console.log("STEP 1: Deploying DexFactory");
  console.log("=" .repeat(50));

  const DexFactory = await hre.ethers.getContractFactory("DexFactory", wallet);
  const factory = await DexFactory.deploy(wallet.address);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("✅ DexFactory deployed to:", factoryAddress);

  // Step 2: Deploy DexRouter
  console.log("\n" + "=" .repeat(50));
  console.log("STEP 2: Deploying DexRouter");
  console.log("=" .repeat(50));

  const DexRouter = await hre.ethers.getContractFactory("DexRouter", wallet);
  const router = await DexRouter.deploy(factoryAddress);
  await router.waitForDeployment();
  const routerAddress = await router.getAddress();
  console.log("✅ DexRouter deployed to:", routerAddress);

  // Step 3: Deploy one test token
  console.log("\n" + "=" .repeat(50));
  console.log("STEP 3: Deploying Test Token");
  console.log("=" .repeat(50));

  const Token = await hre.ethers.getContractFactory("Token", wallet);
  const token1 = await Token.deploy("Test Token 1", "TEST1", ethers.parseEther("1000000"));
  await token1.waitForDeployment();
  const token1Address = await token1.getAddress();
  console.log("✅ TEST1 deployed to:", token1Address);

  // Summary
  console.log("\n" + "=" .repeat(50));
  console.log("✨ DEPLOYMENT COMPLETE!");
  console.log("=" .repeat(50));
  console.log("\n📋 Contract Addresses:");
  console.log("   DexFactory:  ", factoryAddress);
  console.log("   DexRouter:   ", routerAddress);
  console.log("   TEST1 Token: ", token1Address);
  console.log("\n🔧 Update your .env file with:");
  console.log(`   VITE_ROUTER_ADDRESS=${routerAddress}`);
  console.log(`   VITE_FACTORY_ADDRESS=${factoryAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
