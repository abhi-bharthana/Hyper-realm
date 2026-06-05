'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ChevronRight } from 'lucide-react';
import { useOSStore } from '@/store/useOSStore';
import { SYSTEM_APPS } from '@/config/apps.config';

export default function RecommendedApps({ onClose }: { onClose?: () => void }) {
  const { recentApps, openApp, windows } = useOSStore();

  // 🚀 MAGIC FIX: .slice(0, 3) lagaya taaki exactly 3 apps hi aayein
  // Fallback mein bhi 3 apps daal diye taaki naye user ko layout khali na lage
  const displayApps = (recentApps?.length > 0 ? recentApps : ['explorer', 'canvas', 'settings']).slice(0, 3);

  return (
    <div className="w-full mt-2">
      {/* 🚀 HEADER */}
      <div className="flex items-center justify-between px-3 mb-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Clock size={14} className="text-[#8d6bff]" />
          Recommended
        </h3>
        <button className="text-[10px] bg-white/5 hover:bg-white/10 text-white/50 px-3 py-1.5 rounded-full transition-all shadow-sm border border-white/5 font-bold uppercase tracking-wider flex items-center gap-1">
          More <ChevronRight size={10} />
        </button>
      </div>

      {/* 💎 3-COLUMN SUPER-PILL GRID */}
      <div className="grid grid-cols-3 gap-3 px-1">
        {displayApps.map((appId, idx) => {
          const app = SYSTEM_APPS[appId];
          if (!app) return null;
          
          const Icon = app.icon;
          const isOpen = windows.some(w => w.appId === appId);

          return (
            <motion.button
              key={`${appId}-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                openApp(app.id, app.name);
                if (onClose) onClose(); // App open hone pe Start Menu band ho jaye
              }}
              className="flex flex-col items-center justify-center gap-3 p-5 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 shadow-md group w-full text-center backdrop-blur-sm"
            >
              {/* App Icon */}
              <div className={`p-3.5 rounded-full shadow-inner ${app.color} bg-black/40 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-shadow`}>
                {typeof Icon === 'string' ? (
                  <img src={Icon} alt={app.name} className="w-6 h-6 object-contain drop-shadow-md" />
                ) : (
                  <Icon size={24} strokeWidth={1.5} className="drop-shadow-md" />
                )}
              </div>
              
              {/* App Details */}
              <div className="flex flex-col overflow-hidden w-full px-1">
                <span className="text-xs font-bold text-white/90 truncate">{app.name}</span>
                <span className="text-[9px] text-[#52d9ff] truncate mt-1 font-semibold tracking-widest uppercase">
                  {isOpen ? 'Running' : 'Recent'}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}