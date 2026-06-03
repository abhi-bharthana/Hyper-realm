import React from 'react';
import { Activity, Clock, Wifi, ShieldCheck } from 'lucide-react';
import { useWellbeingStore } from '@/store/useWellbeingStore';

const formatTime = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

const APP_META: Record<string, { name: string, color: string }> = {
  explorer: { name: 'File Explorer', color: 'bg-blue-500' },
  calculator: { name: 'Calculator', color: 'bg-lime-500' },
  settings: { name: 'Settings', color: 'bg-zinc-400' },
  terminal: { name: 'Terminal', color: 'bg-green-500' },
  canvas: { name: 'Neural Canvas', color: 'bg-purple-500' },
  taskmanager: { name: 'Task Manager', color: 'bg-red-500' },
  default: { name: 'System Process', color: 'bg-white/50' }
};

export default function WellbeingModule() {
  const { totalOnlineTime, appUsage } = useWellbeingStore();

  return (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-black flex items-center gap-3 tracking-tight">
          <Activity className="text-[#06b6d4]" size={28} /> Digital Wellbeing
        </h2>
        
        {/* 🚀 TAMPER-PROOF BADGE */}
        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-[#27c93f] bg-[#27c93f]/10 px-3 py-1.5 rounded-full border border-[#27c93f]/20 shadow-sm cursor-default">
          <ShieldCheck className="w-3 h-3" /> Secure Vault
        </div>
      </div>
      
      <p className="text-white/40 text-sm mb-8 font-medium">
        Monitor your internet-connected screen time securely. <span className="text-[#ffbd2e]">Data is permanent and synced to the cloud for weekly analytics.</span>
      </p>
      
      {/* TOTAL TIME WIDGET */}
      <div className="flex flex-col items-center justify-center py-10 px-6 bg-gradient-to-br from-[#06b6d4]/10 to-transparent rounded-[2rem] border border-[#06b6d4]/20 shadow-[0_0_40px_rgba(6,182,212,0.05)] mb-8 relative overflow-hidden group">
        <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-[#27c93f]/20 text-[#27c93f] px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm">
          <Wifi className="w-3 h-3" /> Online Time
        </div>
        
        <div className="w-48 h-48 rounded-full border border-white/5 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center relative shadow-inner group-hover:border-[#06b6d4]/30 transition-colors duration-500">
          <div className="absolute inset-[-2px] rounded-full border-2 border-[#06b6d4] border-t-transparent animate-spin-slow opacity-30" />
          <Clock className="w-7 h-7 text-[#06b6d4] mb-3 opacity-80" />
          <span className="text-4xl font-light tracking-tight text-white">{formatTime(totalOnlineTime)}</span>
          <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-2">Active Tracker</span>
        </div>
      </div>

      {/* APP BREAKDOWN LIST */}
      <div>
        <h3 className="text-xs font-bold tracking-widest uppercase text-white/50 mb-5 flex items-center gap-2 pl-2">
          <ShieldCheck className="w-4 h-4" /> Usage Breakdown
        </h3>
        
        {Object.keys(appUsage).length === 0 ? (
          <div className="text-center py-10 bg-black/20 rounded-[2rem] border border-white/5 text-white/40 text-sm font-medium">
            No internet-connected usage recorded yet.
          </div>
        ) : (
          <div className="space-y-4 bg-black/20 p-6 rounded-[2rem] border border-white/5 shadow-inner">
            {Object.entries(appUsage)
              .sort((a, b) => b[1] - a[1])
              .map(([appId, time]) => {
                const meta = APP_META[appId] || APP_META.default;
                const percentage = totalOnlineTime > 0 ? (time / totalOnlineTime) * 100 : 0;
                
                return (
                  <div key={appId} className="flex flex-col gap-2">
                    <div className="flex justify-between items-end px-1">
                      <span className="text-sm font-bold text-white/80 capitalize">{meta.name}</span>
                      <span className="text-xs font-mono text-white/50">{formatTime(time)} <span className="text-[10px] ml-1">({percentage.toFixed(1)}%)</span></span>
                    </div>
                    <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <div 
                        className={`h-full ${meta.color} transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-full`} 
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
  );
}