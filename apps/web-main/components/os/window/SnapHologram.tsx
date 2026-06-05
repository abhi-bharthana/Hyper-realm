'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SnapType } from './useWindowDrag';

export const SnapHologram = ({ snapPreview }: { snapPreview: SnapType }) => {
  let snapHologramClass = '';
  switch(snapPreview) {
    case 'left': snapHologramClass = 'top-7 left-0 bottom-0 w-1/2 rounded-r-[2rem]'; break;
    case 'right': snapHologramClass = 'top-7 right-0 bottom-0 w-1/2 rounded-l-[2rem]'; break;
    case 'top': snapHologramClass = 'top-7 left-0 right-0 bottom-0'; break;
    case 'top-left': snapHologramClass = 'top-7 left-0 w-1/2 h-1/2 rounded-br-[2rem]'; break;
    case 'bottom-left': snapHologramClass = 'bottom-0 left-0 w-1/2 h-1/2 rounded-tr-[2rem]'; break;
    case 'top-right': snapHologramClass = 'top-7 right-0 w-1/2 h-1/2 rounded-bl-[2rem]'; break;
    case 'bottom-right': snapHologramClass = 'bottom-0 right-0 w-1/2 h-1/2 rounded-tl-[2rem]'; break;
    case 'third-left': snapHologramClass = 'top-7 left-0 bottom-0 w-1/3 rounded-r-[2rem]'; break;
    case 'third-center': snapHologramClass = 'top-7 left-1/3 bottom-0 w-1/3 rounded-[2rem]'; break;
    case 'third-right': snapHologramClass = 'top-7 right-0 bottom-0 w-1/3 rounded-l-[2rem]'; break;
  }

  return (
    <AnimatePresence>
      {snapPreview && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={`fixed z-[9998] border-2 border-[#52d9ff]/50 bg-[#52d9ff]/10 backdrop-blur-sm pointer-events-none ${snapHologramClass}`}
        />
      )}
    </AnimatePresence>
  );
};