"use client";

import { useThemeStore } from "@/store/useThemeStore";
import { HardDrive, Database, Server } from "lucide-react";

interface StorageStatsProps {
  isLight: boolean;
  customUsedBytes?: number; // 🎯 Dynamic sync prop added
}

export function StorageStats({ isLight, customUsedBytes }: StorageStatsProps) {
  const { theme } = useThemeStore();
  
  // 🎯 REAL-BACKEND SYNC MAPS
  const maxLimitBytes = 5 * 1024 * 1024 * 1024; // 5GB limit config mapped
  
  // Naya data aayega toh customUsedBytes use hoga, nahi toh default 1.54GB dikhayega
  const usedStorageBytes = customUsedBytes !== undefined ? customUsedBytes : (1.54 * 1024 * 1024 * 1024); 
  
  const usedGB = (usedStorageBytes / (1024 * 1024 * 1024)).toFixed(2);
  const totalGB = (maxLimitBytes / (1024 * 1024 * 1024)).toFixed(0);
  const usagePercentage = ((usedStorageBytes / maxLimitBytes) * 100).toFixed(1);

  return (
    <div className={`p-6 rounded-[2.5rem] border flex flex-col gap-6 transition-all ${
      isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/20 border-white/5 backdrop-blur-2xl'
    }`}>
      {/* Widget Section Title */}
      <div>
        <h3 className={`text-[10px] font-black uppercase tracking-[0.25em] mb-1 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
          Storage Profiler
        </h3>
        <p className="text-xs font-black uppercase tracking-tight flex items-center gap-2">
          <HardDrive className="w-4 h-4" style={{ color: theme?.primary }} />
          Node Allocation
        </p>
      </div>

      {/* 📊 BAR PROGRESS CHART */}
      <div className="space-y-2">
        <div className="flex justify-between font-mono text-[10px] uppercase tracking-wider">
          <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>{usedGB} GB Used</span>
          <span style={{ color: theme?.primary }}>{usagePercentage}%</span>
        </div>
        
        {/* Track Bar Matrix */}
        <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-white/5'}`}>
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${usagePercentage}%`,
              backgroundColor: theme?.primary || '#16a34a' 
            }}
          />
        </div>
        
        <div className="text-[9px] font-mono text-muted-foreground opacity-60">
          Max Ceiling: {totalGB}.00 GB Quota
        </div>
      </div>

      {/* 🎛️ DISTRIBUTED SYSTEM METRICS DIAGRAM INFRA */}
      <div className="space-y-2 pt-2 border-t border-white/5">
        {/* Core Ceph Indicator */}
        <div className={`flex items-center justify-between p-3 rounded-2xl border text-[10px] font-mono ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'
        }`}>
          <div className="flex items-center gap-2">
            <Server className="w-3.5 h-3.5 opacity-60" />
            <span className="font-bold uppercase">Cluster Driver</span>
          </div>
          <span className="text-emerald-500 font-bold tracking-widest uppercase text-[8px] bg-emerald-500/10 px-2 py-0.5 rounded-full">
            Ceph RADOS
          </span>
        </div>

        {/* Redis Cache Sync Status */}
        <div className={`flex items-center justify-between p-3 rounded-2xl border text-[10px] font-mono ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'
        }`}>
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 opacity-60" />
            <span className="font-bold uppercase">Quota Cache</span>
          </div>
          <span className="text-primary font-bold tracking-widest uppercase text-[8px] px-2 py-0.5 rounded-full" style={{ color: theme?.primary, backgroundColor: `${theme?.primary}1a` }}>
            REDIS SYNC
          </span>
        </div>
      </div>
    </div>
  );
}