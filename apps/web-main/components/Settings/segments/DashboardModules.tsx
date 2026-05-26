"use client";

import { motion } from "framer-motion";
import { Zap, Clock, Newspaper } from "lucide-react";
import { useThemeStore } from "@/store/useThemeStore";

export function DashboardModules() {
  const { theme, showClock, setShowClock, showNews, setShowNews, isMagicPillVisible, toggleMagicPill } = useThemeStore();
  const isLight = theme?.id === 'light-verdant' || theme?.type === 'light';

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-3 h-3" style={{ color: theme?.primary }} />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Dashboard Modules</span>
      </div>
      
      <div className="space-y-3">
        {/* Digital Clock */}
        <div className={`flex justify-between items-center p-5 rounded-[2rem] border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/5 border-white/5'}`}>
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 opacity-70" style={{ color: theme?.primary }} />
            <h4 className="font-bold text-xs uppercase italic">Digital Clock</h4>
          </div>
          <button onClick={() => setShowClock(!showClock)} className="w-12 h-6 rounded-full relative transition-all bg-zinc-800 border border-white/5" style={showClock ? { backgroundColor: theme?.primary } : {}}>
            <motion.div animate={{ x: showClock ? 24 : 4 }} className="absolute top-1 w-3.5 h-3.5 bg-white rounded-full shadow-sm" />
          </button>
        </div>

        {/* Global Feed */}
        <div className={`flex justify-between items-center p-5 rounded-[2rem] border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/5 border-white/5'}`}>
          <div className="flex items-center gap-3">
            <Newspaper className="w-4 h-4 opacity-70" style={{ color: theme?.primary }} />
            <h4 className="font-bold text-xs uppercase italic">Global Feed</h4>
          </div>
          <button onClick={() => setShowNews(!showNews)} className="w-12 h-6 rounded-full relative transition-all bg-zinc-800 border border-white/5" style={showNews ? { backgroundColor: theme?.primary } : {}}>
            <motion.div animate={{ x: showNews ? 24 : 4 }} className="absolute top-1 w-3.5 h-3.5 bg-white rounded-full shadow-sm" />
          </button>
        </div>

        {/* Magic Pill */}
        <div className={`flex justify-between items-center p-5 rounded-[2rem] border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/5 border-white/5'}`}>
          <div className="flex items-center gap-3">
            <Zap className="w-4 h-4 opacity-70" style={{ color: theme?.primary }} />
            <h4 className="font-bold text-xs uppercase italic">Magic Pill</h4>
          </div>
          <button onClick={toggleMagicPill} className="w-12 h-6 rounded-full relative transition-all bg-zinc-800 border border-white/5" style={isMagicPillVisible ? { backgroundColor: theme?.primary } : {}}>
            <motion.div animate={{ x: isMagicPillVisible ? 24 : 4 }} className="absolute top-1 w-3.5 h-3.5 bg-white rounded-full shadow-sm" />
          </button>
        </div>
      </div>
    </section>
  );
}