// src/components/SwapCard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { ethers, parseUnits, formatUnits, Contract } from 'ethers';
import { Web3Context } from '../context/Web3Context';
import { useTokenBalance } from '../hooks/useTokenBalance';
import { TokenSelector } from './TokenSelector';
import './SwapCard.css';

const ROUTER_ABI = [
  'function getAmountsOut(uint256 amountIn, address[] calldata path) view returns (uint256[] memory amounts)',
  'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) returns (uint256[] memory amounts)',
];

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
];

export function SwapCard({ routerAddress, factoryAddress }) {
  const { account, signer, provider, connectWallet } = useContext(Web3Context);
  const [tokenIn, setTokenIn] = useState(null);
  const [tokenOut, setTokenOut] = useState(null);
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('0');
  const [slippage, setSlippage] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [priceImpact, setPriceImpact] = useState(0);

  const inBalance = useTokenBalance(tokenIn?.address, account);
  const outBalance = useTokenBalance(tokenOut?.address, account);

  // Calculate output amount
  useEffect(() => {
    if (!amountIn || !tokenIn || !tokenOut || !provider) {
      setAmountOut('0');
      return;
    }

    const calculateOutput = async () => {
      try {
        // Check if router address is valid
        if (!routerAddress || routerAddress === '0x0000000000000000000000000000000000000000') {
          console.warn('Router address not set');
          return;
        }

        const router = new Contract(routerAddress, ROUTER_ABI, provider);
        const path = [tokenIn.address, tokenOut.address];
        const inputAmount = parseUnits(amountIn || '0', tokenIn.decimals);

        const amounts = await router.getAmountsOut(inputAmount, path);
        const output = formatUnits(amounts[1], tokenOut.decimals);
        setAmountOut(output);

        // Calculate price impact (simplified)
        const impact = Math.min(2, parseFloat(amountIn) * 0.01);
        setPriceImpact(Math.max(0, impact));
      } catch (error) {
        console.error('Error calculating output:', error);
        setAmountOut('0');
      }
    };

    const debounceTimer = setTimeout(calculateOutput, 500);
    return () => clearTimeout(debounceTimer);
  }, [amountIn, tokenIn, tokenOut, provider, routerAddress]);

  const handleSwap = async () => {
    if (!account || !signer || !tokenIn || !tokenOut || !amountIn) {
      alert('Please connect wallet and select tokens');
      console.log('Validation failed:', { account, signer: !!signer, tokenIn, tokenOut, amountIn });
      return;
    }

    if (!routerAddress || routerAddress === '0x0000000000000000000000000000000000000000') {
      alert('Router address not configured. Please deploy contracts first.');
      return;
    }

    try {
      setLoading(true);
      console.log('Starting swap...');
      console.log('Signer:', signer);
      console.log('Account:', account);

      // Approve token spending
      const tokenContract = new Contract(tokenIn.address, ERC20_ABI, signer);
      const inputAmount = parseUnits(amountIn, tokenIn.decimals);
      
      console.log('Approving token spend...');
      const approveTx = await tokenContract.approve(routerAddress, inputAmount);
      console.log('Approve TX:', approveTx);
      await approveTx.wait();
      console.log('Approval confirmed');

      // Execute swap
      const router = new Contract(routerAddress, ROUTER_ABI, signer);
      const outputAmount = parseUnits(amountOut, tokenOut.decimals);
      const minOutput = (outputAmount * BigInt(100 - Math.floor(slippage * 100))) / BigInt(100);
      const deadline = Math.floor(Date.now() / 1000) + 300;

      const path = [tokenIn.address, tokenOut.address];
      console.log('Executing swap...', { inputAmount, minOutput, path, account, deadline });
      const swapTx = await router.swapExactTokensForTokens(
        inputAmount,
        minOutput,
        path,
        account,
        deadline
      );

      console.log('Swap TX:', swapTx);
      
      // Wait for the transaction receipt
      const receipt = await swapTx.wait();
      console.log('Swap successful:', receipt);
      
      if (receipt && receipt.transactionHash) {
        alert('Swap successful! TX: ' + receipt.transactionHash.substring(0, 10) + '...');
      } else {
        alert('Swap completed!');
      }

      // Reset form
      setAmountIn('');
      setAmountOut('0');
    } catch (error) {
      console.error('Swap error:', error);
      alert('Swap failed: ' + (error?.message || error));
    } finally {
      setLoading(false);
    }
  };

  const swapTokens = () => {
    const temp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(temp);
    setAmountIn('');
    setAmountOut('0');
  };

  return (
    <div className="swap-card">
      <div className="swap-header">
        <h2>Swap</h2>
        <div className="settings">
          <label>Slippage: {slippage.toFixed(1)}%</label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={slippage}
            onChange={(e) => setSlippage(parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className="swap-input-group">
        <div className="swap-input-label">
          <span>You pay</span>
          <span className="balance-display">Max: {inBalance.balance} {inBalance.symbol}</span>
        </div>
        <div className="swap-input-container">
          <input
            type="number"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            placeholder="0.0"
          />
          <TokenSelector
            value={tokenIn}
            onChange={setTokenIn}
            excludeToken={tokenOut?.address}
          />
        </div>
      </div>

      <div className="swap-direction-btn">
        <button onClick={swapTokens} title="Swap tokens">
          ⇅
        </button>
      </div>

      <div className="swap-input-group">
        <div className="swap-input-label">
          <span>You receive</span>
          <span className="balance-display">Max: {outBalance.balance} {outBalance.symbol}</span>
        </div>
        <div className="swap-input-container">
          <input
            type="number"
            value={amountOut}
            readOnly
            placeholder="0.0"
          />
          <TokenSelector
            value={tokenOut}
            onChange={setTokenOut}
            excludeToken={tokenIn?.address}
          />
        </div>
      </div>

      {amountOut && parseFloat(amountOut) > 0 && (
        <div className="price-info">
          <div className="price-info-item">
            <span className="price-info-label">Price Impact</span>
            <span className={`price-info-value ${priceImpact > 5 ? 'price-impact high' : 'price-impact'}`}>
              {priceImpact.toFixed(2)}%
            </span>
          </div>
          <div className="price-info-item">
            <span className="price-info-label">Min. Received</span>
            <span className="price-info-value">
              {(parseFloat(amountOut) * (1 - slippage / 100)).toFixed(6)} {tokenOut?.symbol}
            </span>
          </div>
        </div>
      )}

      {!account ? (
        <button className="swap-btn" onClick={connectWallet}>
          Connect Wallet
        </button>
      ) : (
        <button
          className="swap-btn"
          onClick={handleSwap}
          disabled={loading || !amountIn || parseFloat(amountIn) <= 0 || !tokenIn || !tokenOut}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Swapping...
            </>
          ) : (
            'Swap'
          )}
        </button>
      )}
    </div>
  );
}
