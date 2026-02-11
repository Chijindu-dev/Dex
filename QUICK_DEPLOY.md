# 🚀 Quick Deployment Guide - 3 Methods

## Your Setup
- ✅ Sepolia RPC URL: Configured
- ✅ Private Key: Configured  
- ✅ Wallet Ready: Ready
- ⏳ Need: Contracts deployed

---

## Method 1: Using Remix IDE (Easiest - Recommended)

### Step 1: Go to Remix
https://remix.ethereum.org/

### Step 2: Create Files
1. Click "+" to create new file
2. Name it `Token.sol` and paste:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }
}
```

3. Create `DexFactory.sol` - Copy from `contracts/DexFactory.sol`
4. Create `DexPair.sol` - Copy from `contracts/DexPair.sol`
5. Create `DexRouter.sol` - Copy from `contracts/DexRouter.sol`

### Step 3: Compile
1. Click "Solidity Compiler" (left sidebar)
2. Click "Compile Token.sol"
3. Repeat for each contract

### Step 4: Deploy
1. Click "Deploy & Run Transactions"
2. Select Network: "Sepolia" (in MetaMask first!)
3. Deploy order:
   - Token (TEST1) → get address
   - Token (TEST2) → get address
   - Token (TEST3) → get address
   - DexFactory → pass (address(0))
   - DexRouter → pass (factory address)

4. Copy all addresses

---

## Method 2: Using Hardhat (After Installation)

### Step 1: Install Hardhat
```bash
cd c:\Users\user\Documents\Dex
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat --version
```

### Step 2: Run Deployment
```bash
npx hardhat run contracts/scripts/deployTestnet.js --network sepolia
```

### Step 3: Copy Addresses
The script will output all contract addresses.

---

## Method 3: Using Alchemy Deploy Tool

Go to: https://www.alchemy.com/

1. Create account
2. Create an app
3. Use their deployment tools
4. Paste contract code
5. Deploy to Sepolia

---

## After Deployment

Once you have contract addresses:

### 1. Update `.env`
```env
VITE_ROUTER_ADDRESS=0x... (from DexRouter deployment)
VITE_FACTORY_ADDRESS=0x... (from DexFactory deployment)
```

### 2. Update `src/components/TokenSelector.jsx`
```jsx
const COMMON_TOKENS = [
  { symbol: 'TEST1', address: '0x... (TEST1 token address)', decimals: 18 },
  { symbol: 'TEST2', address: '0x... (TEST2 token address)', decimals: 18 },
  { symbol: 'TEST3', address: '0x... (TEST3 token address)', decimals: 18 },
];
```

### 3. Test in Frontend
1. `npm run dev`
2. Connect MetaMask to Sepolia
3. Try swap!

---

## Troubleshooting

### "Insufficient gas"
- Get Sepolia ETH: https://www.sepoliafaucet.com/

### "Invalid RPC URL"
- Check your `.env` file
- Make sure SEPOLIA_RPC_URL is correct

### "Out of gas"
- Increase gas limit in deployment settings
- Or split deployments

### "Contract compilation error"
- Check Solidity version (should be 0.8.19)
- Check for syntax errors

---

## Next Steps After Deployment

1. ✅ Get contract addresses
2. ✅ Update .env and TokenSelector.jsx
3. ✅ Refresh frontend
4. ✅ Connect wallet to Sepolia
5. ✅ Test swap!
6. ✅ Add more liquidity if needed
7. ✅ Deploy to mainnet (when ready!)

---

## 💡 Pro Tips

- Save all contract addresses somewhere safe
- Verify contracts on Etherscan (optional)
- Use a hardware wallet for mainnet
- Test thoroughly on testnet first

**Which method do you want to use? Remix (easiest) or Hardhat (programmatic)?**
