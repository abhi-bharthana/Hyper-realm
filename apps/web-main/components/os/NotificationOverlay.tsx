'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell } from 'lucide-react';
import { useNotificationStore } from '@/store/useNotificationStore';

export const NotificationOverlay = () => {
  const { notifications, hideToast } = useNotificationStore();

  // Sirf wahi notifs dikhao jo toast state mein hain
  const activeToasts = notifications.filter(n => n.isToast);

  return (
    <div className="absolute top-8 right-6 z-[100000] flex flex-col gap-3 pointer-events-none w-80">
      <AnimatePresence>
        {activeToasts.map((notif) => (
          <motion.div
            key={notif.id}
            layout
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="pointer-events-auto bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-start gap-4 relative overflow-hidden group"
          >
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#52d9ff]/20 rounded-full blur-[30px] pointer-events-none" />

            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#52d9ff] shadow-inner shrink-0">
              {notif.icon || <Bell size={18} />}
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 truncate">
                  {notif.appName || 'System'}
                </span>
                <button 
                  onClick={() => hideToast(notif.id)}
                  className="text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
              <h4 className="text-sm font-bold text-white mb-0.5 truncate">{notif.title}</h4>
              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{notif.message}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};