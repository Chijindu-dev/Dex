# 🚀 Deployment Guide for Sepolia Testnet

## Prerequisites

1. **MetaMask or wallet with private key**
2. **Sepolia test ETH** (get from [Sepolia faucet](https://www.sepoliafaucet.com/))
3. **Infura API key** (get from [infura.io](https://infura.io/))
4. **Etherscan API key** (optional, get from [etherscan.io](https://etherscan.io/apis))

## Step 1: Get Your Private Key

### Option A: From MetaMask
1. Open MetaMask
2. Click the three dots menu → Account details
3. Click "Export Private Key"
4. Copy your private key (NEVER SHARE THIS!)

### Option B: From a new test wallet
```bash
npm install -g ganache-cli
# Or use an online wallet generator (for testnet only!)
```

## Step 2: Set Up Environment Variables

1. Open `.env` file in the root directory
2. Fill in your credentials:

```env
# Get from infura.io or alchemy.com
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Your wallet private key (NEVER commit this!)
PRIVATE_KEY=0x1234567890abcdef...

# Get from etherscan.io/apis (optional but recommended)
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY
```

## Step 3: Install Dependencies

```bash
cd c:\Users\user\Documents\Dex
npm install
# If you don't have hardhat installed:
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv
```

## Step 4: Deploy to Sepolia

```bash
cd c:\Users\user\Documents\Dex
npx hardhat run contracts/scripts/deployTestnet.js --network sepolia
```

Expected output:
```
🚀 Deploying DEX to Sepolia Testnet...

📍 Deploying contracts with account: 0x1234...
💰 Account balance: 5.0 ETH

✅ TEST1 deployed to: 0x1234...
✅ TEST2 deployed to: 0x1234...
✅ DexFactory deployed to: 0x1234...
✅ DexRouter deployed to: 0x1234...
...
📋 Contract Addresses:
   DexFactory:   0x1234...
   DexRouter:    0x1234...
   TEST1 Token:  0x1234...
   TEST2 Token:  0x1234...
   TEST3 Token:  0x1234...
```

## Step 5: Update Environment Variables

Copy the addresses from the deployment output into your `.env` file:

```env
VITE_ROUTER_ADDRESS=0x... (from deployment output)
VITE_FACTORY_ADDRESS=0x... (from deployment output)
```

## Step 6: Update TokenSelector.jsx

Replace the COMMON_TOKENS in `src/components/TokenSelector.jsx`:

```jsx
const COMMON_TOKENS = [
  { symbol: 'TEST1', address: '0x... (TEST1 from deployment)', decimals: 18 },
  { symbol: 'TEST2', address: '0x... (TEST2 from deployment)', decimals: 18 },
  { symbol: 'TEST3', address: '0x... (TEST3 from deployment)', decimals: 18 },
];
```

## Step 7: Test in Frontend

1. Start the dev server:
```bash
npm run dev
```

2. In MetaMask:
   - Switch to Sepolia network
   - Connect your wallet to the app
   - You should see your deployed test tokens

3. Try a swap:
   - Select TEST1 for "You pay"
   - Select TEST2 for "You receive"
   - Enter an amount
   - Click Swap
   - Approve in MetaMask
   - Confirm the swap

## Troubleshooting

### "Error: insufficient funds for gas * price + value"
→ You need more Sepolia ETH. Get from [faucet](https://www.sepoliafaucet.com/)

### "Error: could not decode result data"
→ Make sure you updated TokenSelector.jsx with the correct deployed token addresses

### "PRIVATE_KEY not found"
→ Make sure your `.env` file has PRIVATE_KEY=your_key_here

### "Network error"
→ Check your SEPOLIA_RPC_URL is correct in `.env`

## 🔒 Security Notes

- **NEVER** commit `.env` to git
- **NEVER** share your private key
- Only use testnet wallets for testing
- For mainnet, use a hardware wallet

## 📚 Next Steps

After successful deployment:
1. Test swaps with different token pairs
2. Add more test tokens as needed
3. Deploy to mainnet (when ready)
4. Verify contracts on Etherscan

---

Need help? Check the Hardhat docs: https://hardhat.org/docs
