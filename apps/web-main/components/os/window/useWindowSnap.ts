'use client';

import { useState, useRef } from 'react';
import { animate, MotionValue } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { SnapType } from './useWindowDrag';

interface SnapProps {
  id: string;
  x: MotionValue<number>;
  y: MotionValue<number>;
  w: MotionValue<number>;
  h: MotionValue<number>;
  OS_TOP_BAR_HEIGHT: number;
  initialWidth: number;
  initialHeight: number;
}

export const useWindowSnap = ({ id, x, y, w, h, OS_TOP_BAR_HEIGHT, initialWidth, initialHeight }: SnapProps) => {
  const [snappedLayout, setSnappedLayout] = useState<SnapType>(null);
  const [showSnapAssist, setShowSnapAssist] = useState<'left' | 'right' | null>(null);
  
  // Track manual stretch size for tear-off restoration
  const currentSizeRef = useRef({ w: initialWidth, h: initialHeight });

  const applySnap = (layout: SnapType) => {
    setSnappedLayout(layout);
    setShowSnapAssist(null);

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const top = OS_TOP_BAR_HEIGHT;
    const config = { type: "spring", stiffness: 300, damping: 30 };

    if (!layout) {
      // 🚀 TEAR-OFF RESTORE
      animate(w, currentSizeRef.current.w, config);
      animate(h, currentSizeRef.current.h, config);
      
      // 🚀 BUG FIX: Restore hoti hui size ko database me update karo
      useOSStore.getState().updateWindowBounds(id, { 
        width: currentSizeRef.current.w, 
        height: currentSizeRef.current.h 
      });
      return;
    }

    let tX = 0, tY = top, tW = screenW, tH = screenH - top;

    switch(layout) {
      case 'left': tW = screenW/2; break;
      case 'right': tX = screenW/2; tW = screenW/2; break;
      case 'top': tW = screenW; break;
      case 'top-left': tW = screenW/2; tH = (screenH - top)/2; break;
      case 'top-right': tX = screenW/2; tW = screenW/2; tH = (screenH - top)/2; break;
      case 'bottom-left': tY = top + (screenH - top)/2; tW = screenW/2; tH = (screenH - top)/2; break;
      case 'bottom-right': tX = screenW/2; tY = top + (screenH - top)/2; tW = screenW/2; tH = (screenH - top)/2; break;
      case 'third-left': tW = screenW/3; break;
      case 'third-center': tX = screenW/3; tW = screenW/3; break;
      case 'third-right': tX = (screenW/3)*2; tW = screenW/3; break;
    }

    // Hardware accelerated frame animation
    animate(x, tX, config); animate(y, tY, config);
    animate(w, tW, config); animate(h, tH, config);

    // 🚀 BUG FIX: Snap hoti hui exact X,Y aur Width,Height save karo
    useOSStore.getState().updateWindowBounds(id, { x: tX, y: tY, width: tW, height: tH });

    const otherOpenApps = useOSStore.getState().windows.filter(win => win.id !== id && !win.isMinimized);
    if (otherOpenApps.length > 0) {
      if (layout === 'left') setShowSnapAssist('right');
      else if (layout === 'right') setShowSnapAssist('left');
    }
  };

  const handleSnapAssistCommit = (otherWinId: string, targetSide: 'left' | 'right') => {
    window.dispatchEvent(new CustomEvent('snap-window', { detail: { id: otherWinId, layout: targetSide } }));
    useOSStore.getState().focusWindow(otherWinId);
    setShowSnapAssist(null);
  };

  return { snappedLayout, applySnap, showSnapAssist, setShowSnapAssist, handleSnapAssistCommit, currentSizeRef };
};