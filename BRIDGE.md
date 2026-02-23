# Token Bridge Documentation

## Overview

The Token Bridge is a cross-chain solution that allows users to bridge their tokens across multiple blockchain networks securely. It features token locking, fee management, and comprehensive history tracking.

## Features

### Core Bridge Features
✅ **Multi-Chain Support** - Bridge to/from multiple blockchain networks
✅ **Token Locking** - Secure token locking mechanism on source chain
✅ **Fee Management** - Configurable bridge fees (currently 0.25%)
✅ **Bridge History** - Track all bridge transactions
✅ **Supported Tokens** - SWIFT, FLUX, NEXUS tokens
✅ **Emergency Withdrawals** - Owner can recover stuck tokens
✅ **Reentrancy Protection** - Protected against reentrancy attacks

### Supported Networks

| Chain | Name | RPC |
|-------|------|-----|
| 42431 | Tempo | https://rpc.moderato.tempo.xyz |
| 1 | Ethereum | https://eth.rpc.com |
| 137 | Polygon | https://polygon-rpc.com |
| 43114 | Avalanche | https://api.avax.network/ext/bc/C/rpc |
| 56 | BSC | https://bsc-dataseed1.binance.org |

### Supported Tokens

- **SWIFT** (Swift Exchange Token) - 0x56005bdCd754fC6742906A6040aE719A43622651
- **FLUX** (Flux Liquidity Token) - 0xa12ecC1228739e9DbAEf01257968eac0BCbde5DB
- **NEXUS** (Nexus Hub Token) - 0xfDefaF0f9985F092899Fe5278c8b32010b8F3BbC

## Smart Contract Functions

### User Functions

#### bridgeToken
```solidity
function bridgeToken(
    address token,
    uint256 amount,
    string memory destinationChain
) external nonReentrant
```
Bridge tokens to another chain. Deducts bridge fee and locks tokens on source chain.

**Parameters:**
- `token` - Token contract address
- `amount` - Amount to bridge (includes fee)
- `destinationChain` - Name of destination chain (e.g., "Polygon", "Ethereum")

**Events:**
- `TokenBridged` - Emitted when tokens are successfully bridged

#### getUserBridgeHistory
```solidity
function getUserBridgeHistory(address user) 
external view returns (BridgeTransaction[] memory)
```
Retrieve all bridge transactions for a user.

**Returns:**
Array of BridgeTransaction structs containing:
- `token` - Token address
- `amount` - Amount bridged (after fee)
- `fee` - Bridge fee paid
- `timestamp` - Transaction timestamp
- `destinationChain` - Destination chain name
- `completed` - Completion status

#### calculateBridgeFee
```solidity
function calculateBridgeFee(address token, uint256 amount) 
external view returns (uint256)
```
Calculate the bridge fee for a given amount.

### Admin Functions

#### addSupportedToken
```solidity
function addSupportedToken(address token) external onlyOwner
```
Add a new token to the supported tokens list.

#### setBridgeFee
```solidity
function setBridgeFee(uint256 newFeePercentage) external onlyOwner
```
Update bridge fee percentage (basis points). Max 10%.

#### setMaxBridgeAmount
```solidity
function setMaxBridgeAmount(uint256 newMax) external onlyOwner
```
Set maximum bridge amount per transaction.

#### setMinBridgeAmount
```solidity
function setMinBridgeAmount(uint256 newMin) external onlyOwner
```
Set minimum bridge amount per transaction.

#### unbridgeToken
```solidity
function unbridgeToken(
    address token,
    address user,
    uint256 amount,
    string memory sourceChain
) external onlyOwner nonReentrant
```
Release bridged tokens to user on destination chain.

## Fee Structure

### Current Fees
- **Bridge Fee**: 0.25% (25 basis points)
- **Minimum Amount**: 1 token
- **Maximum Amount**: Unlimited

### Example
Bridging 100 SWIFT tokens:
- Bridge Fee: 0.25 SWIFT (0.25%)
- Amount Received: 99.75 SWIFT

## Deployment

### Prerequisites
- Hardhat installed
- Tempo testnet RPC configured
- MetaMask with test funds

### Deploy Bridge Contract

