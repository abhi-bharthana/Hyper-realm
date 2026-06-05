import React, { useEffect, useState } from 'react';
import { useVFSStore } from '@/store/useVFSStore'; // 🚀 NAYA: VFS Store import for OS data

// 🚀 THE WIDGET SDK BLUEPRINT
export interface WidgetDefinition {
  id: string;
  name: string;
  description: string;
  defaultSize: { w: number; h: number }; // Grid span (e.g., 2x2)
  permissions: string[];
  render: (api: any) => React.ReactNode;
}

export const defineWidget = (config: WidgetDefinition) => config;

// ==========================================
// 🛠️ SYSTEM WIDGETS REGISTRY
// ==========================================

export const SYSTEM_WIDGETS: Record<string, WidgetDefinition> = {
  
  // 1. NEON CLOCK (System Time)
  'com.system.clock': defineWidget({
    id: 'com.system.clock',
    name: 'Neon Clock',
    description: 'A futuristic glassmorphic time display.',
    defaultSize: { w: 2, h: 2 },
    permissions: [],
    render: () => {
      const [time, setTime] = useState(new Date());
      useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
      }, []);
      
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-3xl backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden relative">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#52d9ff]/20 rounded-full blur-[30px]" />
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-[#52d9ff] drop-shadow-md tracking-tighter">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </h1>
          <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-1">
            {time.toLocaleDateString()}
          </p>
        </div>
      );
    }
  }),

  // 2. 🚀 HYPER DRIVE MONITOR (Internal OS Data Fetch)
  'com.system.storage': defineWidget({
    id: 'com.system.storage',
    name: 'Storage Monitor',
    description: 'Live VFS node statistics from Hyper Drive.',
    defaultSize: { w: 2, h: 2 },
    permissions: ['vfs_read'],
    render: () => {
      // Direct OS Context se VFS Nodes padh rahe hain
      const { nodes } = useVFSStore();
      
      const fileCount = Object.values(nodes).filter(n => n?.type?.toLowerCase() === 'file').length;
      const folderCount = Object.values(nodes).filter(n => n?.type?.toLowerCase() === 'folder').length;
      const totalNodes = fileCount + folderCount;

      return (
        <div className="w-full h-full p-5 bg-[#050508]/80 border border-white/10 rounded-3xl backdrop-blur-2xl shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#8d6bff]/20 rounded-full blur-[40px] group-hover:bg-[#8d6bff]/40 transition-all duration-500" />
          
          <div className="flex justify-between items-center z-10">
            <h3 className="text-white font-bold text-[10px] tracking-widest uppercase">Hyper Drive</h3>
            <div className="w-2 h-2 rounded-full bg-[#8d6bff] shadow-[0_0_10px_#8d6bff] animate-pulse" />
          </div>
          
          <div className="z-10 mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-[#8d6bff]">
                {totalNodes}
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Nodes</span>
            </div>
          </div>

          <div className="flex gap-3 text-[10px] font-mono font-bold z-10 bg-black/40 p-2 rounded-xl border border-white/5">
             <div className="flex-1 text-center text-gray-400"><span className="text-[#52d9ff] text-sm block">{fileCount}</span> FILES</div>
             <div className="w-px bg-white/10"></div>
             <div className="flex-1 text-center text-gray-400"><span className="text-[#8d6bff] text-sm block">{folderCount}</span> DIRS</div>
          </div>
        </div>
      );
    }
  }),

  // 3. 🌐 LIVE CRYPTO TRACKER (External Network Data Fetch)
  'com.network.crypto': defineWidget({
    id: 'com.network.crypto',
    name: 'BTC Live',
    description: 'Real-time Bitcoin price from the web.',
    defaultSize: { w: 2, h: 2 },
    permissions: ['internet'],
    render: () => {
      const [btc, setBtc] = useState<string>('Loading...');
      
      useEffect(() => {
        const fetchBTC = async () => {
          try {
            const res = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
            const data = await res.json();
            // Price ko format kar rahe hain taaki neat dikhe
            setBtc('$' + data.bpi.USD.rate.split('.')[0]); 
          } catch {
            setBtc('Error');
          }
        };
        
        fetchBTC();
        // Har 30 second mein API hit marke data fresh karega
        const interval = setInterval(fetchBTC, 30000); 
        return () => clearInterval(interval);
      }, []);

      return (
        <div className="w-full h-full p-5 bg-gradient-to-br from-[#f7931a]/10 to-black/60 border border-[#f7931a]/20 rounded-3xl backdrop-blur-2xl shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#f7931a] to-[#d67b0f] flex items-center justify-center font-bold text-white shadow-[0_5px_15px_rgba(247,147,26,0.4)] text-lg">
              ₿
            </div>
            <span className="text-[9px] text-[#f7931a] font-black uppercase tracking-[0.2em] animate-pulse bg-[#f7931a]/10 px-2 py-1 rounded-md">Live API</span>
          </div>
          
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Bitcoin (USD)</p>
            <h2 className="text-3xl font-black text-white drop-shadow-md tracking-tight">{btc}</h2>
          </div>
        </div>
      );
    }
  })
};