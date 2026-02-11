// src/components/TokenSelector.jsx
import React, { useState, useCallback } from 'react';
import './TokenSelector.css';

// These are example token addresses. Replace with addresses from your deployed network.
// For Sepolia testnet, you need to deploy ERC20 tokens first or use existing test tokens.
const COMMON_TOKENS = [
  { symbol: 'TOKEN1', address: '0x0000000000000000000000000000000000000001', decimals: 18 },
  { symbol: 'TOKEN2', address: '0x0000000000000000000000000000000000000002', decimals: 18 },
  { symbol: 'TOKEN3', address: '0x0000000000000000000000000000000000000003', decimals: 6 },
  { symbol: 'TOKEN4', address: '0x0000000000000000000000000000000000000004', decimals: 6 },
];

export function TokenSelector({ value, onChange, excludeToken }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customAddress, setCustomAddress] = useState('');


  const filteredTokens = COMMON_TOKENS.filter(
    token =>
      token.address !== excludeToken &&
      (token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelect = useCallback((token) => {
    onChange(token);
    setIsOpen(false);
    setSearchTerm('');
  }, [onChange]);

  return (
    <div className="token-selector">
      <button
        className="token-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value?.symbol || 'Select Token'}
        <span className="chevron">▼</span>
      </button>

      {isOpen && (
        <div className="token-dropdown">
          <input
            type="text"
            placeholder="Search by symbol or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="token-search"
            autoFocus
          />
          <div className="token-list">
            {filteredTokens.length > 0 ? (
              filteredTokens.map((token) => (
                <button
                  key={token.address}
                  className="token-item"
                  onClick={() => handleSelect(token)}
                >
                  <span className="token-symbol">{token.symbol}</span>
                  <span className="token-address">
                    {token.address.substring(0, 6)}...{token.address.substring(token.address.length - 4)}
                  </span>
                </button>
              ))
            ) : (
              <div className="no-tokens">No tokens found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
