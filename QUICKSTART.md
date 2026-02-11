# Quick Start Guide

## 5-Minute Setup

### 1. Clone & Install
```bash
git clone <repo>
cd Dex
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env with your Sepolia RPC and private key
```

### 3. Deploy Contracts
```bash
npm run deploy:sepolia
# Contracts deployed! Check deployments.json
```

### 4. Configure Frontend
```bash
# Copy router & factory addresses from deployments.json
cp .env.example .env.local
# Update REACT_APP_ROUTER_ADDRESS and REACT_APP_FACTORY_ADDRESS
```

### 5. Start Frontend
```bash
npm run dev
# Open http://localhost:3000
```

## Usage

### Connect Wallet
1. Click "Connect Wallet"
2. Approve MetaMask connection
3. Make sure you're on Sepolia testnet

### Add Liquidity
1. Go to Liquidity tab
2. Select two tokens
3. Enter amounts
4. Click "Add Liquidity"
5. Approve both tokens
6. Confirm transaction

### Swap Tokens
1. Go to Swap tab
2. Select input token
3. Enter amount
4. Preview output and price impact
5. Adjust slippage if needed
6. Click "Swap"
7. Confirm transaction

## Common Tasks

### Get Testnet ETH
- Sepolia: https://sepoliafaucet.com

### Check Transaction
- Sepolia Explorer: https://sepolia.etherscan.io

### View Logs
```bash
# Run tests
npm run test

# Deploy to local network
npm run node
```

## API Reference

### DexRouter Functions

#### getAmountsOut
```javascript
const amounts = await router.getAmountsOut(
  ethers.utils.parseEther("1"),
  [tokenA.address, tokenB.address]
);
console.log("Output:", ethers.utils.formatEther(amounts[1]));
```

#### swapExactTokensForTokens
```javascript
const tx = await router.swapExactTokensForTokens(
  amountIn,
  minAmountOut,
  path,
  recipientAddress,
  deadline
);
await tx.wait();
```

#### addLiquidity
```javascript
const tx = await router.addLiquidity(
  tokenA.address,
  tokenB.address,
  amountA,
  amountB,
  minAmountA,
  minAmountB,
  recipientAddress,
  deadline
);
await tx.wait();
```

## Testnet Tokens

After deployment, you'll have:
- **TKNA**: Token A (for testing)
- **TKNB**: Token B (for testing)

Both already funded in deployer wallet.

## Environment Variables

```env
# Network
REACT_APP_CHAIN_ID=11155111
REACT_APP_CHAIN_NAME=Sepolia
REACT_APP_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# Contracts (update after deployment)
REACT_APP_ROUTER_ADDRESS=0x...
REACT_APP_FACTORY_ADDRESS=0x...

# Deployment
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_key_without_0x
ETHERSCAN_API_KEY=your_key
```

## File Structure

```
Dex/
├── contracts/
│   ├── DexFactory.sol        # Factory contract
│   ├── DexPair.sol           # Liquidity pool contract
│   ├── DexRouter.sol         # Router contract
│   ├── Token.sol             # Test tokens
│   ├── interfaces/
│   │   └── IERC20.sol
│   ├── scripts/
│   │   └── deploy.js         # Deployment script
│   └── test/
│       └── DEX.test.js       # Test suite
├── src/
│   ├── App.jsx               # Main app component
│   ├── context/
│   │   └── Web3Context.jsx   # Web3 provider
│   ├── components/
│   │   ├── SwapCard.jsx
│   │   ├── LiquidityCard.jsx
│   │   └── WalletButton.jsx
│   ├── hooks/
│   │   ├── useContract.js
│   │   └── useTokenBalance.js
│   └── abis/
│       └── DexRouter.json
├── hardhat.config.js
├── package.json
└── README.md
```

## Troubleshooting

**Q: "Connection error" when connecting wallet**
A: Make sure MetaMask is installed and you're on Sepolia testnet

**Q: "PAIR_EXISTS" error**
A: The pair already exists. Use getPair() to get it instead of creating

**Q: Swap fails with "INSUFFICIENT_LIQUIDITY"**
A: Add more liquidity to the pool or swap smaller amounts

**Q: "EXPIRED" error on transaction**
A: Deadline has passed. Check network congestion and retry

**Q: Frontend shows 0 balance**
A: Make sure tokens are deployed on correct network and your address is correct

## Next Steps

1. **Deploy to testnet** - Test thoroughly on Sepolia
2. **Add slippage warnings** - Warn users of high price impact
3. **Implement subgraph** - Index events with The Graph
4. **Add governance** - Create governance token
5. **Security audit** - Get professional audit before mainnet
6. **Multi-hop routing** - Support token swaps through multiple pairs
7. **Fee tiers** - Add different fee options
8. **Concentrated liquidity** - Implement Uniswap v3 style

## Support & Resources

- **Solidity Docs**: https://docs.soliditylang.org
- **ethers.js Docs**: https://docs.ethers.org
- **OpenZeppelin**: https://docs.openzeppelin.com
- **Uniswap v2 Whitepaper**: https://uniswap.org/whitepaper.pdf
- **Hardhat Docs**: https://hardhat.org/hardhat-runner/docs/getting-started

