'use client';

import React, { useEffect, useState } from 'react';
import { motion, useDragControls, useMotionValue } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { SYSTEM_APPS } from '@/config/apps.config';

// 🚀 LOGIC HOOKS
import { useWindowDrag } from './window/useWindowDrag';
import { useWindowSnap } from './window/useWindowSnap';

// 🧩 UI SUB-COMPONENTS
import { WindowTitleBar } from './window/WindowTitleBar';
import { WindowResizeHandles } from './window/WindowResizeHandles';
import { SnapHologram } from './window/SnapHologram';
import { SnapAssistOverlay } from './window/SnapAssistOverlay';

interface WindowProps {
  id: string;
  children: React.ReactNode;
}

const OS_TOP_BAR_HEIGHT = 28;

export const Window: React.FC<WindowProps> = ({ id, children }) => {
  const { windows, closeWindow, focusWindow } = useOSStore();
  const win = windows.find((w) => w.id === id);
  const AppDef = SYSTEM_APPS[win?.appId || ''];

  const dragControls = useDragControls();

  const defaultWidth = AppDef?.config?.width || 800;
  const defaultHeight = AppDef?.config?.height || 600;

  // 🚀 BUG 1 FIX: Load actual saved coordinates and size
  const x = useMotionValue(win?.x ?? (typeof window !== 'undefined' ? (window.innerWidth - defaultWidth) / 2 : 100));
  const y = useMotionValue(win?.y ?? (typeof window !== 'undefined' ? (window.innerHeight - defaultHeight) / 2 : 100));
  const w = useMotionValue(win?.width ?? defaultWidth);
  const h = useMotionValue(win?.height ?? defaultHeight);

  // 🚀 BUG 3 FIX: Dynamic Drag Constraints (Strict Boundaries)
  const [dragConstraints, setDragConstraints] = useState({
    top: OS_TOP_BAR_HEIGHT,
    left: -1000, 
    right: 2000, 
    bottom: 2000
  });

  useEffect(() => {
    const updateBounds = () => {
      if (typeof window !== 'undefined') {
        const minVisible = 80; // Kitna hissa screen pe hamesha dikhna hi chahiye
        const currentW = Number(w.get() || defaultWidth);

        setDragConstraints({
          top: OS_TOP_BAR_HEIGHT, // Top bar ke upar window nahi jaa sakti
          left: -(currentW - minVisible), // Left me bahaar jaa sakti hai but 80px hamesha bachega
          right: window.innerWidth - minVisible, // Right boundary
          bottom: window.innerHeight - minVisible, // Bottom boundary
        });
      }
    };

    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, [w, defaultWidth]);

  // 🧩 ATTACH HOOKS
  const { snapPreview, setSnapPreview, handleDrag } = useWindowDrag(OS_TOP_BAR_HEIGHT);
  const { snappedLayout, applySnap, showSnapAssist, setShowSnapAssist, handleSnapAssistCommit, currentSizeRef } = useWindowSnap({
    id, x, y, w, h, OS_TOP_BAR_HEIGHT, initialWidth: win?.width ?? defaultWidth, initialHeight: win?.height ?? defaultHeight
  });

  useEffect(() => {
    const handleSnapCommand = (e: any) => { if (e.detail.id === id) applySnap(e.detail.layout); };
    window.addEventListener('snap-window', handleSnapCommand);
    return () => window.removeEventListener('snap-window', handleSnapCommand);
  }, [id]);

  if (!win) return null;

  const handleDragEnd = () => {
    if (snapPreview) applySnap(snapPreview);
    setSnapPreview(null);
    // 🚀 BUG 1 FIX: Store position when drag finishes
    useOSStore.getState().updateWindowBounds(id, { x: x.get(), y: y.get() });
  };

  const isSnapped = snappedLayout !== null;

  return (
    <>
      <SnapHologram snapPreview={snapPreview} />

      <SnapAssistOverlay 
        id={id} 
        isFocused={win.isFocused} 
        showSnapAssist={showSnapAssist} 
        handleSnapAssistCommit={handleSnapAssistCommit} 
        setShowSnapAssist={setShowSnapAssist} 
      />

      <motion.div
        drag={!isSnapped} 
        dragMomentum={false}
        dragListener={false} 
        dragControls={dragControls}
        
        // 🚀 SMART DRAG CONSTRAINTS APPLIED HERE
        dragConstraints={dragConstraints}
        dragElastic={0} // 👈 Bounce effect hatane ke liye (solid window feel)
        
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        // 🚀 BUG 2 FIX: Actual zIndex mapping from store
        style={{ x, y, width: w, height: h, zIndex: win.zIndex }}
        
        // 🚀 BUG 2 FIX: Bring to front immediately on any interaction
        onPointerDown={() => focusWindow(id)}
        
        className={`absolute flex flex-col border border-white/10 bg-[#0a0a0f]/40 backdrop-blur-[32px] shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden transition-[border-radius] duration-300 ${
           isSnapped ? 'rounded-none' : 'rounded-[1.2rem]'
        }`}
      >
        {!isSnapped && (
          <WindowResizeHandles id={id} x={x} y={y} w={w} h={h} currentSizeRef={currentSizeRef} />
        )}

        <WindowTitleBar 
          id={id} 
          title={AppDef ? AppDef.name : win.title} 
          icon={AppDef?.icon} 
          color={AppDef?.color}
          snappedLayout={snappedLayout}
          dragControls={dragControls}
          closeWindow={closeWindow}
          focusWindow={focusWindow} // 🚀 Passed down to title bar
          applySnap={applySnap}
          setShowSnapAssist={setShowSnapAssist}
        />

        <div className="flex-1 w-full h-full relative overflow-hidden pointer-events-auto">
          {children}
        </div>
      </motion.div>
    </>
  );
};