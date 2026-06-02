'use client';

import React, { useEffect, useState } from 'react';
import { Activity, XCircle, Cpu, HardDrive } from 'lucide-react';
import { useOSStore } from '@/store/useOSStore';

export const TaskManager = () => {
  const { windows, closeWindow } = useOSStore();
  const [ramUsage, setRamUsage] = useState(0);
  const [cpuUsage, setCpuUsage] = useState(12);

  useEffect(() => {
    const baseRam = 12; 
    const appRam = windows.length * 8; 
    setRamUsage(Math.min(baseRam + appRam, 99)); 
    
    const cpuInterval = setInterval(() => {
      setCpuUsage(Math.floor(Math.random() * 12) + 5 + (windows.length * 2));
    }, 2000);
    
    return () => clearInterval(cpuInterval);
  }, [windows]);

  return (
    <div className="flex flex-col h-full w-full text-white overflow-hidden bg-transparent">
      
      {/* 📊 Premium Top Stats Bar */}
      <div className="flex gap-6 p-8 border-b border-white/5 bg-black/20">
        <div className="flex-1 bg-black/40 p-5 rounded-[24px] border border-white/5 flex items-center gap-5 shadow-lg relative overflow-hidden group hover:bg-black/60 transition-colors">
          <div className="absolute inset-0 bg-[#52d9ff]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 rounded-2xl bg-[#52d9ff]/10 border border-[#52d9ff]/20">
            <Activity className="text-[#52d9ff]" size={28} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">CPU Usage</div>
            <div className="font-mono text-3xl font-black text-white/90">{cpuUsage}%</div>
          </div>
        </div>
        
        <div className="flex-1 bg-black/40 p-5 rounded-[24px] border border-white/5 flex items-center gap-5 shadow-lg relative overflow-hidden group hover:bg-black/60 transition-colors">
          <div className="absolute inset-0 bg-[#ff5f56]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 rounded-2xl bg-[#ff5f56]/10 border border-[#ff5f56]/20">
            <HardDrive className="text-[#ff5f56]" size={28} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Memory (RAM)</div>
            <div className="font-mono text-3xl font-black text-white/90">{ramUsage}%</div>
          </div>
        </div>
      </div>

      {/* 🪟 Process List (Optimized Flexbox for perfect rounding) */}
      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-white/[0.02] to-transparent flex flex-col gap-3">
        
        {/* Table Header (Flex row) */}
        <div className="flex w-full px-6 pb-2 text-white/40 border-b border-white/5">
          <div className="flex-1 font-black text-[10px] uppercase tracking-widest">Process Name</div>
          <div className="w-40 font-black text-[10px] uppercase tracking-widest">Status</div>
          <div className="w-24 font-black text-[10px] uppercase tracking-widest text-right">Action</div>
        </div>
        
        {/* System Process */}
        <div className="flex items-center w-full px-5 py-3 rounded-[20px] bg-black/40 hover:bg-black/60 border border-white/5 transition-all group shadow-sm">
          <div className="flex-1 flex items-center gap-4 text-white/70 font-medium">
            <div className="p-2 rounded-xl bg-[#8d6bff]/10 border border-[#8d6bff]/20">
              <Cpu size={16} className="text-[#8d6bff]" />
            </div>
            Hyper Kernel
          </div>
          <div className="w-40 flex items-center">
            <span className="px-3 py-1.5 rounded-full bg-[#27c93f]/10 text-[#27c93f] text-[10px] font-bold uppercase tracking-wider border border-[#27c93f]/20 shadow-[0_0_10px_rgba(39,201,63,0.1)]">
              System
            </span>
          </div>
          <div className="w-24 flex items-center justify-end">
            <span className="text-[10px] text-white/20 font-mono tracking-widest uppercase">Protected</span>
          </div>
        </div>
        
        {/* User Apps */}
        {windows.map((app) => (
          <div key={app.id} className="flex items-center w-full px-5 py-3 rounded-[20px] bg-black/40 hover:bg-black/60 border border-white/5 transition-all group shadow-sm">
            <div className="flex-1 flex items-center gap-4 font-bold text-white/90">
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <Activity size={16} className="text-white/60" />
              </div>
              {app.title} 
              <span className="text-white/30 text-[9px] uppercase font-bold tracking-widest ml-2 bg-black/40 px-2 py-1 rounded-md border border-white/5">
                {app.appId}
              </span>
            </div>
            <div className="w-40 flex items-center">
              {app.isMinimized ? (
                <span className="px-3 py-1.5 rounded-full bg-[#ffbd2e]/10 text-[#ffbd2e] text-[10px] font-bold uppercase tracking-wider border border-[#ffbd2e]/20">
                  Suspended
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-full bg-[#52d9ff]/10 text-[#52d9ff] text-[10px] font-bold uppercase tracking-wider border border-[#52d9ff]/20 shadow-[0_0_10px_rgba(82,217,255,0.1)]">
                  Running
                </span>
              )}
            </div>
            <div className="w-24 flex items-center justify-end">
              <button 
                onClick={() => closeWindow(app.id)}
                className="opacity-0 group-hover:opacity-100 px-4 py-2 rounded-xl bg-[#ff5f56]/10 hover:bg-[#ff5f56]/20 text-[#ff5f56] transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-transparent hover:border-[#ff5f56]/30 hover:shadow-[0_0_15px_rgba(255,95,86,0.2)]"
              >
                <XCircle size={14} /> Kill
              </button>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};