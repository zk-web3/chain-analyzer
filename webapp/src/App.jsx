import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [chains, setChains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchChains() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api');
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setChains(data);
      } catch (e) {
        console.error("Failed to fetch chain data:", e);
        setError("Failed to load data. If running locally, please use the 'vercel dev' command, not 'npm run dev'.");
      } finally {
        setLoading(false);
      }
    }
    fetchChains();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <p>Loading chain data...</p>;
    }
    if (error) {
      return <p className="error">{error}</p>;
    }
    if (chains.length === 0) {
      return <p>No chain data available.</p>;
    }
    return (
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
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Chain Analyzer</h1>
      </header>
      <main>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
