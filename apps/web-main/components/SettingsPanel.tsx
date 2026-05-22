"use client";

import { useThemeStore } from "@/store/useThemeStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Sun, Moon, Zap, LogOut, Lock, Clock, Newspaper } from "lucide-react";
import { useEffect, useState } from "react";

export function SettingsPanel() {
  const { 
    theme, setTheme, 
    isSettingsOpen, toggleSettings, 
    isMagicPillVisible, toggleMagicPill,
    showClock, setShowClock,
    showNews, setShowNews
  } = useThemeStore();
  
  const [profile, setProfile] = useState<any>(null);
  const isLight = theme === 'light-verdant';

  useEffect(() => {
    if (isSettingsOpen) {
      const fetchProfile = async () => {
        try {
          const token = localStorage.getItem("hyper_id_token");
          const res = await fetch("http://localhost:8080/api/v1/profile", {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) setProfile(await res.json());
        } catch (e) {
          console.error("Profile sync failed");
        }
      };
      fetchProfile();
    }
  }, [isSettingsOpen]);

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
              ${isLight ? 'bg-white/95 border-black/5' : 'bg-[#0a0a0a]/95 border-white/5'} backdrop-blur-3xl p-8 overflow-y-auto`}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black tracking-tighter uppercase italic">
                System <span className="text-primary">Node</span>
              </h2>
              <button onClick={toggleSettings} className="p-2 hover:bg-primary/10 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Section */}
            <section className="mb-10">
              <div className={`p-6 rounded-[2.5rem] border border-border bg-card/50 backdrop-blur-md`}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
                    <User className="text-background w-7 h-7" />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-black text-lg tracking-tight truncate leading-none mb-1 text-foreground">
                      {profile?.nickname || "Syncing Agent..."}
                    </h3>
                    <p className="text-[9px] font-mono text-primary uppercase tracking-[0.2em] opacity-70">
                      ID: {profile?.hid?.split('-')[0] || "Auth..."}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Appearance */}
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-6">
                <Sun className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 text-foreground">Appearance Mode</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setTheme('dark-green')}
                  className={`p-5 rounded-[2rem] border transition-all flex flex-col items-center gap-3
                    ${theme !== 'light-verdant' ? 'border-primary bg-primary/10' : 'border-border bg-foreground/5'}`}
                >
                  <Moon className={`w-6 h-6 ${theme !== 'light-verdant' ? 'text-primary' : 'opacity-40'}`} />
                  <span className="text-[10px] font-bold uppercase italic text-foreground">Dark Node</span>
                </button>

                <button 
                  onClick={() => setTheme('light-verdant')}
                  className={`p-5 rounded-[2rem] border transition-all flex flex-col items-center gap-3
                    ${theme === 'light-verdant' ? 'border-primary bg-primary/10' : 'border-border bg-foreground/5'}`}
                >
                  <Sun className={`w-6 h-6 ${theme === 'light-verdant' ? 'text-primary' : 'opacity-40'}`} />
                  <span className="text-[10px] font-bold uppercase italic text-foreground">Light Node</span>
                </button>
              </div>
            </section>

            {/* Dashboard Modules - NARE MODULES YAHAN HAIN */}
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 text-foreground">Dashboard Modules</span>
              </div>
              
              <div className="space-y-3">
                {/* Clock Toggle */}
                <div className="flex justify-between items-center p-5 rounded-[2rem] border border-border bg-foreground/5">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-primary opacity-70" />
                    <h4 className="font-bold text-xs uppercase italic text-foreground">Digital Clock</h4>
                  </div>
                  <button 
                    onClick={() => setShowClock(!showClock)}
                    className={`w-12 h-6 rounded-full relative transition-all ${showClock ? 'bg-primary' : 'bg-foreground/20'}`}
                  >
                    <motion.div 
                      animate={{ x: showClock ? 24 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>

                {/* News Toggle */}
                <div className="flex justify-between items-center p-5 rounded-[2rem] border border-border bg-foreground/5">
                  <div className="flex items-center gap-3">
                    <Newspaper className="w-4 h-4 text-primary opacity-70" />
                    <h4 className="font-bold text-xs uppercase italic text-foreground">Global Feed</h4>
                  </div>
                  <button 
                    onClick={() => setShowNews(!showNews)}
                    className={`w-12 h-6 rounded-full relative transition-all ${showNews ? 'bg-primary' : 'bg-foreground/20'}`}
                  >
                    <motion.div 
                      animate={{ x: showNews ? 24 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>

                {/* Magic Pill (Existing) */}
                <div className="flex justify-between items-center p-5 rounded-[2rem] border border-border bg-foreground/5">
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-primary opacity-70" />
                    <h4 className="font-bold text-xs uppercase italic text-foreground">Magic Pill</h4>
                  </div>
                  <button 
                    onClick={toggleMagicPill}
                    className={`w-12 h-6 rounded-full relative transition-all ${isMagicPillVisible ? 'bg-primary' : 'bg-foreground/20'}`}
                  >
                    <motion.div 
                      animate={{ x: isMagicPillVisible ? 24 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Terminate Session */}
            <button 
              onClick={() => { localStorage.removeItem("hyper_id_token"); window.location.href = "/"; }}
              className="w-full mt-8 p-5 rounded-[2rem] bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all group"
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