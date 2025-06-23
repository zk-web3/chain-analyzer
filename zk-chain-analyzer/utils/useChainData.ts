'use client';
import useSWR from 'swr';
import { getChainStats, getLatestTransactions } from './chainApi';

const fetchStats = async (chain: string) => await getChainStats(chain);
const fetchTxs = async (chain: string) => await getLatestTransactions(chain);

export function useChainData(chain: string) {
  const { data: stats, isLoading: statsLoading, error: statsError } = useSWR(['stats', chain], () => fetchStats(chain), {
    refreshInterval: 10000,
    onError: (err) => { console.error('Stats fetch error:', err); }
  });
  const { data: txs, isLoading: txsLoading, error: txsError } = useSWR(['txs', chain], () => fetchTxs(chain), {
    refreshInterval: 10000,
    onError: (err) => { console.error('Txs fetch error:', err); }
  });
  return {
    stats,
    txs,
    loading: statsLoading || txsLoading,
    error: statsError || txsError,
  };
} 