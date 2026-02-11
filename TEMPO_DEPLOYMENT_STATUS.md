# Tempo Testnet Deployment Status

## Network Details
- Network Name: Tempo Testnet (Moderato)
- RPC URL: https://rpc.moderato.tempo.xyz
- Chain ID: 42431
- Currency: USD
- Explorer: https://explore.tempo.xyz

## Deployment Wallet
- Address: 0x07D0AC0BA7EAba71d2Ed89c46b6958b833Af26CB
- Balance: 0 USD (NEEDS FUNDING)

## Current Status
❌ **BLOCKED**: Wallet has no funds on Tempo testnet

## Next Steps
To deploy contracts, you need to:

1. **Get test USD tokens from Tempo faucet:**
   - Visit: https://explore.tempo.xyz (check for faucet link)
   - Or contact Tempo team for testnet USD tokens
   - Send to address: 0x07D0AC0BA7EAba71d2Ed89c46b6958b833Af26CB

2. **Once funded, run:**
   ```bash
   npx hardhat run contracts/scripts/deployTempo.cjs --network tempo
   ```

3. **After deployment, update .env with contract addresses from output**

## Alternative: Use Sepolia Testnet Instead
If Tempo doesn't have a working faucet, we can deploy to Sepolia testnet:
- You already have the configuration set up
- Just need to get Sepolia test ETH from: https://sepoliafaucet.com/

To deploy to Sepolia:
```bash
npx hardhat run contracts/scripts/deployTestnet.cjs --network sepolia
```