```bash
# Using the deployment script
npm run deploy:bridge

# Or manually with hardhat
npx hardhat run contracts/scripts/deployBridge.cjs --network tempo
```

### Setup Environment

Add to your `.env` file:
```
VITE_BRIDGE_ADDRESS=0x<deployed-bridge-address>
TEMPO_RPC_URL=https://rpc.moderato.tempo.xyz
```

### Verify Deployment

1. Check deployment logs for Bridge address
2. Verify supported tokens were added
3. Test bridging with small amount first

## Frontend Integration

### BridgeCard Component

The `BridgeCard.jsx` component provides a user-friendly interface for:

1. **Token Selection** - Choose from SWIFT, FLUX, NEXUS
2. **Amount Input** - Set bridge amount with MAX button
3. **Chain Selection** - Select destination blockchain
4. **Fee Display** - Shows fee breakdown
5. **Bridge Execution** - Execute bridge with confirmation
6. **History Tracking** - View past bridge transactions

### Example Usage

```jsx
import { BridgeCard } from './components/BridgeCard';

function App() {
  return (
    <BridgeCard />
  );
}
```

## Security Considerations

### Reentrancy Protection
✅ `nonReentrant` modifier on all state-changing functions
✅ SafeERC20 for safe token transfers

### Access Control
✅ `onlyOwner` modifier on admin functions
✅ Fee management only by owner
✅ Token support managed by contract owner

### Input Validation
✅ Token must be supported
✅ Amount validation (min/max checks)
✅ Address validation
✅ Chain name validation

## Testing

### Manual Testing Steps

1. **Connect Wallet**
   - Connect MetaMask to Tempo testnet
   - Ensure account has SWIFT/FLUX/NEXUS tokens

2. **Bridge Tokens**
   - Select token from dropdown
   - Enter amount to bridge
   - Select destination chain
   - Review fee breakdown
   - Click "Bridge Tokens"
   - Confirm in MetaMask

3. **Check History**
   - Click "Show Bridge History"
   - Verify transaction appears
   - Check status (Pending/Completed)

4. **Verify Balances**
   - Check balance decreased by (amount + fee)
   - Verify fee was deducted
   - Monitor for completion on destination

## Troubleshooting

### "Token not supported" Error
- Ensure token is in supported list
- Check token address is correct
- Verify token was added by admin

### "Insufficient token balance" Error
- Check account balance in wallet
- Ensure balance > amount + fee
- Claim more tokens from faucet if needed

### "Bridge contract not configured" Error
- Verify VITE_BRIDGE_ADDRESS in .env
- Deploy Bridge contract if not done
- Restart dev server after env update

### Transaction Fails on Approval
- Check allowance was set correctly
- Verify token contract is valid ERC20
- Check user has sufficient gas

## Advanced Configuration

### Custom Fee Structure
```javascript
// Set 0.5% fee (50 basis points)
await bridge.setBridgeFee(50);
```

### Set Amount Limits
```javascript
// Set 10,000 token minimum
await bridge.setMinBridgeAmount(ethers.parseEther('10000'));

// Set 1,000,000 token maximum
await bridge.setMaxBridgeAmount(ethers.parseEther('1000000'));
```

## API Reference

### Contract Events

#### TokenBridged
```solidity
event TokenBridged(
    address indexed user,
    address indexed token,
    uint256 amount,
    uint256 fee,
    uint256 timestamp,
    string destinationChain
)
```

#### TokenUnbridged
```solidity
event TokenUnbridged(
    address indexed user,
    address indexed token,
    uint256 amount,
    uint256 timestamp,
    string sourceChain
)
```

#### FeeUpdated
```solidity
event FeeUpdated(uint256 newFee)
```

## Future Enhancements

- [ ] Automated relay network for cross-chain settlement
- [ ] Support for wrapped tokens on destination chains
- [ ] Multi-sig admin controls
- [ ] Liquidity provider incentives
- [ ] Bridge aggregation with other protocols
- [ ] Advanced analytics dashboard
- [ ] Mobile app integration

## Support

For issues or questions:
1. Check this documentation
2. Review contract code in `contracts/Bridge.sol`
3. Check browser console for errors
4. Verify network and contract configuration

## License

SPDX-License-Identifier: MIT
