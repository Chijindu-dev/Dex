# 🔗 MetaMask Network Configuration

## Add Tempo Testnet to MetaMask

### Option 1: Manual Addition

1. Open MetaMask
2. Click network dropdown (top-left)
3. Click **"Add Network"** → **"Add a network manually"**
4. Fill in the following details:

| Field | Value |
|-------|-------|
| Network Name | Tempo Testnet (Moderato) |
| RPC URL | https://rpc.moderato.tempo.xyz |
| Chain ID | 42431 |
| Currency Symbol | USD |
| Block Explorer URL | https://explore.tempo.xyz |

5. Click **"Save"**

### Option 2: Direct Link (if available)
If MetaMask supports chain registry links, you can click a link to auto-add it.

---

## Verify Network Added

After adding:
1. Check that "Tempo Testnet (Moderato)" appears in your network dropdown
2. Click to select it
3. Your RPC connection should be established
4. You can now use the DEX on this network

---

## Current Wallet Status

- **Wallet Address:** 0x07D0AC0BA7EAba71d2Ed89c46b6958b833Af26CB
- **Network:** Tempo Testnet (Chain ID: 42431)
- **Balance:** Available from faucet

---

## Token Balances to Check

After connecting, you should see:

| Token | Address | Initial Balance |
|-------|---------|-----------------|
| TEST1 | 0x56005bdCd754fC6742906A6040aE719A43622651 | 1,000,000 |
| TEST2 | 0xa12ecC1228739e9DbAEf01257968eac0BCbde5DB | 1,000,000 |
| TEST3 | 0xfDefaF0f9985F092899Fe5278c8b32010b8F3BbC | 1,000,000 |

(These are the amounts minted during deployment)

---

## Import Tokens into MetaMask

To see token balances in MetaMask UI:

1. Open MetaMask
2. Make sure you're on Tempo Testnet network
3. Click **"Import tokens"** (or **"Add tokens"**)
4. Paste token contract address
5. Token details should auto-fill
6. Click **"Import"**

Repeat for TEST1, TEST2, and TEST3

---

## Troubleshooting

### Network not showing?
- Restart MetaMask
- Clear browser cache
- Re-import network

### Can't see tokens?
- Verify you're on correct network
- Check wallet address is correct
- Wait for RPC to sync balances

### Transaction failing?
- Check gas price is reasonable
- Ensure you have USD balance for gas
- Check network connection

---

**You're all set to use the DEX! Connect MetaMask and start trading.** 🎉
