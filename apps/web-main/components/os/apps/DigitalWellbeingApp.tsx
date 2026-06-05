'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWellbeingStore } from '@/store/useWellbeingStore';
import { Activity, Clock, Wifi, Zap, Layers, RefreshCw } from 'lucide-react';
import { SYSTEM_APPS } from '@/config/apps.config'; 

// Format seconds into HHh MMm SSs
const formatTime = (totalSeconds: number) => {
  if (!totalSeconds) return '0s';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

export const DigitalWellbeingApp = () => {
  const { realScreenTime, appUsage, appCombos } = useWellbeingStore();

  // 1. Sort Apps strictly by their ACTIVE Time
  const sortedApps = Object.entries(appUsage || {})
    .map(([appId, stats]) => ({ appId, ...stats }))
    .sort((a, b) => b.activeTime - a.activeTime);

  // 2. Resolve Top Combo
  const topCombo = Object.entries(appCombos || {})
    .sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="w-full h-full flex flex-col bg-black/40 backdrop-blur-3xl overflow-hidden text-white font-sans rounded-b-[2.5rem] shadow-2xl">
      
      {/* ==========================================
          🚀 APP HEADER (Pill style inner elements)
          ========================================== */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-black/40 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-[#52d9ff]/10 rounded-full">
            <Activity className="w-5 h-5 text-[#52d9ff]" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-widest uppercase">Digital Wellbeing</h2>
            <p className="text-[10px] text-gray-400 pl-0.5">V2 Telemetry Engine</p>
          </div>
        </div>
        
        {/* Sync Button (Already Pill) */}
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[#52d9ff]/80 bg-[#52d9ff]/10 px-4 py-2 rounded-full border border-[#52d9ff]/20">
          <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" /> Synced
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
        
        {/* Background glow effects */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#52d9ff]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#8d6bff]/5 rounded-full blur-[100px] pointer-events-none" />

        {/* ==========================================
            ⏱️ TOTAL TIME WIDGET (Super Pill)
            ========================================== */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center p-10 bg-gradient-to-br from-[#52d9ff]/10 to-[#8d6bff]/5 rounded-[3rem] border border-[#52d9ff]/20 shadow-[0_0_30px_rgba(82,217,255,0.05)] mb-8 relative overflow-hidden"
        >
          <div className="absolute top-5 right-6 flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
            <Wifi className="w-3.5 h-3.5" /> Online
          </div>
          
          <div className="w-44 h-44 rounded-full border-4 border-white/5 flex flex-col items-center justify-center relative bg-black/20 backdrop-blur-md shadow-inner mt-2">
             {/* Dynamic Neon Spin */}
             <div className="absolute inset-[-4px] rounded-full border-4 border-[#52d9ff] border-t-transparent animate-spin-slow opacity-50" />
             <Clock className="w-7 h-7 text-[#52d9ff] mb-2 opacity-80" />
             <span className="text-4xl font-black tracking-tight drop-shadow-[0_0_15px_rgba(82,217,255,0.6)]">{formatTime(realScreenTime)}</span>
             <span className="text-[10px] text-white/50 uppercase tracking-widest mt-1.5 font-semibold">True Screen Time</span>
          </div>
        </motion.div>

        {/* ==========================================
            🔄 TOP COMBO WIDGET (True Pill)
            ========================================== */}
        {topCombo && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="mb-8 px-7 py-4 bg-white/5 rounded-full border border-white/10 flex items-center justify-between shadow-lg backdrop-blur-md"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#8d6bff]/20 rounded-full text-[#8d6bff] shadow-inner">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pl-0.5">Most Active Workflow</p>
                <p className="text-sm font-bold capitalize truncate max-w-[200px]">{topCombo[0].replace(/\+/g, ' + ')}</p>
              </div>
            </div>
            <div className="text-right pr-2">
               <p className="text-xs font-mono text-gray-400">Triggered</p>
               <p className="text-sm font-bold text-white">{topCombo[1]} times</p>
            </div>
          </motion.div>
        )}

        {/* ==========================================
            📊 APP ACTIVITY BREAKDOWN (Pill-box Cards)
            ========================================== */}
        <div>
          <h3 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-5 flex items-center gap-2 px-2">
             <Zap className="w-4 h-4 text-[#ff5f56]" /> Activity Breakdown
          </h3>
          
          <AnimatePresence>
            {sortedApps.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center px-8 py-6 bg-white/5 rounded-full border border-white/5 text-gray-500 text-sm">
                Awaiting OS Telemetry Data...
              </motion.div>
            ) : (
              <div className="space-y-4">
                {sortedApps.map((app, idx) => {
                  const AppDef = SYSTEM_APPS[app.appId];
                  const Icon = AppDef?.icon || Activity;
                  
                  // Calculate dynamic ratio for the progress bar
                  const totalAppTime = app.activeTime + app.backgroundTime;
                  const activePerc = totalAppTime > 0 ? (app.activeTime / totalAppTime) * 100 : 0;
                  
                  return (
                    <motion.div 
                      key={app.appId} 
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                      className="group px-6 py-5 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 shadow-md backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-full bg-black/40 shadow-inner ${AppDef?.color || 'text-white'}`}>
                            {typeof Icon === 'string' ? (
                              <img src={Icon} alt="app" className="w-5 h-5 object-contain" />
                            ) : (
                              <Icon className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <span className="text-[15px] font-bold capitalize text-white/90">{AppDef?.name || app.appId}</span>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Sessions: {app.launchCount}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-bold text-[#52d9ff]">{formatTime(app.activeTime)} <span className="font-normal text-gray-500 text-xs ml-1">Active</span></p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{formatTime(app.backgroundTime)} Background</p>
                        </div>
                      </div>
                      
                      {/* Active vs Background Ratio Bar (Pill) */}
                      <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden flex shadow-inner">
                        <div 
                          className="h-full bg-[#52d9ff] transition-all duration-1000 ease-out relative" 
                          style={{ width: `${activePerc}%` }}
                        >
                          <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/20 blur-[2px]" />
                        </div>
                        <div 
                          className="h-full bg-gray-600/40 transition-all duration-1000 ease-out" 
                          style={{ width: `${100 - activePerc}%` }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};