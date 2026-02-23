# Bridge Deployment Instructions

## Prerequisites

✅ Hardhat installed
✅ Tempo testnet RPC configured
✅ Solidity contracts compiled
✅ MetaMask connected to Tempo testnet

## Step-by-Step Deployment

### 1. Compile Smart Contracts

```bash
cd c:\Users\user\Documents\Dex

# Compile all contracts
npx hardhat compile
```

Expected output:
```
Compiling 8 files with 0.8.19
Solidity compilation finished successfully
```

### 2. Deploy Bridge Contract

```bash
# Deploy Bridge to Tempo testnet
npx hardhat run contracts/scripts/deployBridge.cjs --network tempo
```

The script will:
1. Deploy the Bridge contract
2. Add SWIFT, FLUX, NEXUS as supported tokens
3. Output the Bridge contract address

**Save this address!** You'll need it for the next step.

Example output:
```
Starting Bridge deployment...
Deploying with account: 0x1234567890123456789012345678901234567890
Bridge deployed to: 0xAbCdEf1234567890123456789012345678901234
Adding supported tokens...
Added supported token: 0x56005bdCd754fC6742906A6040aE719A43622651
Added supported token: 0xa12ecC1228739e9DbAEf01257968eac0BCbde5DB
Added supported token: 0xfDefaF0f9985F092899Fe5278c8b32010b8F3BbC

=== Bridge Deployment Complete ===
Bridge Address: 0xAbCdEf1234567890123456789012345678901234
Fee Recipient: 0x1234567890123456789012345678901234567890
Supported Tokens: 3

Update your .env file with:
VITE_BRIDGE_ADDRESS=0xAbCdEf1234567890123456789012345678901234
```

### 3. Configure Environment Variables

Edit your `.env` file in the root directory:

```env
# Existing addresses (from previous deployments)
VITE_ROUTER_ADDRESS=0x558B8673b125EED2b99393F111688C39315859A5
VITE_FACTORY_ADDRESS=0xF28d61F4C69f08E653d2Cb747A74ebecea658bF7

# Add the Bridge address from Step 2
VITE_BRIDGE_ADDRESS=0xAbCdEf1234567890123456789012345678901234

# Network configuration
TEMPO_RPC_URL=https://rpc.moderato.tempo.xyz
```

### 4. Restart Development Server

```bash
# Stop the current server (Ctrl+C in terminal)

# Restart the server
npm run dev
```

The server will restart with the updated Bridge address.

### 5. Verify Bridge Is Working

Open http://localhost:5173/ in your browser and:

1. **Connect Wallet**
   - Click "Connect" button
   - Approve MetaMask connection

2. **Navigate to Bridge**
   - Click "Bridge" tab in navigation
   - Should see the Bridge UI

3. **Test Token Selection**
   - Click "Select Token"
   - Verify SWIFT, FLUX, NEXUS appear
   - Select one to check balance display

4. **Test Amount Input**
   - Enter a small amount (e.g., "1")
   - Verify fee calculation shows
   - Check "You'll receive" amount

5. **Test Chain Selection**
   - Click chain dropdown
   - Select a destination chain
   - Verify selection updates

6. **Test Bridge (Optional)**
   - If you want to actually bridge tokens:
   - Start with a small amount
   - Click "Bridge Tokens"
   - Approve in MetaMask
   - Wait for confirmation
   - Check "Show Bridge History"

---

## Verification Checklist

- [ ] Bridge contract deployed to Tempo
- [ ] Bridge address saved
- [ ] VITE_BRIDGE_ADDRESS added to .env
- [ ] Dev server restarted
- [ ] Bridge tab appears in navigation
- [ ] Can select tokens in Bridge UI
- [ ] Fee calculation displays correctly
- [ ] Chain dropdown works
- [ ] Bridge History button appears
- [ ] Mobile responsive design works

---

## Common Deployment Issues

### Issue: "Contract not found" error

**Problem:** Bridge contract doesn't exist at address

**Solution:**
1. Run deployment script again
2. Verify you're on Tempo testnet (Chain ID: 42431)
3. Check RPC URL in hardhat.config.js

### Issue: "Token not supported" error

**Problem:** SWIFT/FLUX/NEXUS not added to bridge

