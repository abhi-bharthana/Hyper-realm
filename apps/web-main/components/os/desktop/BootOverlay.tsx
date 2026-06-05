'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 

export const BootOverlay = ({ isBooted }: { isBooted: boolean }) => {
  return (
    <AnimatePresence>
      {!isBooted && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 z-[99999] bg-[#030305] flex flex-col items-center justify-center pointer-events-auto"
        >
          <div className="w-24 h-24 border-t-2 border-[#52d9ff] border-r-2 border-[#8d6bff] rounded-full animate-spin mb-8" />
          <h1 className="text-white font-black text-3xl tracking-[0.3em] uppercase">Hyper<span className="text-[#52d9ff]">OS</span></h1>
          <p className="text-gray-500 text-[10px] font-mono mt-3 tracking-widest uppercase animate-pulse">Initializing Neural Matrix...</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};