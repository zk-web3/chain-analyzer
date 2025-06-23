'use client';
import { useState, createContext, useContext } from 'react';
import ChainSidebar from './ChainSidebar';

const ChainContext = createContext<{ selectedChain: string; setSelectedChain: (c: string) => void }>({ selectedChain: 'eth', setSelectedChain: () => {} });
export function useChain() { return useContext(ChainContext); }

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [selectedChain, setSelectedChain] = useState('eth');
  return (
    <ChainContext.Provider value={{ selectedChain, setSelectedChain }}>
      <div className="flex min-h-screen w-full">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:flex flex-col w-60 min-h-screen bg-gray-900/80 glass-card px-0 py-8 border-r border-gray-800 z-20">
          <div className="font-extrabold text-2xl neon-text mb-8 px-8 tracking-widest">zk Chain Analyzer</div>
          <ChainSidebar selected={selectedChain} onSelect={setSelectedChain} />
        </aside>
        {/* Topbar (mobile) */}
        <div className="md:hidden w-full flex items-center justify-between px-4 py-3 bg-gray-900/90 sticky top-0 z-30 border-b border-gray-800">
          <div className="font-extrabold text-xl neon-text tracking-widest">zk Chain Analyzer</div>
          {/* Optionally: add a mobile menu button here */}
        </div>
        {/* Main content */}
        <main className="flex-1 flex flex-col items-stretch justify-start p-4 md:p-8 bg-transparent">
          <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto py-8">
            {children}
          </div>
        </main>
      </div>
    </ChainContext.Provider>
  );
} 