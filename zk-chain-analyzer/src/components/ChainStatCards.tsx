'use client';
import React from 'react';
import { useChainData } from '../utils/useChainData';

const CHAIN_FIELDS: Record<string, { key: string; label: string; tooltip: string }[]> = {
  eth: [
    { key: 'latestBlock', label: 'Latest Block', tooltip: 'Most recent block number.' },
    { key: 'gasPrice', label: 'Gas Price', tooltip: 'Current gas price.' },
    { key: 'tps', label: 'Txs in Latest Block', tooltip: 'Number of transactions in the latest block.' },
  ],
  arbitrum: [
    { key: 'latestBlock', label: 'Latest Block', tooltip: 'Most recent block number.' },
    { key: 'gasPrice', label: 'Gas Price', tooltip: 'Current gas price.' },
    { key: 'tps', label: 'Txs in Latest Block', tooltip: 'Number of transactions in the latest block.' },
  ],
  optimism: [
    { key: 'latestBlock', label: 'Latest Block', tooltip: 'Most recent block number.' },
    { key: 'gasPrice', label: 'Gas Price', tooltip: 'Current gas price.' },
    { key: 'tps', label: 'Txs in Latest Block', tooltip: 'Number of transactions in the latest block.' },
  ],
  base: [
    { key: 'latestBlock', label: 'Latest Block', tooltip: 'Most recent block number.' },
    { key: 'gasPrice', label: 'Gas Price', tooltip: 'Current gas price.' },
    { key: 'tps', label: 'Txs in Latest Block', tooltip: 'Number of transactions in the latest block.' },
  ],
  linea: [
    { key: 'latestBlock', label: 'Latest Block', tooltip: 'Most recent block number.' },
    { key: 'gasPrice', label: 'Gas Price', tooltip: 'Current gas price.' },
    { key: 'tps', label: 'Txs in Latest Block', tooltip: 'Number of transactions in the latest block.' },
  ],
  aptos: [
    { key: 'latestBlock', label: 'Latest Block', tooltip: 'Most recent block version.' },
  ],
  sui: [
    { key: 'latestBlock', label: 'Latest Checkpoint', tooltip: 'Latest checkpoint sequence number.' },
  ],
  sei: [
    { key: 'latestBlock', label: 'Latest Block', tooltip: 'Most recent block height.' },
  ],
};

type Stats = { [key: string]: any };

export default function ChainStatCards({ chainKey }: { chainKey: string }) {
  const { stats, loading } = useChainData(chainKey);
  const safeStats: Stats = stats || {};
  const fields = CHAIN_FIELDS[chainKey] || [];
  return (
    <div className="flex flex-row gap-4 w-full overflow-x-auto">
      {fields.map(field => (
        <div key={field.key} className="glass-card glow-border flex-1 min-w-[180px] p-4 rounded-xl flex flex-col items-center justify-center relative">
          <div className="text-xs text-gray-400 absolute top-2 right-2" title={field.tooltip}>ⓘ</div>
          <div className="text-lg font-semibold mb-1 neon-text">{field.label}</div>
          <div className="text-2xl font-bold">
            {loading ? <span className="animate-pulse">...</span> : (safeStats[field.key] !== undefined ? safeStats[field.key] : 'N/A')}
          </div>
        </div>
      ))}
    </div>
  );
} 