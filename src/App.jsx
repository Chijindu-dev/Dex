import React, { useState, useEffect } from 'react';
import { Web3Provider } from './context/Web3Context';
import { WalletButton } from './components/WalletButton';
import { SwapCard } from './components/SwapCard';
import { LiquidityCard } from './components/LiquidityCard';
import { BridgeCard } from './components/BridgeCard';
import './App.css';

// Contract addresses - Update these after deploying your contracts
const ROUTER_ADDRESS = import.meta.env.VITE_ROUTER_ADDRESS || '0x0000000000000000000000000000000000000000';
const FACTORY_ADDRESS = import.meta.env.VITE_FACTORY_ADDRESS || '0x0000000000000000000000000000000000000000';

function AppContent() {
  const [activeTab, setActiveTab] = useState('swap');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-logo">Swap.fi</h1>
        </div>
        
        <nav className="app-nav">
          <button
            className={`nav-link ${activeTab === 'swap' ? 'active' : ''}`}
            onClick={() => setActiveTab('swap')}
          >
            Swap
          </button>
          <button
            className={`nav-link ${activeTab === 'bridge' ? 'active' : ''}`}
            onClick={() => setActiveTab('bridge')}
          >
            Bridge
          </button>
          <button
            className={`nav-link ${activeTab === 'invest' ? 'active' : ''}`}
            onClick={() => setActiveTab('invest')}
          >
            Invest
          </button>
          <button
            className={`nav-link ${activeTab === 'send' ? 'active' : ''}`}
            onClick={() => setActiveTab('send')}
          >
            Send
          </button>
        </nav>

        <div className="header-right">
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <WalletButton />
        </div>
      </header>

      <main className="app-main">
        {activeTab === 'swap' && (
          <SwapCard routerAddress={ROUTER_ADDRESS} factoryAddress={FACTORY_ADDRESS} />
        )}
        {activeTab === 'bridge' && (
          <BridgeCard />
        )}
        {activeTab === 'invest' && (
          <LiquidityCard routerAddress={ROUTER_ADDRESS} />
        )}
        {activeTab === 'send' && (
          <div className="feature-placeholder">
            <h2>Send</h2>
            <p>Send tokens directly coming soon...</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Web3Provider>
      <AppContent />
    </Web3Provider>
  );
}
