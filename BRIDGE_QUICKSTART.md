# Bridge Quick Start Guide

## 5-Minute Setup

### 1. Deploy Bridge Contract

```bash
cd c:\Users\user\Documents\Dex

# Compile contracts
npx hardhat compile

# Deploy Bridge to Tempo testnet
npx hardhat run contracts/scripts/deployBridge.cjs --network tempo
```

**Output Example:**
```
Bridge deployed to: 0x1234567890123456789012345678901234567890
Update your .env file with:
VITE_BRIDGE_ADDRESS=0x1234567890123456789012345678901234567890
```

### 2. Update Environment Variables

Edit `.env`:
```
VITE_ROUTER_ADDRESS=0x558B8673b125EED2b99393F111688C39315859A5
VITE_FACTORY_ADDRESS=0xF28d61F4C69f08E653d2Cb747A74ebecea658bF7
VITE_BRIDGE_ADDRESS=<paste-bridge-address-from-step-1>
TEMPO_RPC_URL=https://rpc.moderato.tempo.xyz
```

### 3. Restart Dev Server

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

### 4. Test Bridge

1. **Open App**: http://localhost:5173/
2. **Connect Wallet**: Click "Connect" button
3. **Navigate to Bridge**: Click "Bridge" tab
4. **Select Token**: Choose SWIFT, FLUX, or NEXUS
5. **Enter Amount**: e.g., "10"
6. **Select Chain**: Choose destination (e.g., "Polygon")
7. **Review Fee**: Check breakdown of amount and fee
8. **Bridge**: Click "Bridge Tokens" and confirm in MetaMask
9. **Check History**: Click "Show Bridge History" to see transaction

## Common Tasks

### Get Test Tokens
If you don't have tokens, you need to mint them first:

```bash
npx hardhat run scripts/deployTestnet.js --network tempo
```

This will output token addresses and pre-mint tokens to your account.

### Verify Bridge Setup

Check that your bridge contract is properly configured:

```javascript
// In browser console or script:
const bridgeABI = ['function isSupportedToken(address) public view returns (bool)'];
const bridge = new ethers.Contract(BRIDGE_ADDRESS, bridgeABI, provider);

// Check if SWIFT is supported
const isSupported = await bridge.isSupportedToken('0x56005bdCd754fC6742906A6040aE719A43622651');
console.log('SWIFT supported:', isSupported);
```

### Check Bridge Fee

```javascript
const bridge = new ethers.Contract(BRIDGE_ADDRESS, bridgeABI, provider);
const fee = await bridge.calculateBridgeFee(
  '0x56005bdCd754fC6742906A6040aE719A43622651', // SWIFT
  ethers.parseEther('100')
);
console.log('Fee for 100 SWIFT:', ethers.formatEther(fee));
```

### View Bridge History

```javascript
const bridge = new ethers.Contract(BRIDGE_ADDRESS, bridgeABI, provider);
const history = await bridge.getUserBridgeHistory(userAddress);
console.log('Bridge history:', history);
```

## Bridge Fee Calculator

| Amount | Token | Fee (0.25%) | You Receive |
|--------|-------|------------|-------------|
| 100 | SWIFT | 0.25 | 99.75 |
| 1,000 | FLUX | 2.5 | 997.5 |
| 10,000 | NEXUS | 25 | 9,975 |

## Troubleshooting

### Bridge Address Not Found
**Error**: "Bridge contract not configured"
**Solution**: 
1. Deploy bridge: `npx hardhat run contracts/scripts/deployBridge.cjs --network tempo`
2. Copy address to .env
3. Restart dev server

### Tokens Not Supported
**Error**: "Token not supported"
**Solution**: 
The deployment script automatically adds SWIFT, FLUX, NEXUS as supported tokens. If this didn't happen:
1. Deploy script again
2. Or manually add tokens via bridge admin function

### Insufficient Balance
**Error**: "Insufficient token balance"
**Solution**:
1. Make sure you have the token in your wallet
2. Check balance in Swap tab
3. If 0 balance, redeploy token contracts which pre-mints tokens

### MetaMask Transaction Fails
**Steps to Debug**:
1. Check you're on Tempo testnet (Chain ID: 42431)
2. Ensure you have gas (need some ETH for gas fees)
3. Check token allowance - bridge needs approval first
4. Look for error message in MetaMask

### App Shows Old Bridge Contract
**Solution**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Restart dev server
3. Hard refresh (Ctrl+Shift+R)

## Mobile Testing

To test bridge on mobile:

```bash
# Get your machine IP
ipconfig

# Start dev server on all interfaces
npm run dev -- --host
```

Then open: `http://<your-ip>:5173/` on your mobile device

The bridge UI is fully responsive and works great on mobile!

## Next Steps

- **Customize Fees**: Adjust bridge fee percentage via admin functions
- **Add More Tokens**: Use `addSupportedToken()` to support more ERC20s
- **Set Limits**: Configure min/max bridge amounts
- **Monitor Usage**: Track bridge statistics and user activity
- **Deploy to Production**: Prepare for mainnet deployment

## Resources

- 📄 [Bridge Documentation](BRIDGE.md)
- 🔧 [Smart Contract Code](contracts/Bridge.sol)
- 💻 [Bridge Component Code](src/components/BridgeCard.jsx)
- 📚 [Full API Reference](BRIDGE.md#api-reference)
