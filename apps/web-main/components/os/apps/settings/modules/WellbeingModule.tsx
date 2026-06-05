'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Clock, Layers, Zap } from 'lucide-react';
import { useWellbeingStore } from '@/store/useWellbeingStore';
import { SYSTEM_APPS } from '@/config/apps.config'; // 👈 Tera master App Registry

export const WellbeingModule = () => {
  const { realScreenTime, appUsage, appCombos } = useWellbeingStore();

  // ⏱️ Helper: Convert seconds to "Xh Ym"
  const formatTime = (totalSeconds: number) => {
    if (!totalSeconds) return '0m';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  // 📊 Format and sort Apps by Active Time
  const sortedApps = Object.entries(appUsage || {})
    .map(([appId, stats]) => ({ appId, ...stats }))
    .sort((a, b) => b.activeTime - a.activeTime);

  // 🔗 Format Top Combo
  const topCombo = Object.entries(appCombos || {})
    .sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="p-6 space-y-8 text-white h-full overflow-y-auto custom-scrollbar">
      
      {/* 🚀 HEADER OVERVIEW */}
      <div className="flex flex-col gap-1.5 px-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Digital Wellbeing 2.0
        </h2>
        <p className="text-xs text-gray-400 font-medium tracking-wide">Real-time telemetry and ecosystem analytics.</p>
      </div>

      {/* 💎 GOD LEVEL MAIN STATS CARD (Super Pill) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Real Screen Time Box */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-5 relative overflow-hidden shadow-lg"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#52d9ff]/10 rounded-full blur-3xl" />
          <div className="p-4 bg-[#52d9ff]/20 rounded-full text-[#52d9ff] shadow-inner">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pl-0.5">True Screen Time</div>
            <div className="text-3xl font-black drop-shadow-[0_0_10px_rgba(82,217,255,0.3)]">{formatTime(realScreenTime)}</div>
          </div>
        </motion.div>

        {/* Most Used Combo Box */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-5 relative overflow-hidden shadow-lg"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#8d6bff]/10 rounded-full blur-3xl" />
          <div className="p-4 bg-[#8d6bff]/20 rounded-full text-[#8d6bff] shadow-inner">
            <Layers size={24} />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pl-0.5">Top Workflow</div>
            <div className="text-lg font-bold text-white capitalize truncate w-40">
              {topCombo ? topCombo[0].replace(/\+/g, ' + ') : 'No data yet'}
            </div>
          </div>
        </motion.div>
      </div>

      {/* 📊 APP USAGE BREAKDOWN (Active vs Background) */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2 px-2">
          <Activity size={16} className="text-[#ff5f56]" /> Activity Breakdown
        </h3>
        
        <div className="space-y-4">
          <AnimatePresence>
            {sortedApps.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 bg-white/5 rounded-[2rem] border border-white/5 text-gray-500 text-sm shadow-inner">
                Waiting for activity telemetry...
              </motion.div>
            ) : (
              sortedApps.map((app, idx) => {
                const AppDef = SYSTEM_APPS[app.appId];
                const Icon = AppDef?.icon || Zap;
                
                // Calculate percentage for progress bar
                const totalAppTime = app.activeTime + app.backgroundTime;
                const activePerc = totalAppTime > 0 ? (app.activeTime / totalAppTime) * 100 : 0;

                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: idx * 0.05 }}
                    key={app.appId} 
                    className="group flex flex-col px-6 py-5 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 shadow-md backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full bg-black/40 shadow-inner ${AppDef?.color || 'text-white'}`}>
                          {typeof Icon === 'string' ? (
                            <img src={Icon} alt="app" className="w-5 h-5 object-contain" />
                          ) : (
                            <Icon size={20} />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-[15px] text-white/90 capitalize">{AppDef?.name || app.appId}</div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">{app.launchCount} Sessions</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-sm text-[#52d9ff]">{formatTime(app.activeTime)} <span className="text-xs text-gray-500 font-normal ml-1">Active</span></div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{formatTime(app.backgroundTime)} Background</div>
                      </div>
                    </div>

                    {/* Smart Progress Bar (Pill shaped with inner glow) */}
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
              })
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
};

export default WellbeingModule;