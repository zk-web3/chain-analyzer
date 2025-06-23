'use client';
import React from 'react';
import { useChainData } from '../utils/useChainData';

const CHAIN_COLUMNS: Record<string, { key: string; label: string }[]> = {
  eth: [
    { key: 'hash', label: 'Hash' },
    { key: 'from', label: 'From' },
    { key: 'to', label: 'To' },
    { key: 'value', label: 'Value' },
    { key: 'timeStamp', label: 'Time' },
  ],
  arbitrum: [
    { key: 'hash', label: 'Hash' },
    { key: 'from', label: 'From' },
    { key: 'to', label: 'To' },
    { key: 'value', label: 'Value' },
    { key: 'timeStamp', label: 'Time' },
  ],
  optimism: [
    { key: 'hash', label: 'Hash' },
    { key: 'from', label: 'From' },
    { key: 'to', label: 'To' },
    { key: 'value', label: 'Value' },
    { key: 'timeStamp', label: 'Time' },
  ],
  base: [
    { key: 'hash', label: 'Hash' },
    { key: 'from', label: 'From' },
    { key: 'to', label: 'To' },
    { key: 'value', label: 'Value' },
    { key: 'timeStamp', label: 'Time' },
  ],
  linea: [
    { key: 'hash', label: 'Hash' },
    { key: 'from', label: 'From' },
    { key: 'to', label: 'To' },
    { key: 'value', label: 'Value' },
    { key: 'timeStamp', label: 'Time' },
  ],
  aptos: [
    { key: 'version', label: 'Version' },
    { key: 'sender', label: 'Sender' },
    { key: 'gas_used', label: 'Gas Used' },
    { key: 'timestamp', label: 'Timestamp' },
  ],
  sui: [
    { key: 'digest', label: 'Digest' },
  ],
  sei: [
    { key: 'hash', label: 'Hash' },
    { key: 'height', label: 'Height' },
    { key: 'timestamp', label: 'Timestamp' },
  ],
};

export default function LatestTransactions({ chainKey }: { chainKey: string }) {
  const { txs, loading } = useChainData(chainKey);
  const safeTxs = Array.isArray(txs) ? txs : [];
  const columns = CHAIN_COLUMNS[chainKey] || [];
  return (
    <div className="glass-card glow-border p-4 rounded-xl w-full overflow-x-auto">
      <div className="font-bold text-lg mb-2 neon-text">Latest Transactions</div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400">
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length} className="text-center py-4 animate-pulse">Loading...</td></tr>
          ) : safeTxs.length === 0 ? (
            <tr><td colSpan={columns.length} className="text-center py-4">No data</td></tr>
          ) : safeTxs.map((tx: any, idx: number) => (
            <tr key={tx.hash || tx.version || tx.digest || idx} className="hover:bg-gray-900/60 transition-all">
              {columns.map(col => (
                <td key={col.key} className="truncate max-w-[120px]">
                  {tx[col.key] !== undefined ? String(tx[col.key]).slice(0, 16) : 'N/A'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 