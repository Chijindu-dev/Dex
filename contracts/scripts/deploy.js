// Deployment script for DEX contracts
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy Factory
  console.log("Deploying DexFactory...");
  const DexFactory = await ethers.getContractFactory("DexFactory");
  const factory = await DexFactory.deploy(deployer.address);
  await factory.deployed();
  console.log("DexFactory deployed to:", factory.address);

  // Deploy Router
  console.log("Deploying DexRouter...");
  const DexRouter = await ethers.getContractFactory("DexRouter");
  const router = await DexRouter.deploy(factory.address);
  await router.deployed();
  console.log("DexRouter deployed to:", router.address);

  // Deploy test tokens
  console.log("Deploying test tokens...");
  const Token = await ethers.getContractFactory("Token");

  const tokenA = await Token.deploy("Token A", "TKNA", ethers.utils.parseEther("1000000"));
  await tokenA.deployed();
  console.log("Token A deployed to:", tokenA.address);

  const tokenB = await Token.deploy("Token B", "TKNB", ethers.utils.parseEther("1000000"));
  await tokenB.deployed();
  console.log("Token B deployed to:", tokenB.address);

  // Create pair
  console.log("Creating pair...");
  await factory.createPair(tokenA.address, tokenB.address);
  const pairAddress = await factory.getPair(tokenA.address, tokenB.address);
  console.log("Pair created at:", pairAddress);

  // Save deployment addresses
  const deployment = {
    factory: factory.address,
    router: router.address,
    tokenA: tokenA.address,
    tokenB: tokenB.address,
    pair: pairAddress,
    deployer: deployer.address,
  };

  const fs = require("fs");
  fs.writeFileSync(
    "./deployments.json",
    JSON.stringify(deployment, null, 2)
  );

  console.log("\n✅ Deployment complete!");
  console.log("Saved to deployments.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
