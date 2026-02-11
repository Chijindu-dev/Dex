// Advanced Example: Custom Swap Integration

import { ethers } from 'ethers';

/**
 * Advanced Integration Example
 * Shows how to perform complex swap operations
 */

const ROUTER_ADDRESS = '0x...';
const FACTORY_ADDRESS = '0x...';

// ABI for Router
const ROUTER_ABI = [
  'function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[])',
  'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) returns (uint256[])',
  'function addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) returns (uint256, uint256, uint256)',
  'function removeLiquidity(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) returns (uint256, uint256)',
];

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

/**
 * Example 1: Perform a swap with slippage protection
 */
export async function executeSwap(
  signer,
  tokenInAddress,
  tokenOutAddress,
  amountIn,
  slippagePercent = 0.5,
  decimalsIn = 18,
  decimalsOut = 18
) {
  try {
    // Create contract instances
    const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
    const tokenIn = new ethers.Contract(tokenInAddress, ERC20_ABI, signer);

    // Parse amount
    const amountInBN = ethers.utils.parseUnits(amountIn, decimalsIn);

    // Get expected output
    const path = [tokenInAddress, tokenOutAddress];
    const amounts = await router.getAmountsOut(amountInBN, path);
    const expectedAmountOut = amounts[1];

    // Calculate minimum with slippage
    const slippageFactor = ethers.utils.parseUnits(
      ((100 - slippagePercent) / 100).toString(),
      18
    );
    const amountOutMin = expectedAmountOut
      .mul(slippageFactor)
      .div(ethers.utils.parseUnits('1', 18));

    // Check and approve if needed
    const allowance = await tokenIn.allowance(
      await signer.getAddress(),
      ROUTER_ADDRESS
    );
    if (allowance.lt(amountInBN)) {
      console.log('Approving tokens...');
      const approveTx = await tokenIn.approve(ROUTER_ADDRESS, ethers.constants.MaxUint256);
      await approveTx.wait();
    }

    // Execute swap
    console.log('Executing swap...');
    const deadline = Math.floor(Date.now() / 1000) + 300; // 5 minute deadline
    
    const swapTx = await router.swapExactTokensForTokens(
      amountInBN,
      amountOutMin,
      path,
      await signer.getAddress(),
      deadline
    );

    const receipt = await swapTx.wait();
    console.log('Swap successful:', receipt.transactionHash);

    return {
      txHash: receipt.transactionHash,
      expectedOutput: ethers.utils.formatUnits(expectedAmountOut, decimalsOut),
      minOutput: ethers.utils.formatUnits(amountOutMin, decimalsOut),
    };
  } catch (error) {
    console.error('Swap failed:', error);
    throw error;
  }
}

/**
 * Example 2: Add liquidity with optimal amounts
 */
export async function addLiquidityOptimal(
  signer,
  tokenAAddress,
  tokenBAddress,
  amountADesired,
  slippagePercent = 0.5,
  decimalsA = 18,
  decimalsB = 18
) {
  try {
    const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
    const tokenA = new ethers.Contract(tokenAAddress, ERC20_ABI, signer);
    const tokenB = new ethers.Contract(tokenBAddress, ERC20_ABI, signer);

    const userAddress = await signer.getAddress();
    const amountABN = ethers.utils.parseUnits(amountADesired, decimalsA);

    // Approve tokens
    console.log('Approving tokens...');
    let approveTx = await tokenA.approve(ROUTER_ADDRESS, ethers.constants.MaxUint256);
    await approveTx.wait();

    approveTx = await tokenB.approve(ROUTER_ADDRESS, ethers.constants.MaxUint256);
    await approveTx.wait();

    // Get current reserves (you'd need to call this separately or estimate)
    // For this example, we'll use a large amountBDesired and let the router optimize
    const amountBDesired = ethers.utils.parseUnits('100', decimalsB); // Estimate

    // Calculate minimum amounts with slippage
    const slippageFactor = ((100 - slippagePercent) / 100);
    const amountAMin = amountABN.mul(Math.floor(slippageFactor * 1000)).div(1000);
    const amountBMin = amountBDesired.mul(Math.floor(slippageFactor * 1000)).div(1000);

    // Add liquidity
    console.log('Adding liquidity...');
    const deadline = Math.floor(Date.now() / 1000) + 300;
    
    const liquidityTx = await router.addLiquidity(
      tokenAAddress,
      tokenBAddress,
      amountABN,
      amountBDesired,
      amountAMin,
      amountBMin,
      userAddress,
      deadline
    );

    const receipt = await liquidityTx.wait();
    console.log('Liquidity added:', receipt.transactionHash);

    return {
      txHash: receipt.transactionHash,
      amountAUsed: ethers.utils.formatUnits(amountABN, decimalsA),
    };
  } catch (error) {
    console.error('Add liquidity failed:', error);
    throw error;
  }
}

