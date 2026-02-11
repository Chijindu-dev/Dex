// src/components/WalletButton.jsx
import React, { useContext } from 'react';
import { Web3Context } from '../context/Web3Context';
import './WalletButton.css';

export function WalletButton() {
  const { account, balance, isConnecting, connectWallet, disconnect } = useContext(Web3Context);

  if (account) {
    return (
      <div className="wallet-button connected">
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Connected</div>
          <div className="wallet-address">
            {account.substring(0, 6)}...{account.substring(account.length - 4)}
          </div>
        </div>
        <button 
          className="disconnect-btn" 
          onClick={disconnect}
          style={{ 
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      className="wallet-button"
      onClick={connectWallet}
      disabled={isConnecting}
      style={{ cursor: isConnecting ? 'wait' : 'pointer' }}
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
