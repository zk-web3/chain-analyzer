"use client";

import useSWR from 'swr';
import { Chain } from '@/types';
import { ChainCard, ChainCardSkeleton } from './ChainCard';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ChainTable() {
  const { data: chains, error } = useSWR<Chain[]>('/api/chains', fetcher, {
    refreshInterval: 60000, // Refresh every 60 seconds
  });

  if (error) return <div className="text-red-500">Failed to load chain data. Please try again later.</div>;
  
  if (!chains) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ChainCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {chains.map((chain) => (
        <ChainCard key={chain.id} chain={chain} />
      ))}
    </div>
  );
} 