'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Box } from 'lucide-react';
import { SYSTEM_APPS } from '@/config/apps.config';
import { useOSStore } from '@/store/useOSStore';

interface LauncherProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Launcher: React.FC<LauncherProps> = ({ isOpen, onClose }) => {
  const { openApp } = useOSStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Close launcher on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Read all dynamically registered apps from OS memory
  const allApps = Object.values(SYSTEM_APPS);
  const filteredApps = allApps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(40px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 z-[99990] flex flex-col items-center justify-start pt-28 bg-[#050508]/60"
          onClick={onClose} // Background click pe close
        >
          
          {/* 🔍 THE ULTIMATE PILL-SHAPED SEARCH BAR */}
          <motion.div 
            initial={{ y: -30, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-[45rem] max-w-[90vw] mb-16"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-[#52d9ff]/20 blur-3xl rounded-full pointer-events-none" />
            
            <Search size={24} className="absolute left-8 top-1/2 -translate-y-1/2 text-[#52d9ff]" />
            <input 
              type="text"
              autoFocus
              placeholder="Search Matrix Modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 hover:border-white/20 focus:border-[#52d9ff]/50 rounded-full py-5 pl-16 pr-8 text-xl text-white font-medium focus:outline-none transition-all placeholder:text-gray-500 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
            />
          </motion.div>

          {/* 💊 PILL-SHAPED APP GRID (Store Style Matching) */}
          <div 
            className="w-full max-w-[75rem] px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 place-items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {filteredApps.map((app, idx) => {
              const AppIcon = app.icon as any;
              // Extracting color for glassmorphism (if available, else fallback)
              const appColor = (app as any).color || '#ffffff';
              
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ delay: idx * 0.03, type: 'spring', stiffness: 300, damping: 25 }}
                  className="w-full flex items-center gap-4 p-3 pr-6 bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 hover:border-white/20 rounded-full cursor-pointer group transition-all duration-300 shadow-lg backdrop-blur-md"
                  onClick={() => {
                    openApp(app.id, app.name);
                    onClose();
                  }}
                >
                  {/* 🎨 THE ICON (Exactly matched with Store UI) */}
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-inner border group-hover:scale-110 transition-transform duration-300"
                    style={{
                      backgroundColor: `${appColor}22`, // 15% opacity hex
                      color: appColor,
                      borderColor: `${appColor}44` // 25% opacity hex
                    }}
                  >
                    {typeof AppIcon === 'string' ? (
                      <span className="text-2xl drop-shadow-md">{AppIcon}</span>
                    ) : AppIcon ? (
                      <AppIcon size={26} className="drop-shadow-md" />
                    ) : (
                      <Box size={26} className="drop-shadow-md" />
                    )}
                  </div>
                  
                  {/* APP DETAILS */}
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-white text-base font-bold tracking-wide truncate group-hover:text-[#52d9ff] transition-colors">
                      {app.name}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase truncate">
                      System Module
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* NO RESULTS FALLBACK */}
          {filteredApps.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-20 text-gray-500">
              <Search size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-xl font-medium tracking-widest uppercase">No Modules Found</p>
            </motion.div>
          )}

        </motion.div>
      )}
    </AnimatePresence>
  );
};