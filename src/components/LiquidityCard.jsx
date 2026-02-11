// src/components/LiquidityCard.jsx
import React, { useState, useContext } from 'react';
import { ethers, parseUnits, formatUnits, Contract } from 'ethers';
import { Web3Context } from '../context/Web3Context';
import { useTokenBalance } from '../hooks/useTokenBalance';
import { TokenSelector } from './TokenSelector';
import './LiquidityCard.css';

const ROUTER_ABI = [
  'function addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) returns (uint256 amountA, uint256 amountB, uint256 liquidity)',
  'function removeLiquidity(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) returns (uint256 amountA, uint256 amountB)',
  'function getReserves(address tokenA, address tokenB) view returns (uint256 reserveA, uint256 reserveB)',
];

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
];

export function LiquidityCard({ routerAddress }) {
  const { account, signer, provider } = useContext(Web3Context);
  const [mode, setMode] = useState('add'); // 'add' or 'remove'
  const [tokenA, setTokenA] = useState(null);
  const [tokenB, setTokenB] = useState(null);
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [loading, setLoading] = useState(false);

  const balanceA = useTokenBalance(tokenA?.address, account);
  const balanceB = useTokenBalance(tokenB?.address, account);

  const handleAddLiquidity = async () => {
    if (!account || !signer || !tokenA || !tokenB || !amountA || !amountB) return;

    try {
      setLoading(true);

      const amountABN = parseUnits(amountA, tokenA.decimals);
      const amountBBN = parseUnits(amountB, tokenB.decimals);

      // Approve tokens
      const tokenAContract = new Contract(tokenA.address, ERC20_ABI, signer);
      const tokenBContract = new Contract(tokenB.address, ERC20_ABI, signer);

      const approveTxA = await tokenAContract.approve(routerAddress, amountABN);
      await approveTxA.wait();

      const approveTxB = await tokenBContract.approve(routerAddress, amountBBN);
      await approveTxB.wait();

      // Add liquidity
      const router = new Contract(routerAddress, ROUTER_ABI, signer);
      const deadline = Math.floor(Date.now() / 1000) + 300;

      const tx = await router.addLiquidity(
        tokenA.address,
        tokenB.address,
        amountABN,
        amountBBN,
        0,
        0,
        account,
        deadline
      );

      await tx.wait();
      alert('Liquidity added successfully!');
      setAmountA('');
      setAmountB('');
    } catch (error) {
      console.error('Error adding liquidity:', error);
      alert('Failed to add liquidity: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="liquidity-card">
      <div className="liquidity-header">
        <h2>Manage Liquidity</h2>
        <div className="mode-toggle">
          <button
            className={mode === 'add' ? 'active' : ''}
            onClick={() => setMode('add')}
          >
            Add
          </button>
          <button
            className={mode === 'remove' ? 'active' : ''}
            onClick={() => setMode('remove')}
          >
            Remove
          </button>
        </div>
      </div>

      {mode === 'add' ? (
        <div className="liquidity-inputs">
          <div className="input-group">
            <label>Token A</label>
            <div className="input-wrapper">
              <input
                type="number"
                value={amountA}
                onChange={(e) => setAmountA(e.target.value)}
                placeholder="0.0"
                className="token-input"
              />
              <TokenSelector
                value={tokenA}
                onChange={setTokenA}
                excludeToken={tokenB?.address}
              />
            </div>
            <div className="balance-info">
              Balance: {balanceA.balance} {balanceA.symbol}
            </div>
          </div>

          <div className="plus-sign">+</div>

          <div className="input-group">
            <label>Token B</label>
            <div className="input-wrapper">
              <input
                type="number"
                value={amountB}
                onChange={(e) => setAmountB(e.target.value)}
                placeholder="0.0"
                className="token-input"
              />
              <TokenSelector
                value={tokenB}
                onChange={setTokenB}
                excludeToken={tokenA?.address}
              />
            </div>
            <div className="balance-info">
              Balance: {balanceB.balance} {balanceB.symbol}
            </div>
          </div>

          <button
            className="liquidity-btn"
            onClick={handleAddLiquidity}
            disabled={!account || loading || !amountA || !tokenA || !tokenB}
          >
            {loading ? 'Adding...' : 'Add Liquidity'}
          </button>
        </div>
      ) : (
        <div className="remove-liquidity">
          <p>Remove Liquidity feature coming soon...</p>
        </div>
      )}
    </div>
  );
}
