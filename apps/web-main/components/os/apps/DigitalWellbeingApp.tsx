'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWellbeingStore } from '@/store/useWellbeingStore';
import { Activity, Clock, Wifi, Zap, Layers, RefreshCw, Smartphone, BarChart3, CalendarDays } from 'lucide-react';
import { SYSTEM_APPS } from '@/config/apps.config'; 

// 🎨 Premium Colors for Chart Segments
const CHART_COLORS = ['#52d9ff', '#8d6bff', '#ffbd2e', '#ff5f56', '#27c93f', '#a8a8a8'];

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
  const { realScreenTime, appUsage, appCombos, weeklyStats, monthlyStats } = useWellbeingStore() as any;
  const [timeRange, setTimeRange] = useState<'today' | 'weekly' | 'monthly'>('today');
  const [hoveredAppId, setHoveredAppId] = useState<string | null>(null);

  // ==========================================
  // 🚀 DATA PROCESSING: Top 5 + Others
  // ==========================================
  const rawSortedApps = Object.entries(appUsage || {})
    .map(([appId, stats]: any) => ({ appId, ...stats }))
    .sort((a, b) => b.activeTime - a.activeTime);

  const TOP_N = 5;
  const topApps = rawSortedApps.slice(0, TOP_N);
  const remainingApps = rawSortedApps.slice(TOP_N);

  let othersActiveTime = 0;
  let othersBackgroundTime = 0;
  let othersLaunchCount = 0;

  remainingApps.forEach(app => {
    othersActiveTime += app.activeTime;
    othersBackgroundTime += app.backgroundTime;
    othersLaunchCount += app.launchCount;
  });

  const displayApps = [...topApps];
  if (remainingApps.length > 0) {
    displayApps.push({
      appId: 'Others',
      activeTime: othersActiveTime,
      backgroundTime: othersBackgroundTime,
      launchCount: othersLaunchCount,
    });
  }

  const totalActiveTime = displayApps.reduce((acc, app) => acc + app.activeTime, 0);
  const topCombo = Object.entries(appCombos || {}).sort((a: any, b: any) => b[1] - a[1])[0];

  const hoveredAppDef = hoveredAppId ? displayApps.find(a => a.appId === hoveredAppId) : null;
  const isOthersHovered = hoveredAppId === 'Others';
  const HoveredAppMeta = hoveredAppDef && !isOthersHovered ? SYSTEM_APPS[hoveredAppDef.appId] : null;

  // ==========================================
  // 🔮 CIRCULAR CHART RENDERER (SVG)
  // ==========================================
  let cumulativePercent = 0;
  const renderChartSegments = () => {
    if (totalActiveTime === 0) {
      return (
        <circle cx="21" cy="21" r="15.9154943" fill="transparent" stroke="#ffffff10" strokeWidth="4" />
      );
    }

    return displayApps.map((app, i) => {
      const percent = (app.activeTime / totalActiveTime) * 100;
      const offset = 100 - cumulativePercent;
      cumulativePercent += percent;
      
      const colorHex = CHART_COLORS[i % CHART_COLORS.length];
      const isHovered = hoveredAppId === app.appId;
      const isDimmed = hoveredAppId && !isHovered;

      return (
        <circle
          key={app.appId}
          cx="21" cy="21" r="15.9154943"
          fill="transparent"
          stroke={colorHex}
          strokeWidth={isHovered ? "5" : "4"}
          strokeDasharray={`${percent} ${100 - percent}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          opacity={isDimmed ? 0.2 : 1}
          onMouseEnter={() => setHoveredAppId(app.appId)}
          onMouseLeave={() => setHoveredAppId(null)}
          className="transition-all duration-300 ease-out origin-center -rotate-90 cursor-pointer drop-shadow-md hover:drop-shadow-[0_0_8px_currentColor]"
        />
      );
    });
  };

  const historicalData = timeRange === 'weekly' ? (weeklyStats || []) : (monthlyStats || []);

  return (
    <div className="w-full h-full flex flex-col bg-black/40 backdrop-blur-3xl overflow-hidden text-white font-sans rounded-b-[2.5rem] shadow-2xl relative">
      
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#52d9ff]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#8d6bff]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* ==========================================
          🚀 APP HEADER
          ========================================== */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-black/40 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-[#52d9ff]/10 rounded-full">
            <Activity className="w-5 h-5 text-[#52d9ff]" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-widest uppercase">Digital Wellbeing</h2>
            <p className="text-[10px] text-gray-400 pl-0.5">V2 Telemetry Engine</p>
          </div>
        </div>
        
        {/* Sync Button & Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border border-green-500/20">
            <Wifi className="w-3 h-3" /> Online
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[#52d9ff] bg-[#52d9ff]/10 px-4 py-2 rounded-full border border-[#52d9ff]/20">
            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" /> Synced
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative z-10 space-y-8">
        
        {/* 🎛️ TIME RANGE TABS & TOP COMBO */}
        <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
          
          <div className="flex items-center bg-black/40 backdrop-blur-xl p-1.5 rounded-full border border-white/5 shadow-inner">
            {(['today', 'weekly', 'monthly'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setTimeRange(tab)}
                className={`relative px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded-full transition-colors z-10 ${
                  timeRange === tab ? 'text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                {timeRange === tab && (
                  <motion.div
                    layoutId="appTabActive"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full -z-10 shadow-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {tab}
              </button>
            ))}
          </div>

          {topCombo && timeRange === 'today' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="px-6 py-3 bg-white/5 rounded-full border border-white/10 flex items-center gap-6 shadow-lg backdrop-blur-md"
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 text-[#8d6bff]" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Top Workflow</p>
                  <p className="text-sm font-bold capitalize text-white">{topCombo[0].replace(/\+/g, ' + ')}</p>
                </div>
              </div>
              <div className="text-right border-l border-white/10 pl-6">
                 <p className="text-[10px] text-gray-400 uppercase tracking-widest">Triggered</p>
                 <p className="text-sm font-bold text-[#8d6bff]">{topCombo[1]}x</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* 💎 MAIN DASHBOARD AREA */}
        <AnimatePresence mode="wait">
          <motion.div
            key={timeRange}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            {timeRange === 'today' ? (
              /* ==========================================
                 🟢 TODAY'S INTERACTIVE SOT DASHBOARD
                 ========================================== */
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Circular Chart Card */}
                <div className="col-span-1 p-8 rounded-[2.5rem] bg-white/5 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden shadow-xl">
                  <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
                    <Smartphone size={14} className="text-[#52d9ff]" /> Screen On Time
                  </h3>

                  <div className="relative w-56 h-56 flex items-center justify-center z-10">
                    <svg viewBox="0 0 42 42" className="w-full h-full drop-shadow-xl overflow-visible">
                      {renderChartSegments()}
                    </svg>
                    
                    <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
                      {hoveredAppDef ? (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                          <span className="text-3xl font-black tracking-tighter text-white drop-shadow-md">
                            {formatTime(hoveredAppDef.activeTime)}
                          </span>
                          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1 max-w-[100px] truncate">
                            {isOthersHovered ? 'Other Apps' : (HoveredAppMeta?.name || hoveredAppDef.appId)}
                          </span>
                        </motion.div>
                      ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                          <span className="text-4xl font-black tracking-tighter text-white drop-shadow-md">
                            {formatTime(realScreenTime)}
                          </span>
                          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">Total Time</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Legend & App Breakdown Card */}
                <div className="col-span-1 xl:col-span-2 p-8 rounded-[2.5rem] bg-white/5 border border-white/5 flex flex-col shadow-xl">
                  <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-5 flex items-center gap-2">
                    <Zap size={14} className="text-[#ff5f56]" /> Activity Breakdown
                  </h3>

                  <div className="flex-1 space-y-3">
                    {displayApps.length === 0 ? (
                      <div className="py-10 flex flex-col items-center justify-center text-gray-500 opacity-50">
                        <Activity size={32} className="mb-2" />
                        <span className="text-xs font-bold uppercase tracking-widest">No Activity Yet</span>
                      </div>
                    ) : (
                      displayApps.map((app, idx) => {
                        const isOthers = app.appId === 'Others';
                        const AppDef = !isOthers ? SYSTEM_APPS[app.appId] : null;
                        const Icon = isOthers ? Layers : (AppDef?.icon || Zap);
                        const colorHex = CHART_COLORS[idx % CHART_COLORS.length];

                        const isHovered = hoveredAppId === app.appId;
                        const isDimmed = hoveredAppId && !isHovered;

                        return (
                          <div 
                            key={app.appId} 
                            onMouseEnter={() => setHoveredAppId(app.appId)}
                            onMouseLeave={() => setHoveredAppId(null)}
                            className={`flex items-center justify-between p-3.5 pr-6 rounded-full border transition-all duration-300 cursor-pointer ${
                              isDimmed ? 'opacity-30 border-transparent bg-transparent' : 
                              isHovered ? 'bg-white/[0.08] border-white/20 scale-[1.01] shadow-lg' : 
                              'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-1.5 h-10 rounded-full shadow-inner" style={{ backgroundColor: colorHex }} />
                              <div className="p-2.5 rounded-full bg-black/40 shadow-inner border border-white/5">
                                {typeof Icon === 'string' ? (
                                  <img src={Icon} alt="app" className="w-5 h-5 object-contain" />
                                ) : (
                                  <Icon size={18} style={{ color: colorHex }} />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-[15px] text-white capitalize tracking-wide leading-tight">
                                  {isOthers ? 'Other Apps' : (AppDef?.name || app.appId)}
                                </p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
                                  {app.launchCount} Sessions
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex flex-col items-end">
                              <p className="font-bold text-[15px] drop-shadow-md" style={{ color: colorHex }}>
                                {formatTime(app.activeTime)}
                              </p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {formatTime(app.backgroundTime)} BG
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

            ) : (
              /* ==========================================
                 📊 WEEKLY / MONTHLY TRENDS
                 ========================================== */
              <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/5 shadow-xl flex flex-col relative overflow-hidden min-h-[400px] justify-center items-center">
                <div className="absolute top-0 left-0 w-64 h-64 bg-[#8d6bff]/10 rounded-full blur-[80px]" />
                
                <h3 className="absolute top-8 left-8 text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2 z-10">
                  {timeRange === 'weekly' ? <BarChart3 size={14} className="text-[#8d6bff]" /> : <CalendarDays size={14} className="text-[#8d6bff]" />} 
                  {timeRange === 'weekly' ? '7-Day Trend' : '30-Day Trend'}
                </h3>

                {historicalData.length === 0 ? (
                  <div className="flex flex-col items-center text-gray-500 opacity-60 z-10">
                    <BarChart3 size={48} className="mb-4" />
                    <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Waiting for Data</span>
                    <span className="text-xs mt-2 text-center max-w-sm">
                      Historical telemetry is not available yet. Keep using the OS to generate tracking trends over time.
                    </span>
                  </div>
                ) : (
                  <div className="flex-1 w-full flex flex-col justify-end mt-12 relative z-10">
                    <p className="text-white/50 text-sm text-center">Data processing engine active...</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
};