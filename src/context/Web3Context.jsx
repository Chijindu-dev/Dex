// src/context/Web3Context.jsx
import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import { ethers, formatEther } from 'ethers';

export const Web3Context = createContext();

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isConnecting, setIsConnecting] = useState(false);
  const listenersRef = useRef(null);

  // Handle account changes
  const handleAccountsChanged = useCallback((accounts) => {
    console.log('Accounts changed:', accounts);
    if (accounts.length === 0) {
      setAccount(null);
      setProvider(null);
      setSigner(null);
      setBalance('0');
    } else {
      setAccount(accounts[0]);
    }
  }, []);

  // Handle chain changes
  const handleChainChanged = useCallback(() => {
    console.log('Chain changed');
    window.location.reload();
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      if (!window.ethereum) {
        alert('Please install MetaMask!');
        return;
      }

      console.log('Requesting accounts...');
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      console.log('Accounts:', accounts);
      
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const newSigner = await newProvider.getSigner(accounts[0]);
      const network = await newProvider.getNetwork();
      const userBalance = await newProvider.getBalance(accounts[0]);

      setProvider(newProvider);
      setSigner(newSigner);
      setAccount(accounts[0]);
      setChainId(network.chainId);
      setBalance(formatEther(userBalance));

      // Setup event listeners with stored references
      if (!listenersRef.current) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        listenersRef.current = { handleAccountsChanged, handleChainChanged };
      }

      console.log('Wallet connected successfully!');
    } catch (error) {
      console.error('Connection error:', error);
      alert('Failed to connect wallet: ' + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    console.log('Disconnecting wallet...');
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setBalance('0');
    
    // Remove event listeners
    if (window.ethereum && listenersRef.current) {
      window.ethereum.removeListener('accountsChanged', listenersRef.current.handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', listenersRef.current.handleChainChanged);
      listenersRef.current = null;
    }
  };

  // Switch network
  const switchNetwork = async (targetChainId) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error) {
      if (error.code === 4902) {
        console.error('Network not added to MetaMask');
      }
    }
  };

  const value = {
    account,
    provider,
    signer,
    chainId,
    balance,
    isConnecting,
    connectWallet,
    disconnect,
    switchNetwork,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}
