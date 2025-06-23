'use client';

import React from 'react';
import Image from 'next/image';

const CHAINS = [
  { key: 'eth', name: 'Ethereum', logo: '/globe.svg', l2s: [
    { key: 'arbitrum', name: 'Arbitrum', logo: '/file.svg' },
    { key: 'optimism', name: 'Optimism', logo: '/window.svg' },
    { key: 'base', name: 'Base', logo: '/vercel.svg' },
    { key: 'linea', name: 'Linea', logo: '/next.svg' },
  ] },
  { key: 'aptos', name: 'Aptos', logo: '/globe.svg' },
  { key: 'sui', name: 'Sui', logo: '/globe.svg' },
  { key: 'sei', name: 'Sei', logo: '/globe.svg' },
];

export default function ChainSidebar({ selected, onSelect }: { selected: string, onSelect: (key: string) => void }) {
  const [showL2s, setShowL2s] = React.useState(true);
  return (
    <nav className="w-full flex flex-col gap-2">
      {CHAINS.map(chain => (
        <div key={chain.key}>
          <button
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg glass-card transition-all ${selected === chain.key ? 'neon-text glow-border border-2 border-cyan-400' : 'hover:bg-gray-900/60'}`}
            onClick={() => onSelect(chain.key)}
          >
            <Image src={chain.logo} alt={chain.name} width={24} height={24} className="w-6 h-6" />
            <span className="flex-1 text-left">{chain.name}</span>
            {chain.l2s && (
              <span
                className="ml-auto cursor-pointer text-xs text-cyan-400"
                onClick={e => { e.stopPropagation(); setShowL2s(v => !v); }}
              >
                {showL2s ? '▼' : '▶'}
              </span>
            )}
          </button>
          {chain.l2s && showL2s && (
            <div className="ml-8 flex flex-col gap-1">
              {chain.l2s.map(l2 => (
                <button
                  key={l2.key}
                  className={`flex items-center gap-2 px-3 py-1 rounded-md glass-card text-sm ${selected === l2.key ? 'neon-text glow-border border border-cyan-400' : 'hover:bg-gray-900/60'}`}
                  onClick={() => onSelect(l2.key)}
                >
                  <Image src={l2.logo} alt={l2.name} width={20} height={20} className="w-5 h-5" />
                  {l2.name}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
} 