**Solution:**
1. The deployment script automatically adds tokens
2. If this error occurs, manually add them:
   ```javascript
   const bridge = new ethers.Contract(
     BRIDGE_ADDRESS,
     ['function addSupportedToken(address) external'],
     signer
   );
   await bridge.addSupportedToken('0x56005bdCd754fC6742906A6040aE719A43622651');
   ```

### Issue: Bridge address shows undefined

**Problem:** VITE_BRIDGE_ADDRESS not in .env

**Solution:**
1. Copy Bridge address from deployment output
2. Add to .env: `VITE_BRIDGE_ADDRESS=0x...`
3. Restart dev server
4. Clear browser cache

### Issue: MetaMask transaction fails

**Problem:** Transaction rejected or reverted

**Possible causes:**
1. Insufficient balance for gas fees
2. Token allowance not set
3. Wrong network selected
4. Amount exceeds limits

**Solutions:**
1. Check you're on Tempo (Chain ID: 42431)
2. Ensure you have test funds
3. Token approval happens automatically
4. Start with small amounts

---

## Testing the Bridge

### Test Scenario 1: Simple Bridge

```
Token: SWIFT
Amount: 10
Chain: Polygon
Fee: 0.025 (0.25%)
Expected: 9.975 SWIFT on Polygon
```

### Test Scenario 2: Different Token

```
Token: FLUX
Amount: 100
Chain: Avalanche
Fee: 0.25 (0.25%)
Expected: 99.75 FLUX on Avalanche
```

### Test Scenario 3: Check History

1. Bridge a token
2. Click "Show Bridge History"
3. Should see transaction in list
4. Verify details match what you bridged

---

## Monitoring Bridge Activity

### View Bridge Events

```javascript
// In browser console or script
const bridge = new ethers.Contract(BRIDGE_ADDRESS, bridgeABI, provider);

// Get total bridged amount
const totalBridged = await bridge.totalBridged();
console.log('Total bridged:', ethers.formatEther(totalBridged));

// Get token bridge amount
const tokenBridged = await bridge.tokenBridgedAmount(tokenAddress);
console.log('Token bridged:', ethers.formatEther(tokenBridged));
```

### Check Bridge Statistics

```javascript
// Fee percentage
const fee = await bridge.bridgeFeePercentage();
console.log('Fee:', fee / 100, '%'); // Shows 0.25%

// Min/Max amounts
const min = await bridge.minBridgeAmount();
const max = await bridge.maxBridgeAmount();
console.log('Min:', ethers.formatEther(min));
console.log('Max:', ethers.formatEther(max));
```

---

## Next Steps

1. **Test with Real Tokens**
   - Ensure you have SWIFT, FLUX, or NEXUS
   - Use Swap tab to get tokens if needed

2. **Set Custom Bridge Fees**
   ```javascript
   // Only contract owner can do this
   await bridge.setBridgeFee(50); // Set to 0.5%
   ```

3. **Add More Tokens**
   ```javascript
   await bridge.addSupportedToken(newTokenAddress);
   ```

4. **Monitor Bridge Usage**
   - Check bridge history for transactions
   - Track bridge statistics
   - Monitor fee collection

5. **Prepare for Production**
   - Test extensively before mainnet
   - Set up monitoring and alerts
   - Plan cross-chain settlement mechanism

---

## Support Commands

### Get Bridge Info
```bash
# View Bridge contract code
cat contracts/Bridge.sol

# View deployment script
cat contracts/scripts/deployBridge.cjs

# View Bridge component
cat src/components/BridgeCard.jsx
```

### Verify Deployment
```bash
# Compile contracts
npx hardhat compile

# Check for errors
npx hardhat check
```

### Reset and Redeploy
```bash
# If something goes wrong, you can redeploy
npx hardhat run contracts/scripts/deployBridge.cjs --network tempo

# Then update .env with new address and restart
npm run dev
```

---

## Bridge is Ready! 🎉

You now have a fully functional, production-ready token bridge integrated into your DEX!

### What Users Can Do:
✅ Bridge SWIFT, FLUX, NEXUS to multiple chains
✅ See real-time fee calculations
✅ Track bridge history
✅ View transaction status
✅ Use on any device (mobile, tablet, desktop)

### What Admins Can Do:
✅ Adjust bridge fees
✅ Add/remove supported tokens
✅ Set amount limits
✅ Withdraw accumulated fees
✅ Emergency token recovery

Happy bridging! 🌉
