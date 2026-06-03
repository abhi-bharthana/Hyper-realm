'use client';

import React from 'react';
import { useWellbeingStore } from '@/store/useWellbeingStore';
import { Activity, Clock, Wifi, RotateCcw, ShieldCheck } from 'lucide-react';

// Format seconds into HHh MMm SSs
const formatTime = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

// Map App IDs to readable names and colors
const APP_META: Record<string, { name: string, color: string }> = {
  explorer: { name: 'File Explorer', color: 'bg-blue-500' },
  calculator: { name: 'Calculator', color: 'bg-lime-500' },
  settings: { name: 'Settings', color: 'bg-zinc-400' },
  terminal: { name: 'Terminal', color: 'bg-green-500' },
  canvas: { name: 'Neural Canvas', color: 'bg-purple-500' },
  taskmanager: { name: 'Task Manager', color: 'bg-red-500' },
  default: { name: 'System Process', color: 'bg-white/50' }
};

export const DigitalWellbeingApp = () => {
  const { totalOnlineTime, appUsage, resetData } = useWellbeingStore();

  // Convert app usage object to sorted array
  const sortedApps = Object.entries(appUsage)
    .map(([appId, time]) => ({ appId, time }))
    .sort((a, b) => b.time - a.time);

  return (
    <div className="w-full h-full flex flex-col bg-black/40 backdrop-blur-3xl overflow-hidden text-white font-sans rounded-b-2xl">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-cyan-400" />
          <h2 className="text-lg font-bold tracking-wider">Digital Wellbeing</h2>
        </div>
        <button onClick={resetData} className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-full hover:bg-white/10">
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        
        {/* TOTAL TIME WIDGET */}
        <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 rounded-3xl border border-cyan-500/20 shadow-[0_0_30px_rgba(34,211,238,0.05)] mb-8 relative overflow-hidden">
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
            <Wifi className="w-3 h-3" /> Online Time
          </div>
          
          <div className="w-40 h-40 rounded-full border-4 border-white/5 flex flex-col items-center justify-center relative">
             {/* Neon Glow Ring */}
             <div className="absolute inset-[-4px] rounded-full border-4 border-cyan-400 border-t-transparent animate-spin-slow opacity-50" />
             <Clock className="w-6 h-6 text-cyan-400 mb-2 opacity-80" />
             <span className="text-3xl font-light tracking-tight">{formatTime(totalOnlineTime)}</span>
             <span className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Screen On</span>
          </div>
          <p className="text-xs text-white/50 mt-6 text-center max-w-xs">
            This timer only runs when your device is connected to the internet and actively tracking OS applications.
          </p>
        </div>

        {/* APP BREAKDOWN */}
        <div>
          <h3 className="text-sm font-semibold tracking-widest uppercase text-white/60 mb-4 flex items-center gap-2">
             <ShieldCheck className="w-4 h-4" /> App Activity Breakdown
          </h3>
          
          {sortedApps.length === 0 ? (
            <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/5 text-white/40 text-sm">
              No app usage recorded yet.
            </div>
          ) : (
            <div className="space-y-4 bg-black/20 p-5 rounded-3xl border border-white/5">
              {sortedApps.map(({ appId, time }) => {
                const meta = APP_META[appId] || APP_META.default;
                const percentage = totalOnlineTime > 0 ? (time / totalOnlineTime) * 100 : 0;
                
                return (
                  <div key={appId} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-medium text-white/90 capitalize">{meta.name}</span>
                      <span className="text-xs font-mono text-white/50">{formatTime(time)} ({percentage.toFixed(1)}%)</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${meta.color} transition-all duration-1000 ease-out`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};