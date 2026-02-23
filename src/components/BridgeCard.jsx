// src/components/BridgeCard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { Web3Context } from '../context/Web3Context';
import { TokenSelector } from './TokenSelector';
import './BridgeCard.css';

// BRIDGE_ADDRESS should be set after deployment
const BRIDGE_ADDRESS = import.meta.env.VITE_BRIDGE_ADDRESS || '';

// Supported chains for bridging
const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum', rpc: 'https://eth.rpc.com' },
  { id: 137, name: 'Polygon', rpc: 'https://polygon-rpc.com' },
  { id: 43114, name: 'Avalanche', rpc: 'https://api.avax.network/ext/bc/C/rpc' },
  { id: 56, name: 'BSC', rpc: 'https://bsc-dataseed1.binance.org' },
  { id: 42431, name: 'Tempo', rpc: 'https://rpc.moderato.tempo.xyz' },
];

// Bridge contract ABI (essential functions)
const BRIDGE_ABI = [
  'function bridgeToken(address token, uint256 amount, string memory destinationChain) external',
  'function supportedTokens(address) public view returns (bool)',
  'function calculateBridgeFee(address token, uint256 amount) public view returns (uint256)',
  'function minBridgeAmount() public view returns (uint256)',
  'function maxBridgeAmount() public view returns (uint256)',
  'function getUserBridgeHistory(address user) external view returns ((address,uint256,uint256,uint256,string,bool)[])',
];

// Token ABI (basic ERC20)
const TOKEN_ABI = [
  'function balanceOf(address) public view returns (uint256)',
  'function approve(address spender, uint256 amount) public returns (bool)',
  'function allowance(address owner, address spender) public view returns (uint256)',
  'function decimals() public view returns (uint8)',
];

