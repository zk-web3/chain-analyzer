import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [chains, setChains] = useState([]);

  useEffect(() => {
    async function fetchChains() {
      try {
        const response = await fetch('/api');
        const data = await response.json();
        setChains(data);
      } catch (error) {
        console.error("Failed to fetch chain data:", error);
      }
    }
    fetchChains();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Chain Analyzer</h1>
      </header>
      <main>
        <div className="chain-container">
          {chains.map((chain) => (
            <div key={chain.symbol} className="chain-card">
              <h2>{chain.name} ({chain.symbol})</h2>
              <p>Price: ${chain.price_usd ? chain.price_usd.toFixed(2) : 'N/A'}</p>
              <p>Market Cap: ${chain.market_cap ? (chain.market_cap / 1e9).toFixed(2) : 'N/A'}B</p>
              <p>24h Change: {chain.price_change_24h ? chain.price_change_24h.toFixed(2) : 'N/A'}%</p>
              <p>Gas Fees: {chain.gas_fees || 'N/A'}</p>
              <a href={chain.explorer_url} target="_blank" rel="noopener noreferrer">Explorer</a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
