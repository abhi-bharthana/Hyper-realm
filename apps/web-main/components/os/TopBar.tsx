'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Wifi, BatteryMedium, Search, Bell, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '@/store/useNotificationStore';

interface TopBarProps {
  onFileClick?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onFileClick }) => {
  const [time, setTime] = useState<string>('');
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { notifications, dismiss, clearAll } = useNotificationStore();

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    updateClock();
    const timerId = setInterval(updateClock, 1000);
    return () => clearInterval(timerId);
  }, []);

  // Click outside to close Notification Center
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
    };
    if (showNotifs) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifs]);

  return (
    <div className="absolute top-0 w-full h-7 z-[100] flex justify-between items-center px-4 backdrop-blur-md bg-black/20 border-b border-white/5 text-white/90 text-xs font-medium select-none pointer-events-auto">
      
      {/* 🚀 LEFT SECTION */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
          <span className="text-[#8d6bff]">⚡</span>
          <span className="font-bold tracking-wide">HYPER</span>
        </div>
        
        <div className="hidden md:flex gap-3 text-white/70">
          <span onClick={onFileClick} className="cursor-pointer hover:text-white hover:text-white/100 transition-colors active:scale-95">File</span>
          <span className="cursor-pointer hover:text-white transition-colors">Edit</span>
          <span className="cursor-pointer hover:text-white transition-colors">View</span>
          <span className="cursor-pointer hover:text-white transition-colors">Go</span>
          <span className="cursor-pointer hover:text-white transition-colors">Help</span>
        </div>
      </div>

      {/* 📡 RIGHT SECTION */}
      <div className="flex items-center gap-3 relative">
        <div className="flex items-center gap-3 text-white/70 mr-2">
          <Search size={14} className="cursor-pointer hover:text-white transition-colors" />
          <Wifi size={14} className="cursor-pointer hover:text-white transition-colors" />
          <BatteryMedium size={15} className="cursor-pointer hover:text-white transition-colors" />
          
          {/* 🔔 BELL ICON WITH BADGE */}
          <div 
            className="relative cursor-pointer hover:text-white transition-colors flex items-center justify-center h-full px-1" 
            onClick={() => setShowNotifs(!showNotifs)}
          >
            <Bell size={14} />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#ff5f56] rounded-full animate-pulse shadow-[0_0_8px_rgba(255,95,86,0.8)]" />
            )}
          </div>
        </div>

        <div className="cursor-pointer hover:text-white transition-colors tracking-wide">
          {time}
        </div>

        {/* 🪄 NOTIFICATION CENTER DROPDOWN */}
        <AnimatePresence>
          {showNotifs && (
             <motion.div 
                ref={notifRef}
                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 15, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute top-6 right-0 w-80 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col z-[200]"
             >
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
                    <span className="font-bold text-white text-sm">Notification Center</span>
                    {notifications.length > 0 && (
                        <button onClick={clearAll} className="text-[#52d9ff] hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10">
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
                
                <div className="flex-1 max-h-[350px] overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1">
                    {notifications.length === 0 ? (
                        <div className="py-10 flex flex-col items-center justify-center text-gray-500 gap-3">
                            <Bell size={32} className="opacity-20" />
                            <span className="text-xs font-medium">You're all caught up!</span>
                        </div>
                    ) : (
                        notifications.map(notif => (
                            <motion.div 
                                layout
                                key={notif.id} 
                                className="p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all flex items-start gap-3 group relative"
                            >
                                {/* App Icon */}
                                <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#52d9ff] shrink-0 shadow-inner">
                                    {notif.icon || <Bell size={14} />}
                                </div>
                                {/* Message */}
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 truncate">{notif.appName || 'System'}</span>
                                    </div>
                                    <h4 className="text-[13px] font-bold text-white/90 truncate leading-tight mt-0.5">{notif.title}</h4>
                                    <p className="text-[11px] text-gray-400 line-clamp-2 mt-1 leading-relaxed">{notif.message}</p>
                                </div>
                                {/* Dismiss Button */}
                                <button 
                                  onClick={() => dismiss(notif.id)} 
                                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 text-gray-400 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md"
                                >
                                    <X size={12} />
                                </button>
                            </motion.div>
                        ))
                    )}
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
      
    </div>
  );
};