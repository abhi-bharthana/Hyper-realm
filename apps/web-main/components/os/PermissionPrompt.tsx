'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Check, X } from 'lucide-react';
import { usePermissionStore } from '@/store/usePermissionStore';

export const PermissionPrompt = () => {
  const { pendingRequests, grantPermission, denyPermission } = usePermissionStore();

  if (pendingRequests.length === 0) return null;

  // Hamesha top wali request dikhao
  const req = pendingRequests[0];

  return (
    <div className="absolute inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="w-[380px] bg-black/80 border border-white/10 rounded-[2rem] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 bg-yellow-500/20 text-yellow-400 rounded-full flex items-center justify-center mb-4 border border-yellow-500/30">
            <ShieldAlert size={32} />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">Permission Request</h2>
          <p className="text-sm text-gray-300 mb-4">
            <strong className="text-[#52d9ff]">{req.appName}</strong> is requesting access to:
          </p>

          <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 mb-6">
            <div className="font-mono text-xs text-yellow-400 font-bold mb-1 uppercase tracking-widest">
              {req.permission.replace(':', ' ')}
            </div>
            <p className="text-xs text-gray-400 italic">"{req.justification}"</p>
          </div>

          <div className="flex w-full gap-3">
            <button 
              onClick={() => denyPermission(req.id)}
              className="flex-1 py-3 rounded-full bg-white/5 hover:bg-red-500/20 text-white hover:text-red-400 border border-white/10 transition-all font-bold text-sm flex justify-center items-center gap-2"
            >
              <X size={16} /> Deny
            </button>
            <button 
              onClick={() => grantPermission(req.id)}
              className="flex-1 py-3 rounded-full bg-[#52d9ff]/20 hover:bg-[#52d9ff]/30 text-[#52d9ff] border border-[#52d9ff]/30 transition-all font-bold text-sm flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(82,217,255,0.2)]"
            >
              <Check size={16} /> Allow
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};