# Architecture & Technical Design

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  SwapCard    │  │LiquidityCard │  │PoolExplorer  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         ▼                  ▼                  ▼         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Web3Context + ethers.js                 │  │
│  └──────────────────────────────────────────────────┘  │
│                        ▼                               │
├─────────────────────────────────────────────────────────┤
│            Smart Contracts Layer (Solidity)            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │  DexFactory                                    │   │
│  │  - createPair(tokenA, tokenB)                  │   │
│  │  - getPair(tokenA, tokenB)                     │   │
│  │  - allPairs tracking                           │   │
│  └────────────────────────────────────────────────┘   │
│                        ▼                               │
│  ┌────────────────────────────────────────────────┐   │
│  │  DexPair (x*y=k)                               │   │
│  │  - mint(to) → LP Tokens                        │   │
│  │  - burn(to) → Token returns                    │   │
│  │  - swap() → Token exchange                     │   │
│  │  - Fee: 0.3%                                   │   │
│  └────────────────────────────────────────────────┘   │
│                        ▲                               │
│  ┌────────────────────────────────────────────────┐   │
│  │  DexRouter                                     │   │
│  │  - addLiquidity()                              │   │
│  │  - removeLiquidity()                           │   │
│  │  - swapExactTokensForTokens()                  │   │
│  │  - getAmountsOut() → Price calculation         │   │
│  └────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│          Blockchain Layer (Ethereum/Sepolia)          │
├─────────────────────────────────────────────────────────┤
│                  Constant Product AMM                  │
│                    Reserve₀ × Reserve₁ = k             │
└─────────────────────────────────────────────────────────┘
```

## Core Mechanics

### Constant Product Formula

The AMM maintains: `x * y = k`

Where:
- `x` = Reserve of token0
- `y` = Reserve of token1
- `k` = Constant product

#### Swap Example
```
User swaps 10 tokenA for tokenB

Input:  x increases → 100 + 10 = 110
Maintain: k = 100 * 100 = 10000
Solve:  110 * y = 10000 → y = 90.9
Output: 100 - 90.9 = 9.09 tokenB

After 0.3% fee: 9.09 * 0.997 ≈ 9.06 tokenB
```

### Liquidity Provider Flow

```
Add Liquidity:
  1. User approves router for both tokens
  2. Router calculates optimal amounts using _quote()
  3. User sends tokens to pair contract
  4. Pair.mint() mints LP tokens based on contribution
  5. User receives LP tokens representing pool share

Remove Liquidity:
  1. User burns LP tokens on pair
  2. Pair.burn() calculates pro-rata token returns
  3. Tokens transferred back to user
```

### Swap Flow

```
Step 1: User calls swapExactTokensForTokens()
         ▼
Step 2: Router calculates output via getAmountOut()
         ▼
Step 3: Router transfers input tokens from user to pair
         ▼
Step 4: Pair.swap() validates k = x * y
         ▼
Step 5: Pair sends output tokens to recipient
         ▼
Step 6: Event emitted for indexing
```

## Contract State Diagram

```
┌─────────────────────────────────────────┐
│            DexFactory                   │
├─────────────────────────────────────────┤
│ • feeTo: address                        │
│ • feeToSetter: address                  │
│ • getPair[token0][token1]: address      │
│ • allPairs[]: address[]                 │
└──────────────────┬──────────────────────┘
                   │ creates
                   ▼
┌─────────────────────────────────────────┐
│              DexPair                    │
├─────────────────────────────────────────┤
│ • token0, token1: ERC20                 │
│ • reserve0, reserve1: uint256           │
│ • price0CumulativeLast: uint256         │
│ • price1CumulativeLast: uint256         │
│ • LPToken (ERC20 LP balance)            │
└──────────────────┬──────────────────────┘
                   │ used by
                   ▼
┌─────────────────────────────────────────┐
│              DexRouter                  │
├─────────────────────────────────────────┤
│ • factory: DexFactory                   │
│ • view functions for pricing            │
│ • user interaction functions            │
└─────────────────────────────────────────┘
```

## Security Features

### 1. Reentrancy Protection
```solidity
function mint(address to) external nonReentrant returns (uint256 liquidity) {
    // Protected from reentrancy attacks
}
```

### 2. Constant Product Validation
```solidity
require(
    balance0Adjusted * balance1Adjusted >= _reserve0 * _reserve1 * (FEE_DENOMINATOR ** 2),
    "DexPair: K_INSUFFICIENT"
);
```

### 3. Slippage Protection
```solidity
uint256 minOutput = outputAmount.mul(100 - slippage).div(100);
require(actualOutput >= minOutput, "INSUFFICIENT_OUTPUT_AMOUNT");
```

### 4. Deadline Enforcement
```solidity
modifier ensure(uint256 deadline) {
    require(deadline >= block.timestamp, "DexRouter: EXPIRED");
    _;
}
```

### 5. Safe Token Transfers
```solidity
function _safeTransfer(address token, address to, uint256 value) private {
    (bool success, bytes memory data) = token.call(
        abi.encodeWithSelector(IERC20.transfer.selector, to, value)
    );
    require(success && (data.length == 0 || abi.decode(data, (bool))), "TRANSFER_FAILED");
}
```

## Gas Optimization Strategies

1. **CREATE2 for Deterministic Addresses**
   - No need for factory mapping lookup
   - Pair address can be predicted

2. **Efficient Reserve Updates**
   - Single `_update()` call per operation
   - Cumulative price stored for TWAP

3. **Inline Critical Functions**
   - sqrt() implemented in contract
   - Reduces external calls

## Data Flow for Swap Transaction

```
User Interface
   │
   ├─ Select tokenA → tokenB
   ├─ Enter amount
   └─ Preview output (getAmountsOut)
       │
       ▼
   Web3 Context
   │
   ├─ Get signer
   ├─ Approve tokens (if needed)
   └─ Call swapExactTokensForTokens()
       │
       ▼
   Smart Contract
   │
   ├─ Validate path
   ├─ Calculate optimal amounts
   ├─ Check k = x * y
   ├─ Update reserves
   ├─ Emit Swap event
   └─ Transfer tokens
       │
       ▼
   Frontend
   │
   ├─ Update balances
   ├─ Show success message
   └─ Clear form
```

## Frontend State Management

```jsx
Web3Context
├─ account: string
├─ provider: ethers.Provider
├─ signer: ethers.Signer
├─ chainId: number
├─ balance: string
└─ connectWallet(): Promise

SwapCard Component
├─ tokenIn: Token | null
├─ tokenOut: Token | null
├─ amountIn: string
├─ amountOut: string
├─ slippage: number
└─ handleSwap(): Promise

LiquidityCard Component
├─ tokenA: Token | null
├─ tokenB: Token | null
├─ amountA: string
├─ amountB: string
└─ handleAddLiquidity(): Promise
```

## Event Flow for Indexing

```
DexFactory Events:
  PairCreated(indexed token0, indexed token1, address pair, uint)

DexPair Events:
  Mint(indexed sender, uint amount0, uint amount1)
  Burn(indexed sender, uint amount0, uint amount1, indexed to)
  Swap(indexed sender, uint amount0In, uint amount1In, 
       uint amount0Out, uint amount1Out, indexed to)
  Sync(uint reserve0, uint reserve1)
```

These events enable The Graph to index data for UI queries.

