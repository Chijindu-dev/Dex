# 🚀 Quick Start - Test Your DEX

## Step 1: Start the Development Server

```bash
npm run dev
```

You should see output like:
```
VITE v7.3.1 ready in XXX ms

➜  Local:   http://localhost:5173/
```

## Step 2: Open in Browser

Visit: http://localhost:5173

You should see:
- ☀️/🌙 Theme toggle (top-right)
- 🔗 Connect Wallet button
- SWAP and LIQUIDITY tabs

## Step 3: Connect MetaMask

1. Click **"Connect Wallet"** button
2. MetaMask popup appears
3. Select the Tempo Testnet network (if not already selected)
4. Click **"Connect"**

You should see your wallet address displayed

## Step 4: Test a Swap

1. Click **SWAP** tab
2. You should see TEST1, TEST2, TEST3 tokens available
3. Select TEST1 as input token
4. Select TEST2 as output token
5. Enter an amount (e.g., 10 TEST1)
6. Click **"Approve TEST1"** (if needed)
7. Click **"Swap"**
8. Confirm transaction in MetaMask

Expected result: You send TEST1, receive TEST2

## Step 5: Test Liquidity

1. Click **LIQUIDITY** tab
2. Select TEST1 and TEST2
3. Enter amount for both (e.g., 5 each)
4. Click **"Add Liquidity"**
5. Confirm transaction in MetaMask

Expected result: You get LP tokens in return

## Step 6: Verify on Explorer

1. After transaction completes, visit: https://explore.tempo.xyz
2. Paste your wallet address
3. You should see:
   - Token balances updated
   - Transaction history
   - Approved tokens

---

## 📊 Network Details

- **Network:** Tempo Testnet (Moderato)
- **Chain ID:** 42431
- **RPC:** https://rpc.moderato.tempo.xyz
- **Explorer:** https://explore.tempo.xyz
- **Currency:** USD

## 🔗 Contract Addresses

| Contract | Address |
|----------|---------|
| DexFactory | 0xF28d61F4C69f08E653d2Cb747A74ebecea658bF7 |
| DexRouter | 0x558B8673b125EED2b99393F111688C39315859A5 |
| TEST1 | 0x56005bdCd754fC6742906A6040aE719A43622651 |
| TEST2 | 0xa12ecC1228739e9DbAEf01257968eac0BCbde5DB |
| TEST3 | 0xfDefaF0f9985F092899Fe5278c8b32010b8F3BbC |

## 🔧 Common Issues

### "Wallet not connected"
- Click Connect Wallet button again
- Make sure MetaMask is open
- Check you're on Tempo Testnet network

### "Insufficient balance"
- You need test tokens
- Check https://explore.tempo.xyz to see your balance
- Deploy tokens or request from faucet

### "Transaction reverted"
- Check slippage tolerance (0.5% default)
- Ensure sufficient liquidity in pool
- Verify token addresses are correct

---

**Ready to test? Run `npm run dev` and connect your wallet!** 🎉
