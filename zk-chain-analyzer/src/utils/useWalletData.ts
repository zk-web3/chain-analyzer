'use client';
import useSWR from 'swr';
import axios from 'axios';

export default function useWalletData(chainKey: string, address: string) {
  return useSWR(
    address ? [chainKey, address] : null,
    async ([chain, addr]) => {
      // Example: ETH & L2s via Etherscan
      if (['eth', 'arbitrum', 'optimism', 'base', 'linea'].includes(chain)) {
        const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_KEY;
        if (!apiKey) throw new Error('No Etherscan key');
        const url = `https://api.etherscan.io/api?module=account&action=balance&address=${addr}&apikey=${apiKey}`;
        const txUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${addr}&sort=desc&apikey=${apiKey}`;
        const [balRes, txRes] = await Promise.all([
          axios.get(url),
          axios.get(txUrl),
        ]);
        return {
          balance: balRes.data?.result,
          txCount: txRes.data?.result?.length,
          txs: (txRes.data?.result || []).slice(0, 5),
        };
      }
      // TODO: Add Aptos, Sui, Sei wallet fetch logic
      return { balance: 'N/A', txCount: 'N/A', txs: [] };
    },
    { revalidateOnFocus: false, refreshInterval: 5000 }
  );
} 