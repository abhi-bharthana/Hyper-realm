'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { useUserStore } from '@/store/useUserStore'; 
import { Folder, Terminal, PenTool, Image as ImageIcon, Settings, Activity, Calculator, LayoutGrid } from 'lucide-react'; // 👈 LayoutGrid for Start Button
import StartMenuWrapper from './StartMenu/StartMenuWrapper'; // 👈 Tera naya Start Menu import kiya

// 📌 TERA APP REGISTRY 
const OS_APPS = [
  { id: 'explorer', name: 'Hyper Drive', icon: Folder, color: 'text-[#52d9ff]' },
  { id: 'terminal', name: 'Terminal', icon: Terminal, color: 'text-green-400' },
  { id: 'notes', name: 'Note-Mate', icon: PenTool, color: 'text-yellow-400' },
  { id: 'canvas', name: 'Neural Canvas', icon: ImageIcon, color: 'text-[#8d6bff]' },
  { id: 'taskmanager', name: 'Task Manager', icon: Activity, color: 'text-[#ff5f56]' }, 
  { id: 'calculator', name: 'Calculator', icon: Calculator, color: 'text-lime-400' }, 
  { id: 'settings', name: 'Settings', icon: Settings, color: 'text-gray-300' },
];

export const Dock = () => {
  const { windows, openApp } = useOSStore();
  
  // 🚀 TERA NAYA START MENU STATE
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  
  // 🟢 GLOBALS TASTE THE PREFERENCES
  const { preferences } = useUserStore();
  const pos = preferences?.dockPosition || 'bottom';
  const isVertical = pos === 'left' || pos === 'right';

  // 🚀 SMART 3D HOVER ANIMATION (Edge se door bhagega)
  const hoverAnim = 
    pos === 'bottom' ? { y: -8, scale: 1.2 } : 
    pos === 'left' ? { x: 8, scale: 1.2 } : 
    { x: -8, scale: 1.2 };

  // 🎯 SMART TOOLTIP POSITIONING
  let tooltipClass = "";
  if (pos === 'bottom') tooltipClass = "bottom-[calc(100%+20px)] left-1/2 -translate-x-1/2";
  if (pos === 'left') tooltipClass = "left-[calc(100%+20px)] top-1/2 -translate-y-1/2";
  if (pos === 'right') tooltipClass = "right-[calc(100%+20px)] top-1/2 -translate-y-1/2";

  return (
    <>
      {/* 🚀 THE HYPER START MENU (Background mein hidden rahega jab tak click na ho) */}
      <StartMenuWrapper isOpen={isStartMenuOpen} onClose={() => setIsStartMenuOpen(false)} />

      {/* 💎 GOD LEVEL GLASSMORPHISM PILL CONTAINER */}
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={`
          flex items-center gap-3 p-3 relative z-[100]
          backdrop-blur-3xl bg-black/40 border border-white/10 
          shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] 
          ${isVertical ? 'flex-col rounded-[2.5rem] w-[72px]' : 'flex-row rounded-full h-[72px]'}
        `}
      >
        
        {/* ==========================================
            🚀 1. THE HYPER START BUTTON
            ========================================== */}
        <div className="relative group flex items-center justify-center">
          <div className={`absolute ${tooltipClass} px-3 py-1.5 bg-black/80 backdrop-blur-xl text-[#52d9ff] text-[10px] font-black uppercase tracking-widest rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none border border-[#52d9ff]/30 shadow-[0_0_15px_rgba(82,217,255,0.2)] whitespace-nowrap scale-90 group-hover:scale-100 origin-center z-[200]`}>
            Hyper Start
          </div>

          <motion.button
            layout
            whileHover={hoverAnim}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
            className={`relative w-12 h-12 flex items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-[#8d6bff]/20 to-[#52d9ff]/20 hover:from-[#8d6bff]/40 hover:to-[#52d9ff]/40 transition-all duration-300 border border-white/20 shadow-sm group-hover:shadow-[0_0_20px_rgba(82,217,255,0.3)] text-white`}
          >
            <LayoutGrid size={24} strokeWidth={2} />
          </motion.button>

          {/* Active Indicator for Start Menu */}
          <div className={`absolute flex justify-center items-center pointer-events-none ${pos === 'bottom' ? '-bottom-2 w-full' : pos === 'left' ? '-left-2 h-full flex-col' : '-right-2 h-full flex-col'}`}>
            <AnimatePresence>
              {isStartMenuOpen && (
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="w-1.5 h-1.5 bg-[#52d9ff] rounded-full shadow-[0_0_8px_rgba(82,217,255,1)]" 
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ➖ SEPARATOR / DIVIDER */}
        <div className={`bg-white/10 rounded-full ${isVertical ? 'w-6 h-[2px] my-1' : 'w-[2px] h-6 mx-1'}`} />

        {/* ==========================================
            📱 2. PINNED OS APPS
            ========================================== */}
        {OS_APPS.map((app) => {
          const isOpen = windows.some((w) => w.appId === app.id);
          const Icon = app.icon;

          return (
            <div key={app.id} className="relative group flex items-center justify-center">
              
              {/* Tooltip */}
              <div className={`absolute ${tooltipClass} px-3 py-1.5 bg-black/80 backdrop-blur-xl text-white text-[10px] font-bold uppercase tracking-widest rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none border border-white/10 whitespace-nowrap shadow-xl scale-90 group-hover:scale-100 origin-center z-[200]`}>
                {app.name}
              </div>

              {/* App Icon Button */}
              <motion.button
                layout
                whileHover={hoverAnim}
                whileTap={{ scale: 0.9 }}
                onClick={() => openApp(app.id, app.name)}
                className={`relative w-12 h-12 flex items-center justify-center rounded-[1.25rem] bg-white/5 hover:bg-white/15 transition-colors border border-white/5 shadow-sm group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] ${app.color}`}
              >
                <Icon size={24} strokeWidth={1.5} />
              </motion.button>

              {/* Active App Indicator */}
              <div className={`absolute flex justify-center items-center pointer-events-none ${pos === 'bottom' ? '-bottom-2 w-full' : pos === 'left' ? '-left-2 h-full flex-col' : '-right-2 h-full flex-col'}`}>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="w-1.5 h-1.5 bg-white/80 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" 
                    />
                  )}
                </AnimatePresence>
              </div>

            </div>
          );
        })}
      </motion.div>
    </>
  );
};