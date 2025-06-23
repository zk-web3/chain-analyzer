'use client';
import ChainStatCards from '@/components/ChainStatCards';
import LatestTransactions from '@/components/LatestTransactions';
import ChainChart from '@/components/ChainChart';
import WalletSearch from '@/components/WalletSearch';
import { useChain } from '@/components/ClientLayout';

export default function Home() {
  const { selectedChain } = useChain();
  return (
    <div className="w-full flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-4xl font-extrabold neon-text tracking-tight mb-2">zk Chain Analyzer</h1>
          <div className="text-lg text-gray-400 font-semibold">Live L1 & L2 Analytics Dashboard</div>
        </div>
      </div>
      {/* Stat Cards */}
      <div className="w-full">
        <ChainStatCards chainKey={selectedChain} />
      </div>
      {/* Chart */}
      <div className="w-full">
        <ChainChart chainKey={selectedChain} />
      </div>
      {/* Latest Transactions */}
      <div className="w-full">
        <LatestTransactions chainKey={selectedChain} />
      </div>
      {/* Wallet Search */}
      <div className="w-full">
        <WalletSearch chainKey={selectedChain} />
      </div>
    </div>
  );
}


