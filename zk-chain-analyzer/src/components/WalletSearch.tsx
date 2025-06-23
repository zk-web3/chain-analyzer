'use client';

import React, { useState } from 'react';
import useWalletData from '../utils/useWalletData';

type Transaction = {
  hash?: string;
  from?: string;
  to?: string;
  value?: string | number;
  timeStamp?: string;
  version?: string;
  sender?: string;
  gas_used?: string | number;
  timestamp?: string;
  digest?: string;
  height?: string | number;
};

export default function WalletSearch({ chainKey }: { chainKey: string }) {
  const [address, setAddress] = useState('');
  const [query, setQuery] = useState('');
  const { data, isLoading } = useWalletData(chainKey, query);

  return (
    <div className="glass-card glow-border p-4 rounded-xl w-full">
      <div className="font-bold text-lg mb-2 neon-text">Wallet Search</div>
      <form
        onSubmit={e => {
          e.preventDefault();
          setQuery(address);
        }}
        className="flex gap-2 mb-4"
      >
        <input
          className="flex-1 px-3 py-2 rounded-lg bg-gray-900/60 text-white focus:outline-none"
          placeholder="Enter wallet address"
          value={address}
          onChange={e => setAddress(e.target.value)}
        />
        <button type="submit" className="px-4 py-2 rounded-lg neon-text glass-card">Search</button>
      </form>
      {isLoading ? (
        <div className="animate-pulse">Loading...</div>
      ) : data ? (
        <div>
          <div className="mb-2">Balance: <span className="font-mono">{data.balance ?? 'N/A'}</span></div>
          <div className="mb-2">Tx Count: <span className="font-mono">{data.txCount ?? 'N/A'}</span></div>
          <div className="font-bold mt-4 mb-1">Recent Transactions</div>
          <ul className="text-xs">
            {(data.txs || []).length === 0 ? <li>No transactions</li> : data.txs.map((tx: Transaction) => (
              <li key={tx.hash} className="truncate">{tx.hash?.slice(0, 10)}...{tx.hash?.slice(-6)}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
} 