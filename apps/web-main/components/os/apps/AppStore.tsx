'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Trash2, Loader2, Search, Box, Star } from 'lucide-react';
import { useAppManager, CLOUD_APPS_DB } from '@/store/useAppManager';

export const AppStore = () => {
  const { installedApps, isInstalling, installApp, uninstallApp } = useAppManager();
  
  // 🚀 NAYA: UI Navigation State
  const [activeTab, setActiveTab] = useState<'Discover' | 'Apps' | 'Widgets'>('Discover');
  const [searchQuery, setSearchQuery] = useState('');

  // 🚀 NAYA: Smart Filtering Logic mapped to your existing CLOUD_APPS_DB
  const filteredApps = CLOUD_APPS_DB.filter(app => {
    // Assuming 'type' exists in your DB, otherwise defaults to 'App'
    const type = (app as any).type || 'App';
    const tabMatch = activeTab === 'Discover' || type.toLowerCase() + 's' === activeTab.toLowerCase();
    const searchMatch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return tabMatch && searchMatch;
  });

  return (
    <div className="w-full h-full flex flex-col bg-[#050508]/95 backdrop-blur-3xl text-white overflow-hidden relative font-sans rounded-b-[2.5rem] shadow-2xl">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#52d9ff]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#8d6bff]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* 🔮 TOP NAVIGATION BAR */}
      <div className="flex-none h-20 border-b border-white/5 flex items-center justify-between px-8 bg-white/[0.02] z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8d6bff] to-[#52d9ff] flex items-center justify-center shadow-[0_0_20px_rgba(141,107,255,0.4)]">
            <Box size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-widest uppercase">Realm <span className="text-[#52d9ff]">Store</span></h1>
            <p className="text-[10px] text-gray-400 font-mono tracking-widest">Global Ecosystem</p>
          </div>
        </div>

        {/* 🔍 Search Bar */}
        <div className="relative w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Search Apps & Widgets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#52d9ff]/50 transition-colors placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* 🗂️ MAIN LAYOUT (Sidebar + Content) */}
      <div className="flex-1 flex overflow-hidden z-10">
        
        {/* SIDEBAR */}
        <div className="w-56 flex-none border-r border-white/5 p-4 flex flex-col gap-2 bg-black/20">
          {['Discover', 'Apps', 'Widgets'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${
                activeTab === tab 
                  ? 'bg-white/10 text-white shadow-lg border border-white/5' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 💎 STORE GRID */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredApps.map((app, idx) => {
                const isInstalled = installedApps.includes(app.id);
                const isCurrentlyInstalling = isInstalling === app.id;
                // Type casting for any missing properties in the DB
                const rating = (app as any).rating || '4.9';
                const type = (app as any).type || 'App';
                
                // 🚀 FIXED: Assign Icon safely for rendering as a JSX Component
                const AppIcon = app.icon as any; 

                return (
                  <motion.div
                    key={app.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 hover:bg-white/[0.06] hover:border-white/20 transition-all group flex flex-col relative overflow-hidden shadow-lg backdrop-blur-sm"
                  >
                    {/* Header: Icon + Rating */}
                    <div className="flex items-start justify-between mb-4 relative z-10">
                      
                      {/* 🚀 FIXED: Inline styles with Hex colors instead of broken Tailwind dynamic classes */}
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner border group-hover:scale-110 transition-transform"
                        style={{
                          backgroundColor: app.color ? `${app.color}33` : 'rgba(255,255,255,0.1)', // 33 is 20% opacity in Hex
                          color: app.color || '#ffffff',
                          borderColor: app.color ? `${app.color}4D` : 'rgba(255,255,255,0.2)' // 4D is 30% opacity in Hex
                        }}
                      >
                        {AppIcon ? <AppIcon size={28} /> : <Box size={28} />}
                      </div>
                      
                      <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg border border-white/5">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-[10px] font-bold">{rating}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1 relative z-10">{app.name}</h3>
                    <p className="text-[10px] text-[#52d9ff] font-mono mb-3 relative z-10 uppercase">{app.author} • {type}</p>
                    
                    <p className="text-sm text-gray-400 mb-6 flex-1 line-clamp-2 leading-relaxed relative z-10">
                      {app.description}
                    </p>

                    {/* Permissions Dots */}
                    <div className="flex gap-1 mb-4 z-10">
                        {app.permissions?.map(p => (
                          <span key={p} className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" title={`Requires: ${p}`} />
                        ))}
                    </div>

                    <div className="flex items-center justify-between mt-auto relative z-10 pt-4 border-t border-white/5">
                      <span className="text-[10px] text-gray-500 font-mono">{app.size}</span>
                      
                      {/* 🎮 SMART INSTALL BUTTONS */}
                      {isInstalled ? (
                        <button 
                          onClick={() => uninstallApp(app.id)}
                          className="flex items-center gap-2 px-5 py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all text-xs font-bold shadow-inner"
                        >
                          <Trash2 size={14} /> Uninstall
                        </button>
                      ) : isCurrentlyInstalling ? (
                        <button disabled className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#52d9ff]/20 text-[#52d9ff] border border-[#52d9ff]/30 text-xs font-bold cursor-wait shadow-inner">
                          <Loader2 size={14} className="animate-spin" /> Installing
                        </button>
                      ) : (
                        <button 
                          onClick={() => installApp(app.id)}
                          disabled={isInstalling !== null}
                          className="flex items-center gap-2 px-6 py-2 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all text-xs font-black shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:hover:scale-100"
                        >
                          <Download size={14} /> Get
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AppStore;