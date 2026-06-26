'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { Loader2, Box, CloudUpload, UserPlus, SlidersHorizontal } from 'lucide-react';

export const ControlCenter = () => {
  const { isControlCenterOpen, toggleControlCenter } = useOSStore();

  const MOCK_TASKS = [
    {
      id: 1,
      title: 'AI 3D Model Generation',
      subtitle: 'Hyper-Canvas Engine',
      status: 'pending',
      progress: 65,
      icon: <Box size={16} className="text-[#52d9ff]" />
    },
    {
      id: 2,
      title: 'Syncing Drive Assets',
      subtitle: 'MinIO Storage Node',
      status: 'pending',
      progress: 30,
      icon: <CloudUpload size={16} className="text-[#ffbd2e]" />
    },
    {
      id: 3,
      title: 'Incoming Friend Request',
      subtitle: 'Waiting for your approval',
      status: 'action_required',
      progress: 0,
      icon: <UserPlus size={16} className="text-[#ff5f56]" />
    }
  ];

  return (
    <AnimatePresence>
      {isControlCenterOpen && (
        <>
          {/* Invisible Backdrop to close */}
          <div 
            className="absolute inset-0 z-[150]" 
            onClick={toggleControlCenter}
          />
          
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute top-10 right-4 w-80 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col z-[200] p-4 text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-[#8d6bff]" />
                <span className="font-bold text-sm tracking-wide">Control Center</span>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col gap-2 hover:bg-white/10 cursor-pointer transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#52d9ff]/20 flex items-center justify-center">
                   <div className="w-3 h-3 bg-[#52d9ff] rounded-full shadow-[0_0_10px_#52d9ff]" />
                </div>
                <span className="text-[11px] font-bold">Network</span>
              </div>
              <div className="bg-[#8d6bff]/20 border border-[#8d6bff]/30 rounded-xl p-3 flex flex-col gap-2 cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-[#8d6bff]/20 flex items-center justify-center">
                   <div className="w-3 h-3 bg-[#8d6bff] rounded-full shadow-[0_0_10px_#8d6bff]" />
                </div>
                <span className="text-[11px] font-bold text-[#8d6bff]">GPU Boost</span>
              </div>
            </div>

            <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3">Pending Tasks</div>

            {/* Tasks List */}
            <div className="flex flex-col gap-2">
              {MOCK_TASKS.map((task) => (
                <div key={task.id} className="bg-black/40 border border-white/5 rounded-[16px] p-3 relative overflow-hidden group">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-white/5">
                      {task.status === 'pending' ? <Loader2 size={16} className="animate-spin text-white/70" /> : task.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className="text-[12px] font-bold text-white/90 truncate">{task.title}</h4>
                       <p className="text-[10px] text-white/40 truncate">{task.subtitle}</p>
                    </div>
                  </div>
                  
                  {task.status === 'pending' && (
                    <div className="mt-3 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#52d9ff] to-[#8d6bff] rounded-full relative"
                        style={{ width: `${task.progress}%` }}
                      >
                         <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      </div>
                    </div>
                  )}

                  {task.status === 'action_required' && (
                    <div className="mt-2 flex gap-2">
                       <button className="flex-1 bg-[#27c93f]/20 hover:bg-[#27c93f]/30 text-[#27c93f] py-1.5 rounded-lg text-[10px] font-bold transition-colors">Accept</button>
                       <button className="flex-1 bg-white/5 hover:bg-white/10 py-1.5 rounded-lg text-[10px] font-bold transition-colors">Ignore</button>
                    </div>
                  )}
                </div>
              ))}
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
