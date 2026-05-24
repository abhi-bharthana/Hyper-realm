"use client";

import { useThemeStore } from "@/store/useThemeStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Sun, Moon, Zap, LogOut, Clock, Newspaper, HardDrive, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { api, API_URLS } from "@/lib/api";
import { useRouter } from "next/navigation"; // 🎯 Router for navigation

export function SettingsPanel() {
  const router = useRouter();
  const { 
    theme, setTheme, 
    isSettingsOpen, toggleSettings, 
    isMagicPillVisible, toggleMagicPill,
    showClock, setShowClock,
    showNews, setShowNews
  } = useThemeStore();
  
  const [profile, setProfile] = useState<any>(null);

  const isLight = theme?.id === 'light-verdant' || theme?.type === 'light';
  const currentThemeId = theme?.id || theme;

  // 🎯 MINI STORAGE STATS MOCK (Can be fetched from backend later)
  const maxLimitBytes = 5 * 1024 * 1024 * 1024; 
  const usedStorageBytes = 1.54 * 1024 * 1024 * 1024; 
  const usedGB = (usedStorageBytes / (1024 * 1024 * 1024)).toFixed(2);
  const totalGB = (maxLimitBytes / (1024 * 1024 * 1024)).toFixed(0);
  const usagePercentage = ((usedStorageBytes / maxLimitBytes) * 100).toFixed(1);

  useEffect(() => {
    if (isSettingsOpen) {
      const fetchProfile = async () => {
        try {
          const data = await api.get(`${API_URLS.ID}/users/profile`); // Using updated route
          setProfile(data);
        } catch (e) {
          console.error("Profile sync failed", e);
        }
      };
      fetchProfile();
    }
  }, [isSettingsOpen]);

  const navigateToDrive = () => {
    toggleSettings(); // Close settings panel
    router.push('/dashboard/drive'); // Route to Hyper Drive Dashboard
  };

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

            {/* Profile Section */}
            <section className="mb-8">
              <div className={`p-6 rounded-[2.5rem] border backdrop-blur-md ${
                isLight ? 'border-slate-200 bg-white shadow-sm' : 'border-white/5 bg-zinc-900/40'
              }`}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: theme?.primary || '#16a34a' }}>
                    <User className="text-black w-7 h-7 stroke-[2.5]" />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-black text-lg tracking-tight truncate leading-none mb-1">
                      {profile?.nickname || "Syncing Agent..."}
                    </h3>
                    <p className="text-[9px] font-mono uppercase tracking-[0.2em] opacity-70" style={{ color: theme?.primary }}>
                      ID: {profile?.hid?.split('-')[0] || "Auth..."}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 🚀 NEW: HYPER DRIVE CLOUD STORAGE ACCESS */}
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <HardDrive className="w-3 h-3" style={{ color: theme?.primary }} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Network Storage</span>
              </div>
              
              <div 
                onClick={navigateToDrive}
                className={`p-5 rounded-[2rem] border transition-all cursor-pointer group ${
                  isLight ? 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
                    Hyper Drive
                  </h3>
                  <button className={`p-1.5 rounded-lg transition-all group-hover:scale-110 ${
                    isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-zinc-400'
                  }`}>
                    <ExternalLink className="w-3.5 h-3.5" style={{ color: theme?.primary }} />
                  </button>
                </div>

                {/* Mini Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between font-mono text-[9px] uppercase tracking-wider">
                    <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>{usedGB} GB Used</span>
                    <span style={{ color: theme?.primary }}>{usagePercentage}%</span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-black/40 border border-white/5'}`}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${usagePercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: theme?.primary || '#16a34a' }}
                    />
                  </div>
                  <div className="text-[8px] font-mono opacity-50 uppercase tracking-widest text-right pt-0.5">
                    Max {totalGB}.00 GB Quota
                  </div>
                </div>
              </div>
            </section>

            {/* Appearance */}
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-6">
                <Sun className="w-3 h-3" style={{ color: theme?.primary }} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Appearance Mode</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setTheme('dark-green')}
                  className={`p-5 rounded-[2rem] border transition-all flex flex-col items-center gap-3 ${
                    currentThemeId !== 'light-verdant' 
                      ? 'border-primary bg-primary/10 shadow-md' 
                      : isLight ? 'border-slate-200 bg-slate-200/40 hover:bg-slate-200/80' : 'border-white/5 bg-white/5'
                  }`}
                  style={currentThemeId !== 'light-verdant' ? { borderColor: theme?.primary, backgroundColor: `${theme?.primary}1a` } : {}}
                >
                  <Moon className="w-6 h-6" style={{ color: currentThemeId !== 'light-verdant' ? theme?.primary : undefined }} />
                  <span className="text-[10px] font-bold uppercase italic">Dark Node</span>
                </button>

                <button 
                  onClick={() => setTheme('light-verdant')}
                  className={`p-5 rounded-[2rem] border transition-all flex flex-col items-center gap-3 ${
                    currentThemeId === 'light-verdant' 
                      ? 'border-primary bg-primary/10 shadow-md' 
                      : isLight ? 'border-slate-200 bg-slate-200/40' : 'border-white/5 bg-white/5'
                  }`}
                  style={currentThemeId === 'light-verdant' ? { borderColor: theme?.primary, backgroundColor: `${theme?.primary}1a` } : {}}
                >
                  <Sun className="w-6 h-6" style={{ color: currentThemeId === 'light-verdant' ? theme?.primary : undefined }} />
                  <span className="text-[10px] font-bold uppercase italic">Light Node</span>
                </button>
              </div>
            </section>

            {/* Dashboard Modules */}
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-3 h-3" style={{ color: theme?.primary }} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Dashboard Modules</span>
              </div>
              
              <div className="space-y-3">
                <div className={`flex justify-between items-center p-5 rounded-[2rem] border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/5 border-white/5'}`}>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 opacity-70" style={{ color: theme?.primary }} />
                    <h4 className="font-bold text-xs uppercase italic">Digital Clock</h4>
                  </div>
                  <button onClick={() => setShowClock(!showClock)} className="w-12 h-6 rounded-full relative transition-all bg-zinc-800 border border-white/5" style={showClock ? { backgroundColor: theme?.primary } : {}}>
                    <motion.div animate={{ x: showClock ? 24 : 4 }} className="absolute top-1 w-3.5 h-3.5 bg-white rounded-full shadow-sm" />
                  </button>
                </div>

                <div className={`flex justify-between items-center p-5 rounded-[2rem] border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/5 border-white/5'}`}>
                  <div className="flex items-center gap-3">
                    <Newspaper className="w-4 h-4 opacity-70" style={{ color: theme?.primary }} />
                    <h4 className="font-bold text-xs uppercase italic">Global Feed</h4>
                  </div>
                  <button onClick={() => setShowNews(!showNews)} className="w-12 h-6 rounded-full relative transition-all bg-zinc-800 border border-white/5" style={showNews ? { backgroundColor: theme?.primary } : {}}>
                    <motion.div animate={{ x: showNews ? 24 : 4 }} className="absolute top-1 w-3.5 h-3.5 bg-white rounded-full shadow-sm" />
                  </button>
                </div>

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