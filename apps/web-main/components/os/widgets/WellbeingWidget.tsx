'use client';

import React from 'react';
import { Activity, Layers } from 'lucide-react';
import { useWellbeingStore } from '@/store/useWellbeingStore';
import { SYSTEM_APPS } from '@/config/apps.config';

// Time formatter specially made compact for the widget
const formatTimeCompact = (totalSeconds: number) => {
  if (!totalSeconds) return '0m';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

export const WellbeingWidget = () => {
  // Store se live real-time data nikal rahe hain
  const { realScreenTime, appUsage } = useWellbeingStore() as any;

  // Sabse zyada use hone wali app find krr rahe hain
  const topApp = Object.entries(appUsage || {})
    .map(([appId, stats]: any) => ({ appId, ...stats }))
    .sort((a, b) => b.activeTime - a.activeTime)[0];

  const AppDef = topApp ? SYSTEM_APPS[topApp.appId] : null;
  const Icon = AppDef?.icon || Layers;

  return (
    <div className="w-full h-full p-4 flex flex-col justify-between bg-gradient-to-br from-[#0d0d12]/80 to-[#1a1a24]/80 backdrop-blur-[40px] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden relative group cursor-pointer hover:border-white/20 transition-all duration-300">
      
      {/* 🔮 Background Neon Glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#52d9ff]/15 rounded-full blur-[35px] group-hover:bg-[#52d9ff]/25 transition-all duration-500" />

      {/* 🚀 HEADER */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          <Activity size={12} className="text-[#52d9ff]" /> Wellbeing
        </div>
        {/* Live Pulse Indicator */}
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
      </div>

      {/* ⏱️ MAIN SOT DATA */}
      <div className="z-10 mt-1">
        <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight drop-shadow-md">
          {formatTimeCompact(realScreenTime)}
        </div>
        <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Today's Screen Time</div>
      </div>

      {/* 📱 TOP APP STRIP (Mini Pill) */}
      <div className="z-10 bg-white/5 rounded-2xl p-2.5 flex items-center justify-between border border-white/5 backdrop-blur-md shadow-inner">
        {topApp ? (
          <>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="p-1.5 bg-black/40 rounded-xl shadow-inner border border-white/5 shrink-0">
                {typeof Icon === 'string' ? (
                  <img src={Icon} alt="app" className="w-3.5 h-3.5 object-contain" />
                ) : (
                  <Icon size={14} className={AppDef?.color || 'text-white'} />
                )}
              </div>
              <div className="text-xs font-bold text-white capitalize truncate w-[65px]">
                {AppDef?.name || topApp.appId}
              </div>
            </div>
            <div className="text-[10px] font-black text-[#52d9ff] shrink-0 drop-shadow-md">
              {formatTimeCompact(topApp.activeTime)}
            </div>
          </>
        ) : (
          <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase w-full text-center py-1">
            No Activity
          </div>
        )}
      </div>
    </div>
  );
};