'use client';

import React, { MutableRefObject } from 'react';
import { motion, MotionValue } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';

interface ResizeProps {
  id: string; // 🚀 NAYA
  x: MotionValue<number>;
  y: MotionValue<number>;
  w: MotionValue<number>;
  h: MotionValue<number>;
  currentSizeRef: MutableRefObject<{ w: number; h: number }>;
}

const resizeHandlesList = [
  { dir: 't', cursor: 'cursor-n-resize', cn: 'top-0 left-4 right-4 h-2 -translate-y-1' },
  { dir: 'b', cursor: 'cursor-s-resize', cn: 'bottom-0 left-4 right-4 h-2 translate-y-1' },
  { dir: 'l', cursor: 'cursor-w-resize', cn: 'left-0 top-4 bottom-4 w-2 -translate-x-1' },
  { dir: 'r', cursor: 'cursor-e-resize', cn: 'right-0 top-4 bottom-4 w-2 translate-x-1' },
  { dir: 'tl', cursor: 'cursor-nw-resize', cn: 'top-0 left-0 w-4 h-4 -translate-x-1 -translate-y-1' },
  { dir: 'tr', cursor: 'cursor-ne-resize', cn: 'top-0 right-0 w-4 h-4 translate-x-1 -translate-y-1' },
  { dir: 'bl', cursor: 'cursor-sw-resize', cn: 'bottom-0 left-0 w-4 h-4 -translate-x-1 translate-y-1' },
  { dir: 'br', cursor: 'cursor-se-resize', cn: 'bottom-0 right-0 w-4 h-4 translate-x-1 translate-y-1' },
];

export const WindowResizeHandles: React.FC<ResizeProps> = ({ id, x, y, w, h, currentSizeRef }) => {
  return (
    <>
      {resizeHandlesList.map((handle, i) => (
        <motion.div
          key={i}
          className={`absolute z-[200] ${handle.cursor} ${handle.cn}`}
          onPointerDown={e => e.stopPropagation()} 
          onPan={(e, info) => {
            let newW = w.get(); let newH = h.get(); let newX = x.get(); let newY = y.get();

            if (handle.dir.includes('r')) newW += info.delta.x;
            if (handle.dir.includes('b')) newH += info.delta.y;
            if (handle.dir.includes('l')) { const d = info.delta.x; if (newW - d >= 320) { newW -= d; newX += d; } }
            if (handle.dir.includes('t')) { const d = info.delta.y; if (newH - d >= 240) { newH -= d; newY += d; } }

            newW = Math.max(320, newW); newH = Math.max(240, newH);
            w.set(newW); h.set(newH); x.set(newX); y.set(newY);
            currentSizeRef.current = { w: newW, h: newH }; 
          }}
          // 🚀 BUG 1 FIX: Store new bounds on resize end
          onPanEnd={() => {
            useOSStore.getState().updateWindowBounds(id, { x: x.get(), y: y.get(), width: w.get(), height: h.get() });
          }}
        />
      ))}
    </>
  );
};