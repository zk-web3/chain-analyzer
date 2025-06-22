import Image from 'next/image';
import { Chain } from '@/types';
import { ChevronDown, ArrowUpRight, Droplets, Zap, Gauge } from 'lucide-react';

const Stat = ({ icon, label, value, unit }: { icon: React.ReactNode, label: string, value?: string | number | null, unit?: string }) => (
  <div className="flex items-center justify-between text-sm">
    <div className="flex items-center text-gray-500 dark:text-gray-400">
      {icon}
      <span className="ml-2">{label}</span>
    </div>
    <span className="font-medium text-gray-900 dark:text-white">{value ?? 'N/A'} {unit}</span>
  </div>
);

export const ChainCard = ({ chain }: { chain: Chain }) => {
  const priceChangeColor = (chain.price_change_24h ?? 0) >= 0 ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Image src={chain.logo} alt={chain.name} width={40} height={40} className="rounded-full" />
          <div className="ml-4">
            <h2 className="text-xl font-bold">{chain.name}</h2>
            <p className="text-gray-500 dark:text-gray-400">{chain.symbol}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold">${chain.price?.toLocaleString()}</p>
          <p className={`text-sm font-medium ${priceChangeColor}`}>{chain.price_change_24h?.toFixed(2)}%</p>
        </div>
      </div>

      <div className="space-y-3">
        <Stat icon={<Gauge size={16} />} label="Market Cap" value={`$${(chain.market_cap / 1_000_000_000).toFixed(2)}`} unit="B" />
        <Stat icon={<Zap size={16} />} label="TVL" value={chain.tvl ? `$${(chain.tvl / 1_000_000_000).toFixed(2)}` : 'N/A'} unit="B" />
        <Stat icon={<Droplets size={16} />} label="Gas (Safe)" value={chain.gas_fees} />
        <a href={chain.explorer_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center text-blue-500 pt-2">
          Explorer <ArrowUpRight size={16} className="ml-1" />
        </a>
      </div>
      
      {/* L2 Section can be added here */}
    </div>
  );
};

export const ChainCardSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700"></div>
          <div className="ml-4 space-y-2">
            <div className="h-6 w-24 rounded bg-gray-300 dark:bg-gray-700"></div>
            <div className="h-4 w-12 rounded bg-gray-300 dark:bg-gray-700"></div>
          </div>
        </div>
        <div className="space-y-2 text-right">
            <div className="h-6 w-20 rounded bg-gray-300 dark:bg-gray-700"></div>
            <div className="h-4 w-12 rounded bg-gray-300 dark:bg-gray-700"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-5 rounded bg-gray-300 dark:bg-gray-700"></div>
        <div className="h-5 rounded bg-gray-300 dark:bg-gray-700"></div>
        <div className="h-5 rounded bg-gray-300 dark:bg-gray-700"></div>
        <div className="h-5 w-24 mx-auto mt-2 rounded bg-gray-300 dark:bg-gray-700"></div>
      </div>
    </div>
  ); 