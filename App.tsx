
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SnakeGame } from './components/SnakeGame';
import { Terminal } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="relative w-full h-screen bg-[#050505] text-cyan-500 overflow-hidden flex flex-col">
      {/* CRT Effects */}
      <div className="absolute inset-0 z-50 pointer-events-none crt-overlay mix-blend-overlay"></div>
      <div className="absolute inset-0 z-50 pointer-events-none scanline"></div>

      {/* Header */}
      <header className="flex-none p-4 border-b border-cyan-900/50 bg-[#0a0a0a] z-40 flex justify-between items-center shadow-[0_0_15px_rgba(0,255,255,0.1)]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-900/20 border border-cyan-500 rounded">
            <Terminal size={24} className="text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]">
              NEON SERPENT
            </h1>
            <p className="text-xs text-cyan-700 tracking-[0.2em] uppercase">系统状态: 在线 // 协议: 贪吃蛇</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow relative z-30 flex items-center justify-center p-2 sm:p-6">
        <SnakeGame />
      </main>
      
      {/* Footer Decoration */}
      <footer className="flex-none p-2 text-center text-xs text-cyan-900 z-40">
        <span className="animate-pulse">_正在连接到主机框架...</span>
      </footer>
    </div>
  );
};

export default App;