/**
 * Example 3: Monitor swap events
 */
export async function subscribeToSwaps(provider, pairAddress, callback) {
  const SWAP_EVENT = 'event Swap(indexed address sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, indexed address to)';

  // Create event filter
  const filter = {
    address: pairAddress,
    topics: [ethers.utils.id(SWAP_EVENT)],
  };

  // Subscribe to events
  provider.on(filter, (log) => {
    const event = {
      transactionHash: log.transactionHash,
      amount0In: log.args.amount0In.toString(),
      amount1In: log.args.amount1In.toString(),
      amount0Out: log.args.amount0Out.toString(),
      amount1Out: log.args.amount1Out.toString(),
    };
    callback(event);
  });

  console.log('Subscribed to swap events on:', pairAddress);
}

/**
 * Example 4: Calculate price impact
 */
export function calculatePriceImpact(
  amountIn,
  expectedOutput,
  actualOutput,
  decimalsIn = 18,
  decimalsOut = 18
) {
  // Input price: 1 unit of input token = output/input
  const inputPrice = parseFloat(ethers.utils.formatUnits(expectedOutput, decimalsOut)) /
                    parseFloat(ethers.utils.formatUnits(amountIn, decimalsIn));

  // Actual price after swap
  const actualPrice = parseFloat(ethers.utils.formatUnits(actualOutput, decimalsOut)) /
                     parseFloat(ethers.utils.formatUnits(amountIn, decimalsIn));

  // Price impact percentage
  const priceImpact = ((inputPrice - actualPrice) / inputPrice) * 100;

  return {
    inputPrice: inputPrice.toFixed(6),
    actualPrice: actualPrice.toFixed(6),
    priceImpact: priceImpact.toFixed(2),
  };
}

/**
 * Example 5: Batch operations
 */
export async function swapAndAddLiquidity(
  signer,
  tokenA,
  tokenB,
  amountAToSwap,
  amountToLiquidity
) {
  try {
    // Step 1: Swap half amount to get tokenB
    console.log('Step 1: Swapping tokens...');
    const swapResult = await executeSwap(
      signer,
      tokenA,
      tokenB,
      amountAToSwap,
      0.5
    );

    // Step 2: Add liquidity
    console.log('Step 2: Adding liquidity...');
    const liquidityResult = await addLiquidityOptimal(
      signer,
      tokenA,
      tokenB,
      amountToLiquidity,
      0.5
    );

    return {
      swap: swapResult,
      liquidity: liquidityResult,
    };
  } catch (error) {
    console.error('Batch operation failed:', error);
    throw error;
  }
}

/**
 * Example 6: Get real-time price
 */
export async function getRealTimePrice(
  provider,
  tokenInAddress,
  tokenOutAddress,
  amountIn = 1,
  decimalsIn = 18,
  decimalsOut = 18
) {
  const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, provider);

  try {
    const amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn);
    const path = [tokenInAddress, tokenOutAddress];

    const amounts = await router.getAmountsOut(amountInBN, path);
    const price = ethers.utils.formatUnits(amounts[1], decimalsOut);

    return {
      inputAmount: amountIn,
      outputAmount: parseFloat(price).toFixed(6),
      price: (parseFloat(price) / amountIn).toFixed(6),
    };
  } catch (error) {
    console.error('Error getting price:', error);
    throw error;
  }
}

// Usage Examples:
/*
// 1. Connect wallet and get signer
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

// 2. Execute swap
const swapResult = await executeSwap(
  signer,
  TOKEN_A_ADDRESS,
  TOKEN_B_ADDRESS,
  '10',
  0.5,
  18,
  18
);

// 3. Add liquidity
const liquidityResult = await addLiquidityOptimal(
  signer,
  TOKEN_A_ADDRESS,
  TOKEN_B_ADDRESS,
  '100',
  0.5,
  18,
  18
);

// 4. Get real-time price
const price = await getRealTimePrice(
  provider,
  TOKEN_A_ADDRESS,
  TOKEN_B_ADDRESS,
  1,
  18,
  18
);
console.log('Current price:', price);
*/
