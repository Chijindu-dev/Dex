# 🔧 Troubleshooting Guide - DEX Issues

## Common Issues & Solutions

### 1. "Swap failed: contract runner does not support sending transactions"

**Cause:** The signer wasn't properly initialized when connecting wallet.

**Solution:** ✅ FIXED - Updated Web3Context to properly await signer

**What we fixed:**
```javascript
// BEFORE (❌ incorrect)
const newSigner = newProvider.getSigner();

// AFTER (✅ correct)
const newSigner = await newProvider.getSigner(accounts[0]);
```

**To resolve:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Reload page (Ctrl+R)
3. Click "Connect Wallet" again
4. Try swap again

---

### 2. "Wallet not showing up"

**Cause:** MetaMask might not be connected to Tempo network

**Solution:**
1. Open MetaMask
2. Check top-left network selector
3. Click to switch to "Tempo Testnet (Moderato)"
4. Reload page

---

### 3. "Insufficient balance for swap"

**Cause:** You don't have TEST tokens

**Solution:**
1. Check your wallet on explorer: https://explore.tempo.xyz
2. Look for TEST1, TEST2, TEST3 token transfers
3. If balance is 0, you need to get tokens from deployment
4. Or request from Tempo testnet faucet

---

### 4. "Slippage too low"

**Cause:** Market impact exceeds slippage tolerance

**Solution:**
1. In Swap tab, increase "Slippage Tolerance"
2. Default is 0.5% - try 1% or 2%
3. Higher slippage = more you accept price movement
4. Try again

---

### 5. "Transaction taking too long"

**Cause:** Network congestion

**Solution:**
1. Wait a few moments
2. Check on explorer: https://explore.tempo.xyz
3. Search for your wallet address
4. See transaction status
5. If stuck, refresh page

---

### 6. "Tokens not approved"

**Cause:** Token allowance not set for router

**Solution:**
1. Click "Approve TEST1" button
2. Sign transaction in MetaMask
3. Wait for confirmation
4. Then click "Swap"

---

## Debug Steps

If you encounter any issues:

### Step 1: Check Console Logs
1. Open browser DevTools (F12)
2. Go to "Console" tab
3. Look for error messages
4. Share the error with relevant context

### Step 2: Verify Network
1. Open MetaMask
2. Check network is "Tempo Testnet (Moderato)"
3. Check Chain ID shows "42431"
4. If wrong, switch network and refresh

### Step 3: Verify Wallet Connection
1. Look for wallet address displayed
2. Check account matches MetaMask
3. Check balance shows a number
4. If blank, reconnect wallet

### Step 4: Check Contract Addresses
1. Verify in browser console:
   - Router: 0x558B8673b125EED2b99393F111688C39315859A5
   - Factory: 0xF28d61F4C69f08E653d2Cb747A74ebecea658bF7
2. If different, update .env file
3. Restart dev server

---

## Browser Console Diagnostics

When connected to the DEX, your browser console should show:

```
✓ Wallet connected successfully!
✓ Accounts: ['0x07D0AC0BA7EAba71d2Ed89c46b6958b833Af26CB']
✓ Provider initialized
✓ Signer obtained
```

If you see errors instead, share the exact error message.

---

## MetaMask Troubleshooting

### MetaMask showing "RPC Error"
1. Network might be down
2. Try alternative RPC: https://rpc.moderato.tempo.xyz
3. If already configured, try removing and re-adding network

### MetaMask won't connect
1. Extension might be locked
2. Click MetaMask icon
3. Enter password to unlock
4. Try connecting again

### Gas estimation failing
1. Often temporary network issue
2. Refresh page
3. Try transaction again
4. Or wait a moment

---

## Contact Support

If issues persist:

1. **Check explorer** for transaction status: https://explore.tempo.xyz
2. **Review logs** in browser console (F12)
3. **Test wallet** by sending small amount to verify it works
4. **Verify RPC** is responding: https://rpc.moderato.tempo.xyz

---

## Recent Fix Applied

**Date:** Feb 11, 2026
**Issue:** Signer not properly initialized for transactions
**Fix:** Updated Web3Context to properly await signer with account
**Status:** ✅ RESOLVED

If you still see "contract runner does not support sending transactions" after the fix:
1. Hard refresh page (Ctrl+Shift+R)
2. Clear browser cache
3. Reconnect wallet
4. Try again

---

**Need more help? Check the QUICK_START.md guide for step-by-step instructions.**
