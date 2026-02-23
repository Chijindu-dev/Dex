// src/components/TokenSelector.jsx
import React, { useState, useCallback } from 'react';
import './TokenSelector.css';

// Deployed tokens on Tempo Testnet
const COMMON_TOKENS = [
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

export function TokenSelector({ value, onChange, excludeToken }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
        <div className="token-backdrop" onClick={() => setIsOpen(false)}>
          <div className="token-dropdown" onClick={(e) => e.stopPropagation()}>
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
                    <div className="token-info">
                      <div className="token-header">
                        <span className="token-symbol">{token.symbol}</span>
                      </div>
                      <span className="token-name">{token.name}</span>
                    </div>
                    <span className="token-address">
                      {token.address && typeof token.address === 'string'
                        ? `${token.address.substring(0, 6)}...${token.address.substring(token.address.length - 4)}`
                        : 'Invalid'}
                    </span>
                  </button>
                ))
              ) : (
                <div className="no-tokens">No tokens found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
