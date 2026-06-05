'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Layers, Zap, Smartphone, BarChart3, CalendarDays } from 'lucide-react';
import { useWellbeingStore } from '@/store/useWellbeingStore';
import { SYSTEM_APPS } from '@/config/apps.config'; 

// 🎨 Premium Colors for Chart Segments
const CHART_COLORS = ['#52d9ff', '#8d6bff', '#ffbd2e', '#ff5f56', '#27c93f', '#a8a8a8'];

export default function WellbeingModule() {
  // 🚀 Added weeklyStats and monthlyStats (Assuming store will populate these later)
  const { realScreenTime, appUsage, appCombos, weeklyStats, monthlyStats } = useWellbeingStore() as any; 
  
  const [timeRange, setTimeRange] = useState<'today' | 'weekly' | 'monthly'>('today');
  // 🚀 NEW: Hover state to link chart and list
  const [hoveredAppId, setHoveredAppId] = useState<string | null>(null);

  const formatTime = (totalSeconds: number) => {
    if (!totalSeconds) return '0m';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

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

  // Logic for center text of the Donut Chart
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

  // Determine which historical data to show
  const historicalData = timeRange === 'weekly' ? (weeklyStats || []) : (monthlyStats || []);

  return (
    <div className="text-white space-y-8 w-full">
      
      {/* 🚀 HEADER & TABS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
            <Activity size={28} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              Digital Wellbeing
            </h2>
            <p className="text-sm text-gray-400 font-medium mt-1">Ecosystem Telemetry</p>
          </div>
        </div>

        <div className="flex items-center bg-black/40 backdrop-blur-xl p-1.5 rounded-full border border-white/5 shadow-inner">
          {(['today', 'weekly', 'monthly'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setTimeRange(tab)}
              className={`relative px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-colors z-10 ${
                timeRange === tab ? 'text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              {timeRange === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full -z-10 shadow-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 💎 MAIN DASHBOARD AREA */}
      <AnimatePresence mode="wait">
        <motion.div
          key={timeRange}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="space-y-6 px-2"
        >
          {timeRange === 'today' ? (
            /* ==========================================
               🟢 TODAY'S INTERACTIVE SOT DASHBOARD
               ========================================== */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Circular Chart Card */}
              <div className="col-span-1 lg:col-span-1 p-6 rounded-[2.5rem] bg-[#0d0d12]/60 border border-white/5 backdrop-blur-2xl flex flex-col items-center justify-center relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#52d9ff]/10 rounded-full blur-[50px]" />
                
                <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
                  <Smartphone size={14} className="text-[#52d9ff]" /> Screen On Time
                </h3>

                {/* SVG Donut Chart */}
                <div className="relative w-52 h-52 flex items-center justify-center z-10">
                  <svg viewBox="0 0 42 42" className="w-full h-full drop-shadow-xl overflow-visible">
                    {renderChartSegments()}
                  </svg>
                  
                  {/* 🚀 Dynamic Center Text (Changes on Hover) */}
                  <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
                    {hoveredAppDef ? (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                        <span className="text-2xl font-black tracking-tighter text-white drop-shadow-md">
                          {formatTime(hoveredAppDef.activeTime)}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1 max-w-[80px] truncate">
                          {isOthersHovered ? 'Other Apps' : (HoveredAppMeta?.name || hoveredAppDef.appId)}
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                        <span className="text-3xl font-black tracking-tighter text-white drop-shadow-md">
                          {formatTime(realScreenTime)}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">Total Time</span>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              {/* Legend & App Breakdown Card */}
              <div className="col-span-1 lg:col-span-2 p-6 rounded-[2.5rem] bg-[#0d0d12]/60 border border-white/5 backdrop-blur-2xl flex flex-col shadow-xl">
                <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Layers size={14} className="text-[#8d6bff]" /> App Usage Breakdown
                </h3>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2.5">
                  {displayApps.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
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
                          // 🚀 STRICT PILL SHAPE & HOVER EFFECTS
                          className={`flex items-center justify-between p-2.5 pr-4 rounded-full border transition-all duration-300 cursor-pointer ${
                            isDimmed ? 'opacity-30 border-transparent bg-transparent' : 
                            isHovered ? 'bg-white/[0.08] border-white/20 scale-[1.01] shadow-lg' : 
                            'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-10 rounded-full shadow-inner" style={{ backgroundColor: colorHex }} />
                            <div className="p-2.5 rounded-full bg-black/40 shadow-inner border border-white/5">
                              {typeof Icon === 'string' ? (
                                <img src={Icon} alt="app" className="w-4 h-4 object-contain" />
                              ) : (
                                <Icon size={16} style={{ color: colorHex }} />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-white capitalize tracking-wide leading-tight">
                                {isOthers ? 'Other Apps' : (AppDef?.name || app.appId)}
                              </p>
                              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
                                {app.launchCount} Sessions
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <p className="font-bold text-sm drop-shadow-md" style={{ color: colorHex }}>
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
               📊 WEEKLY / MONTHLY (REAL DATA OR EMPTY)
               ========================================== */
            <div className="p-8 rounded-[2.5rem] bg-[#0d0d12]/60 border border-white/5 backdrop-blur-2xl shadow-xl flex flex-col relative overflow-hidden min-h-[300px]">
              <div className="absolute top-0 left-0 w-64 h-64 bg-[#8d6bff]/10 rounded-full blur-[80px]" />
              
              <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-2 relative z-10">
                {timeRange === 'weekly' ? <BarChart3 size={14} className="text-[#8d6bff]" /> : <CalendarDays size={14} className="text-[#8d6bff]" />} 
                {timeRange === 'weekly' ? '7-Day Trend' : '30-Day Trend'}
              </h3>

              {/* 🚀 REAL DATA CHECK: Show empty state if no historical data exists */}
              {historicalData.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 opacity-60 z-10 mt-4">
                  <BarChart3 size={40} className="mb-3" />
                  <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Waiting for Data</span>
                  <span className="text-[10px] mt-1 text-center max-w-xs">
                    Historical telemetry is not available yet. Keep using the OS to generate trends.
                  </span>
                </div>
              ) : (
                <div className="flex-1 flex flex-col mt-4 relative z-10">
                  {/* If you add data later, render bars here */}
                  <p className="text-white text-sm">Data processing engine active...</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ⚡ TOP WORKFLOW STRIP */}
      <div className="px-2 pb-10">
        <div className="p-5 rounded-full bg-gradient-to-r from-white/5 to-transparent border border-white/5 backdrop-blur-xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-black/40 rounded-full shadow-inner border border-white/5"><Layers size={18} className="text-amber-400" /></div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Top Workflow Combination</p>
              <p className="text-sm font-bold text-white capitalize tracking-wide">
                {topCombo ? topCombo[0].replace(/\+/g, ' + ') : 'Analyzing usage patterns...'}
              </p>
            </div>
          </div>
          {topCombo && (
            <div className="px-4 py-1.5 rounded-full bg-amber-400/10 text-[10px] font-bold text-amber-400 border border-amber-400/20 tracking-widest uppercase">
              Productivity Matrix Active
            </div>
          )}
        </div>
      </div>

    </div>
  );
}