# Deployment Guide

## Prerequisites

- Node.js 16+
- npm or yarn
- MetaMask or similar Web3 wallet
- Sepolia testnet ETH (get from faucet: https://sepoliafaucet.com)

## Step 1: Setup Environment

```bash
cd contracts
npm install
cp .env.example .env
```

Edit `.env`:
```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_without_0x_prefix
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Step 2: Deploy Smart Contracts

### To Sepolia Testnet

```bash
npx hardhat run contracts/scripts/deploy.js --network sepolia
```

This will:
1. Deploy DexFactory
2. Deploy DexRouter
3. Deploy test tokens (TKNA, TKNB)
4. Create a test pair
5. Save addresses to `deployments.json`

### To Local Network (Testing)

```bash
# Terminal 1: Start local node
npx hardhat node

# Terminal 2: Deploy
npx hardhat run contracts/scripts/deploy.js --network localhost
```

## Step 3: Verify Contracts (Sepolia)

```bash
npx hardhat verify --network sepolia DEPLOYED_ADDRESS constructor_args
```

## Step 4: Setup Frontend

```bash
cd ..
npm install
```

Create `.env.local`:
```
REACT_APP_ROUTER_ADDRESS=0x...from_deployments.json
REACT_APP_FACTORY_ADDRESS=0x...from_deployments.json
REACT_APP_CHAIN_ID=11155111
REACT_APP_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

## Step 5: Run Tests

```bash
npm run test
```

Expected output:
```
✓ Factory tests pass
✓ Liquidity tests pass
✓ Swap tests pass
✓ Price calculation tests pass
```

## Step 6: Start Frontend Dev Server

```bash
npm run dev
```

Navigate to `http://localhost:3000`

## Troubleshooting

### "INSUFFICIENT_LIQUIDITY" error
- Add more initial liquidity to the pool first

### Transaction reverts with "FORBIDDEN"
- Ensure you're using the correct signer
- Check token approvals

### "Pair does not exist"
- Create the pair first via factory.createPair()

## Gas Cost Estimates

| Operation | Gas (approx) |
|-----------|-------------|
| Create Pair | 2.5M |
| Add Liquidity (first) | 3.5M |
| Add Liquidity (subsequent) | 1.2M |
| Swap | 1.8M |
| Remove Liquidity | 1.0M |

## Mainnet Deployment Checklist

- [ ] Audit smart contracts
- [ ] Set proper fee recipient
- [ ] Update frontend URLs
- [ ] Test on testnet thoroughly
- [ ] Add slippage warnings
- [ ] Implement rate limiting
- [ ] Setup monitoring/alerts
- [ ] Create governance token
- [ ] Document API endpoints

