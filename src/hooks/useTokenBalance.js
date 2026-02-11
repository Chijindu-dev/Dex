// src/hooks/useTokenBalance.js
import { useState, useEffect, useContext } from 'react';
import { Contract, formatUnits } from 'ethers';
import { Web3Context } from '../context/Web3Context';

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
];

export function useTokenBalance(tokenAddress, account) {
  const [balance, setBalance] = useState('0');
  const [decimals, setDecimals] = useState(18);
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const { provider } = useContext(Web3Context);

  useEffect(() => {
    if (!tokenAddress || !account || !provider) {
      setBalance('0');
      setSymbol('');
      return;
    }

    const fetchBalance = async () => {
      try {
        setLoading(true);
        const contract = new Contract(tokenAddress, ERC20_ABI, provider);
        
        const [balanceResult, decimalsResult, symbolResult] = await Promise.all([
          contract.balanceOf(account),
          contract.decimals(),
          contract.symbol(),
        ]);

        setBalance(formatUnits(balanceResult, decimalsResult));
        setDecimals(decimalsResult);
        setSymbol(symbolResult);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance('0');
        setSymbol('N/A');
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [tokenAddress, account, provider]);

  return { balance, decimals, symbol, loading };
}
