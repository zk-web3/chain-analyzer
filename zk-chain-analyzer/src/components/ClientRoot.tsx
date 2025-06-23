'use client';
import ChainSidebar from './ChainSidebar';
import { useState } from 'react';

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState('eth');
  return (
    <div className="relative z-10 flex w-full min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 min-h-screen hidden md:flex flex-col items-center pt-8 glass-card glow-border sticky top-0 left-0 z-20">
        <div className="font-extrabold text-2xl neon-text mb-8 tracking-widest">zk Chain Analyzer</div>
        <ChainSidebar selected={selected} onSelect={setSelected} />
      </aside>
      {/* Main Panel */}
      <main className="flex-1 flex flex-col items-stretch justify-start p-0 md:p-8">
        <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto py-8">
          {children}
        </div>
      </main>
    </div>
  );
} 