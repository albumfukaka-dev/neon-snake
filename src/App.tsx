import React from 'react';
import { SnakeGame } from './components/SnakeGame';
import { Terminal } from 'lucide-react';

export default function App() {
  return (
    <div className="relative w-full min-h-screen bg-[#050505] text-cyan-500 overflow-hidden flex flex-col items-center p-4">
      <div className="absolute inset-0 pointer-events-none crt-overlay mix-blend-overlay"></div>
      <div className="absolute inset-0 pointer-events-none scanline"></div>

      <header className="flex-none p-4 w-full max-w-4xl z-40 flex justify-between items-center border-b border-cyan-900/30 mb-8">
        <div className="flex items-center gap-3">
          <Terminal size={24} className="text-cyan-400 animate-pulse" />
          <h1 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            NEON SERPENT
          </h1>
        </div>
        <div className="text-xs text-cyan-800 hidden sm:block">SYSTEM: ONLINE</div>
      </header>

      <main className="flex-grow z-30 w-full flex justify-center">
        <SnakeGame />
      </main>
    </div>
  );
}