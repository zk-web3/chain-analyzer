import { Chain } from '../types';

export const CHAINS: Chain[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    logo: '/logos/ethereum.png',
    explorer_url: 'https://etherscan.io',
    l2s: [
      { id: 'arbitrum-one', name: 'Arbitrum', symbol: 'ARB', logo: '/logos/arbitrum.png', explorer_url: 'https://arbiscan.io' },
      { id: 'optimistic-ethereum', name: 'Optimism', symbol: 'OP', logo: '/logos/optimism.png', explorer_url: 'https://optimistic.etherscan.io' },
      { id: 'zksync', name: 'zkSync', symbol: 'ZK', logo: '/logos/zksync.png', explorer_url: 'https://explorer.zksync.io/' },
      { id: 'base', name: 'Base', symbol: 'BASE', logo: '/logos/base.png', explorer_url: 'https://basescan.org' },
    ]
  },
  { id: 'aptos', name: 'Aptos', symbol: 'APT', logo: '/logos/aptos.png', explorer_url: 'https://explorer.aptoslabs.com' },
  { id: 'sui', name: 'Sui', symbol: 'SUI', logo: '/logos/sui.png', explorer_url: 'https://suiscan.xyz/mainnet' },
  { id: 'sei-network', name: 'Sei', symbol: 'SEI', logo: '/logos/sei.png', explorer_url: 'https://www.seiscan.app' },
]; 