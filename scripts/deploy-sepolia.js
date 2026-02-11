// scripts/deploy-sepolia.js - Deploy using ethers.js directly
import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Contract ABIs and bytecode
const TOKEN_ABI = JSON.parse(fs.readFileSync(path.join(__dirname, "../abis/Token.json"), "utf8"));
const TOKEN_BYTECODE = fs.readFileSync(path.join(__dirname, "../abis/Token_bytecode.txt"), "utf8").trim();

async function main() {
  console.log("🚀 Deploying DEX to Sepolia Testnet...\n");

  // Setup provider and signer
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;

  if (!rpcUrl) {
    throw new Error("SEPOLIA_RPC_URL not set in .env");
  }
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not set in .env");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);

  console.log("📍 Deploying with account:", signer.address);
  
  try {
    const balance = await provider.getBalance(signer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");
  } catch (err) {
    console.error("⚠️  Could not fetch balance, but continuing...");
  }

  console.log("=" .repeat(50));
  console.log("Note: This is a simplified deployment");
  console.log("For full deployment, install Hardhat:");
  console.log("npm install --save-dev hardhat");
  console.log("=" .repeat(50));
  console.log();

  console.log("📖 Deployment Instructions:");
  console.log("1. Make sure you have Sepolia test ETH");
  console.log("2. Your account:", signer.address);
  console.log("3. RPC URL:", rpcUrl);
  console.log();
  console.log("To complete deployment with Hardhat:");
  console.log("npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox");
  console.log("npx hardhat run contracts/scripts/deployTestnet.js --network sepolia");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