export function BridgeCard() {
  const { account, signer, provider, balance } = useContext(Web3Context);

  // State
  const [selectedToken, setSelectedToken] = useState(null);
  const [amount, setAmount] = useState('');
  const [destinationChain, setDestinationChain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState('0');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bridgeHistory, setBridgeHistory] = useState([]);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [showHistory, setShowHistory] = useState(false);

  // Predefined tokens for bridge (same as swap)
  const BRIDGE_TOKENS = [
    { 
      symbol: 'SWIFT', 
      name: 'Swift Exchange Token',
      address: '0x56005bdCd754fC6742906A6040aE719A43622651', 
      decimals: 18
    },
    { 
      symbol: 'FLUX', 
      name: 'Flux Liquidity Token',
      address: '0xa12ecC1228739e9DbAEf01257968eac0BCbde5DB', 
      decimals: 18
    },
    { 
      symbol: 'NEXUS', 
      name: 'Nexus Hub Token',
      address: '0xfDefaF0f9985F092899Fe5278c8b32010b8F3BbC', 
      decimals: 18
    },
  ];

  // Update token balance when token changes
  useEffect(() => {
    const updateTokenBalance = async () => {
      if (!selectedToken || !provider) {
        setTokenBalance('0');
        return;
      }

      try {
        const tokenContract = new ethers.Contract(
          selectedToken.address,
          TOKEN_ABI,
          provider
        );
        const balance = await tokenContract.balanceOf(account);
        const decimals = await tokenContract.decimals();
        setTokenBalance(ethers.formatUnits(balance, decimals));
      } catch (err) {
        console.error('Error fetching token balance:', err);
        setTokenBalance('0');
      }
    };

    updateTokenBalance();
  }, [selectedToken, account, provider]);

  // Calculate fee when amount changes
  useEffect(() => {
    const calculateFee = async () => {
      if (!selectedToken || !amount || !provider || !BRIDGE_ADDRESS) {
        setEstimatedFee('0');
        return;
      }

      try {
        const bridgeContract = new ethers.Contract(
          BRIDGE_ADDRESS,
          BRIDGE_ABI,
          provider
        );

        const amountWei = ethers.parseUnits(amount, selectedToken.decimals);
        const feeWei = await bridgeContract.calculateBridgeFee(selectedToken.address, amountWei);
        setEstimatedFee(ethers.formatUnits(feeWei, selectedToken.decimals));
      } catch (err) {
        console.error('Error calculating fee:', err);
        setEstimatedFee('0');
      }
    };

    calculateFee();
  }, [amount, selectedToken, provider]);

  // Fetch bridge history
  useEffect(() => {
    const fetchHistory = async () => {
      if (!account || !signer || !BRIDGE_ADDRESS) return;

      try {
        const bridgeContract = new ethers.Contract(
          BRIDGE_ADDRESS,
          BRIDGE_ABI,
          signer
        );

        const history = await bridgeContract.getUserBridgeHistory(account);
        setBridgeHistory(history || []);
      } catch (err) {
        console.error('Error fetching bridge history:', err);
      }
    };

    if (showHistory) {
      fetchHistory();
    }
  }, [account, signer, showHistory]);

  // Handle bridge
  const handleBridge = async () => {
    if (!account) {
      setError('Please connect your wallet');
      return;
    }

    if (!selectedToken) {
      setError('Please select a token');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!destinationChain) {
      setError('Please select a destination chain');
      return;
    }

    if (!BRIDGE_ADDRESS) {
      setError('Bridge contract not configured');
      return;
    }

    if (parseFloat(amount) > parseFloat(tokenBalance)) {
      setError('Insufficient token balance');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const tokenContract = new ethers.Contract(
        selectedToken.address,
        TOKEN_ABI,
        signer
      );

      const amountWei = ethers.parseUnits(amount, selectedToken.decimals);

      // Check and approve if needed
      const allowance = await tokenContract.allowance(account, BRIDGE_ADDRESS);
      
      if (allowance < amountWei) {
        setError('Approving token...');
        const approveTx = await tokenContract.approve(BRIDGE_ADDRESS, amountWei);
        const approveReceipt = await approveTx.wait();
        
        if (!approveReceipt) {
          throw new Error('Approval transaction failed');
        }
        setError('');
      }

      // Execute bridge
      setError('Bridging tokens...');
      const bridgeContract = new ethers.Contract(
        BRIDGE_ADDRESS,
        BRIDGE_ABI,
        signer
      );

      const bridgeTx = await bridgeContract.bridgeToken(
        selectedToken.address,
        amountWei,
        destinationChain
      );

      const receipt = await bridgeTx.wait();

      if (receipt && receipt.status === 1) {
        setAmount('');
        setDestinationChain('');
        setError('');
        setSuccess('');
        
        // Refresh token balance
        const newBalance = await tokenContract.balanceOf(account);
        const decimals = await tokenContract.decimals();
        setTokenBalance(ethers.formatUnits(newBalance, decimals));
        
        // Refresh bridge history
        try {
          const bridgeContractForHistory = new ethers.Contract(
            BRIDGE_ADDRESS,
            BRIDGE_ABI,
            signer
          );
          const history = await bridgeContractForHistory.getUserBridgeHistory(account);
          setBridgeHistory(history || []);
        } catch (err) {
          console.error('Error refreshing bridge history:', err);
        }
      } else {
        throw new Error('Bridge transaction failed');
      }
    } catch (err) {
      console.error('Bridge error:', err);
      setError(err.reason || err.message || 'Bridge failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Format address
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className="bridge-container">
      <div className="bridge-card">
        <h2 className="bridge-title">Token Bridge</h2>
        <p className="bridge-subtitle">Bridge your tokens across multiple chains</p>

        {/* Token Selection */}
        <div className="bridge-section">
          <label className="bridge-label">Select Token</label>
          <div className="token-selection-wrapper">
            <TokenSelector
              value={selectedToken}
              onChange={setSelectedToken}
              excludeToken={null}
            />
            {selectedToken && (
              <div className="token-selected-info">
                <span className="selected-symbol">{selectedToken.symbol}</span>
                <span className="selected-balance">
                  Balance: {parseFloat(tokenBalance).toFixed(4)} {selectedToken.symbol}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Amount Input */}
        <div className="bridge-section">
          <label className="bridge-label">Amount</label>
          <div className="amount-input-group">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="bridge-input"
              disabled={!selectedToken || isLoading}
            />
            {selectedToken && (
              <button
                className="max-button"
                onClick={() => setAmount(tokenBalance)}
                disabled={isLoading}
              >
                MAX
              </button>
            )}
          </div>
        </div>

        {/* Destination Chain */}
        <div className="bridge-section">
          <label className="bridge-label">Destination Chain</label>
          <select
            value={destinationChain}
            onChange={(e) => setDestinationChain(e.target.value)}
            className="bridge-select"
            disabled={isLoading}
          >
            <option value="">Select a chain...</option>
            {SUPPORTED_CHAINS.map((chain) => (
              <option key={chain.id} value={chain.name}>
                {chain.name}
              </option>
            ))}
          </select>
        </div>

        {/* Fee Display */}
        {selectedToken && amount && (
          <div className="fee-display">
            <div className="fee-row">
              <span>Amount:</span>
              <span className="fee-value">{amount} {selectedToken.symbol}</span>
            </div>
            <div className="fee-row">
              <span>Bridge Fee:</span>
              <span className="fee-value highlight">{parseFloat(estimatedFee).toFixed(6)} {selectedToken.symbol}</span>
            </div>
            <div className="fee-row total">
              <span>You'll receive:</span>
              <span className="fee-value">
                {(parseFloat(amount) - parseFloat(estimatedFee)).toFixed(6)} {selectedToken.symbol}
              </span>
            </div>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && <div className="bridge-message error">{error}</div>}
        {success && <div className="bridge-message success">{success}</div>}

        {/* Bridge Button */}
        <button
          className="bridge-button"
          onClick={handleBridge}
          disabled={isLoading || !account || !selectedToken || !amount || !destinationChain}
        >
          {isLoading ? 'Processing...' : 'Bridge Tokens'}
        </button>

        {/* Bridge History Toggle */}
        <button
          className="history-toggle-button"
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? 'Hide' : 'Show'} Bridge History
        </button>

        {/* Bridge History */}
        {showHistory && (
          <div className="bridge-history">
            <h3>Bridge History</h3>
            {bridgeHistory.length > 0 ? (
              <div className="history-list">
                {bridgeHistory.map((tx, index) => (
                  <div key={index} className="history-item">
                    <div className="history-header">
                      <span className="history-token">
                        {ethers.formatUnits(tx.amount, 18)} {tx.token.substring(0, 6)}...
                      </span>
                      <span className={`history-status ${tx.completed ? 'completed' : 'pending'}`}>
                        {tx.completed ? '✓ Completed' : '⏱ Pending'}
                      </span>
                    </div>
                    <div className="history-details">
                      <p>To: <strong>{tx.destinationChain}</strong></p>
                      <p>Fee: <strong>{ethers.formatUnits(tx.fee, 18)}</strong></p>
                      <p>Date: <strong>{formatDate(tx.timestamp)}</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-history">No bridge transactions yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
