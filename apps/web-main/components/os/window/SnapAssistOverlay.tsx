'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Columns, X } from 'lucide-react';
import { useOSStore } from '@/store/useOSStore';
import { SYSTEM_APPS } from '@/config/apps.config';

interface SnapAssistProps {
  id: string;
  isFocused: boolean;
  showSnapAssist: 'left' | 'right' | null;
  handleSnapAssistCommit: (id: string, side: 'left' | 'right') => void;
  setShowSnapAssist: (val: any) => void;
}

export const SnapAssistOverlay: React.FC<SnapAssistProps> = ({ id, isFocused, showSnapAssist, handleSnapAssistCommit, setShowSnapAssist }) => {
  const otherOpenApps = useOSStore.getState().windows.filter(w => w.id !== id && !w.isMinimized);

  return (
    <AnimatePresence>
      {showSnapAssist && isFocused && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -20, x: '-50%' }}
          className="fixed top-12 left-1/2 z-[10000] flex items-center gap-3 p-2 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto"
        >
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-3 flex items-center gap-1.5">
            <Columns size={12} className="text-[#52d9ff]" /> Fill {showSnapAssist} Side:
          </span>
          <div className="flex items-center gap-1.5">
            {otherOpenApps.map(app => {
              const OtherAppDef = SYSTEM_APPS[app.appId];
              return (
                <button 
                  key={app.id} 
                  onClick={() => handleSnapAssistCommit(app.id, showSnapAssist)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 transition-all text-xs font-bold text-white border border-white/5 hover:border-white/20"
                >
                  {OtherAppDef && <OtherAppDef.icon size={12} className={OtherAppDef.color} />}
                  {OtherAppDef ? OtherAppDef.name : 'Window'}
                </button>
              );
            })}
          </div>
          <button onClick={() => setShowSnapAssist(null)} className="p-1.5 ml-1 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
            <X size={12} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};