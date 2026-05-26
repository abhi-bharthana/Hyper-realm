"use client";

import { useThemeStore } from "@/store/useThemeStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogOut } from "lucide-react";

// Modular Segments
import { ProfileSync } from "./segments/ProfileSync";
import { StorageAccess } from "./segments/StorageAccess";
import { AppearanceMode } from "./segments/AppearanceMode";
import { DashboardModules } from "./segments/DashboardModules";

export function SettingsPanel() {
  const { theme, isSettingsOpen, toggleSettings } = useThemeStore();
  const isLight = theme?.id === 'light-verdant' || theme?.type === 'light';

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSettings}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100]"
          />

          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className={`fixed right-0 top-0 h-screen z-[101] w-full md:w-[400px] shadow-2xl border-l
              ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#0a0a0a]/95 border-white/5 text-white'} backdrop-blur-3xl p-8 overflow-y-auto custom-scrollbar`}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black tracking-tighter uppercase italic">
                System <span className="text-primary" style={{ color: theme?.primary }}>Node</span>
              </h2>
              <button onClick={toggleSettings} className={`p-2 rounded-xl transition-colors ${isLight ? 'hover:bg-slate-200' : 'hover:bg-white/5'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 🚀 All Logic is now handled inside these individual files */}
            <ProfileSync />
            <StorageAccess />
            <AppearanceMode />
            <DashboardModules />

            {/* Terminate Session */}
            <button 
              onClick={() => { localStorage.removeItem("hyper_id_token"); window.location.href = "/"; }}
              className="w-full mt-2 p-5 rounded-[2rem] bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all group"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
              Terminate Link
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}