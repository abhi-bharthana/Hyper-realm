'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls, useMotionValue, animate } from 'framer-motion';
import { X, Minus, Maximize2, Minimize2, Columns } from 'lucide-react';
import { useOSStore } from '@/store/useOSStore';
import { SYSTEM_APPS } from '@/config/apps.config';

interface WindowProps {
  id: string;
  children: React.ReactNode;
}

type SnapType = 
  | 'left' | 'right' | 'top' 
  | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' 
  | 'third-left' | 'third-center' | 'third-right' 
  | null;

export const Window: React.FC<WindowProps> = ({ id, children }) => {
  const { windows, closeWindow, focusWindow } = useOSStore();
  const win = windows.find((w) => w.id === id);
  const AppDef = SYSTEM_APPS[win?.appId || ''];

  const dragControls = useDragControls();

  // 🚀 GOD-LEVEL PERFORMANCE: React state ki jagah 60FPS Framer Motion values!
  const x = useMotionValue(typeof window !== 'undefined' ? (window.innerWidth - (AppDef?.config?.width || 800)) / 2 : 100);
  const y = useMotionValue(typeof window !== 'undefined' ? (window.innerHeight - (AppDef?.config?.height || 600)) / 2 : 100);
  const w = useMotionValue(AppDef?.config?.width || 800);
  const h = useMotionValue(AppDef?.config?.height || 600);
  
  // Track manual stretch size for tear-off restoration
  const currentSizeRef = useRef({ w: AppDef?.config?.width || 800, h: AppDef?.config?.height || 600 });

  const [snapPreview, setSnapPreview] = useState<SnapType>(null);
  const [snappedLayout, setSnappedLayout] = useState<SnapType>(null);
  const [showSnapAssist, setShowSnapAssist] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    // Listen for cross-window snap commands
    const handleSnapCommand = (e: any) => { if (e.detail.id === id) applySnap(e.detail.layout); };
    window.addEventListener('snap-window', handleSnapCommand);
    return () => window.removeEventListener('snap-window', handleSnapCommand);
  }, [id]);

  if (!win) return null;
  const OS_TOP_BAR_HEIGHT = 28;

  // 🖱️ DRAG HANDLERS (Detect 4-way corners and edges)
  const handleDrag = (e: any, info: any) => {
    const px = info.point.x; const py = info.point.y;
    const padX = 20; const padY = 20;
    const screenW = window.innerWidth; const screenH = window.innerHeight;

    if (px < padX && py < padY + OS_TOP_BAR_HEIGHT) setSnapPreview('top-left');
    else if (px > screenW - padX && py < padY + OS_TOP_BAR_HEIGHT) setSnapPreview('top-right');
    else if (px < padX && py > screenH - padY) setSnapPreview('bottom-left');
    else if (px > screenW - padX && py > screenH - padY) setSnapPreview('bottom-right');
    else if (px < padX) setSnapPreview('left');
    else if (px > screenW - padX) setSnapPreview('right');
    else if (py < padY + OS_TOP_BAR_HEIGHT) setSnapPreview('top');
    else setSnapPreview(null);
  };

  const handleDragEnd = () => {
    if (snapPreview) applySnap(snapPreview);
  };

  const applySnap = (layout: SnapType) => {
    setSnappedLayout(layout);
    setSnapPreview(null);
    setShowSnapAssist(null);

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const top = OS_TOP_BAR_HEIGHT;
    const config = { type: "spring", stiffness: 300, damping: 30 };

    if (!layout) {
      // 🚀 TEAR-OFF RESTORE: Wapas usi size mein aayega jo tune stretch kiya tha
      animate(w, currentSizeRef.current.w, config);
      animate(h, currentSizeRef.current.h, config);
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

    // 🚀 60FPS Snap Animation Engine
    animate(x, tX, config); animate(y, tY, config);
    animate(w, tW, config); animate(h, tH, config);

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

  // Hologram Class Mapper
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

  // 🪄 8-Way Window Custom Resize Handles Engine
  const resizeHandles = [
    { dir: 't', cursor: 'cursor-n-resize', cn: 'top-0 left-4 right-4 h-2 -translate-y-1' },
    { dir: 'b', cursor: 'cursor-s-resize', cn: 'bottom-0 left-4 right-4 h-2 translate-y-1' },
    { dir: 'l', cursor: 'cursor-w-resize', cn: 'left-0 top-4 bottom-4 w-2 -translate-x-1' },
    { dir: 'r', cursor: 'cursor-e-resize', cn: 'right-0 top-4 bottom-4 w-2 translate-x-1' },
    { dir: 'tl', cursor: 'cursor-nw-resize', cn: 'top-0 left-0 w-4 h-4 -translate-x-1 -translate-y-1' },
    { dir: 'tr', cursor: 'cursor-ne-resize', cn: 'top-0 right-0 w-4 h-4 translate-x-1 -translate-y-1' },
    { dir: 'bl', cursor: 'cursor-sw-resize', cn: 'bottom-0 left-0 w-4 h-4 -translate-x-1 translate-y-1' },
    { dir: 'br', cursor: 'cursor-se-resize', cn: 'bottom-0 right-0 w-4 h-4 translate-x-1 translate-y-1' },
  ];

  const isSnapped = snappedLayout !== null;
  const otherOpenApps = useOSStore.getState().windows.filter(w => w.id !== id && !w.isMinimized);

  return (
    <>
      <AnimatePresence>
        {snapPreview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`fixed z-[9998] border-2 border-[#52d9ff]/50 bg-[#52d9ff]/10 backdrop-blur-sm pointer-events-none ${snapHologramClass}`}
          />
        )}

        {showSnapAssist && win.isFocused && (
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

      <motion.div
        drag={!isSnapped} 
        dragMomentum={false}
        dragListener={false} 
        dragControls={dragControls}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        // 🚀 Frame-by-frame 60FPS positioning map (Bypasses React DOM re-renders)
        style={{ x, y, width: w, height: h, zIndex: win.isFocused ? 100 : 10 }}
        onMouseDown={() => focusWindow(id)}
        className={`absolute flex flex-col border border-white/10 bg-[#0a0a0f]/95 backdrop-blur-3xl shadow-2xl overflow-hidden ${
           isSnapped ? 'rounded-none' : 'rounded-[1.2rem]'
        }`}
      >
        {/* 🪄 8-Way Edge Handles injected directly into the DOM frame */}
        {!isSnapped && resizeHandles.map((handle, i) => (
          <motion.div
            key={i}
            className={`absolute z-[200] ${handle.cursor} ${handle.cn}`}
            onPointerDown={e => e.stopPropagation()} // 🛡️ Prevents Window dragging while stretching
            onPan={(e, info) => {
              let newW = w.get(); let newH = h.get(); let newX = x.get(); let newY = y.get();

              if (handle.dir.includes('r')) newW += info.delta.x;
              if (handle.dir.includes('b')) newH += info.delta.y;
              if (handle.dir.includes('l')) { const d = info.delta.x; if (newW - d >= 320) { newW -= d; newX += d; } }
              if (handle.dir.includes('t')) { const d = info.delta.y; if (newH - d >= 240) { newH -= d; newY += d; } }

              newW = Math.max(320, newW); newH = Math.max(240, newH);
              w.set(newW); h.set(newH); x.set(newX); y.set(newY);
              currentSizeRef.current = { w: newW, h: newH }; // Sync memory
            }}
          />
        ))}

        <div 
          className="h-9 bg-black/40 border-b border-white/5 flex items-center justify-between px-3 shrink-0 select-none cursor-grab active:cursor-grabbing group/titlebar"
          onPointerDown={(e) => {
            if (snappedLayout) applySnap(null); // Instant Tear-Off Restore
            setShowSnapAssist(null);
            dragControls.start(e);
          }}
          onDoubleClick={() => applySnap(snappedLayout === 'top' ? null : 'top')}
        >
          <div className="flex items-center gap-1.5 relative z-[300]">
            {/* 🛡️ 1-CLICK INSTA KILL (Isolated event stops dragging bugs) */}
            <button 
              onPointerDown={e => e.stopPropagation()} 
              onClick={(e) => { e.stopPropagation(); closeWindow(id); }} 
              className="w-3 h-3 rounded-full bg-[#ff5f56] flex items-center justify-center group/btn border border-[#ff5f56]/50 transition-all hover:scale-110"
            >
              <X className="w-2 h-2 opacity-0 group-hover/btn:opacity-100 text-black" />
            </button>
            
            <button 
              onPointerDown={e => e.stopPropagation()} 
              className="w-3 h-3 rounded-full bg-[#ffbd2e] flex items-center justify-center group/btn border border-[#ffbd2e]/50 transition-all hover:scale-110"
            >
              <Minus className="w-2 h-2 opacity-0 group-hover/btn:opacity-100 text-black" />
            </button>
            
            <div className="relative group/snap flex items-center justify-center">
              <button 
                onPointerDown={e => e.stopPropagation()} 
                onClick={(e) => { e.stopPropagation(); applySnap(snappedLayout === 'top' ? null : 'top'); }} 
                className="w-3 h-3 rounded-full bg-[#27c93f] flex items-center justify-center group/btn border border-[#27c93f]/50 transition-all hover:scale-110"
              >
                {snappedLayout === 'top' ? <Minimize2 className="w-2 h-2 opacity-0 group-hover/btn:opacity-100 text-black" /> : <Maximize2 className="w-2 h-2 opacity-0 group-hover/btn:opacity-100 text-black" />}
              </button>

              <div className="absolute top-full left-0 pt-2 hidden group-hover/snap:block z-[400]">
                <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-3 flex flex-col gap-2 shadow-2xl w-36 pointer-events-auto" onPointerDown={e => e.stopPropagation()}>
                  <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest text-center mb-1">Snap Layouts</div>
                  
                  {/* 2-Split */}
                  <div className="flex gap-1 h-8">
                    <button onClick={() => applySnap('left')} className="flex-1 rounded bg-white/5 hover:bg-[#52d9ff]/20 border-l-2 border-[#52d9ff] transition-colors" title="Left Half" />
                    <button onClick={() => applySnap('right')} className="flex-1 rounded bg-white/5 hover:bg-[#52d9ff]/20 border-r-2 border-[#52d9ff] transition-colors" title="Right Half" />
                  </div>

                  {/* 3-Split */}
                  <div className="flex gap-1 h-8">
                    <button onClick={() => applySnap('third-left')} className="flex-1 rounded bg-white/5 hover:bg-emerald-400/20 border-l-2 border-emerald-400 transition-colors" title="Third Left" />
                    <button onClick={() => applySnap('third-center')} className="flex-1 rounded bg-white/5 hover:bg-emerald-400/20 border-x-2 border-emerald-400 transition-colors" title="Third Center" />
                    <button onClick={() => applySnap('third-right')} className="flex-1 rounded bg-white/5 hover:bg-emerald-400/20 border-r-2 border-emerald-400 transition-colors" title="Third Right" />
                  </div>

                  {/* 4-Split */}
                  <div className="grid grid-cols-2 gap-1 h-12">
                    <button onClick={() => applySnap('top-left')} className="rounded bg-white/5 hover:bg-[#8d6bff]/20 border-t-2 border-l-2 border-[#8d6bff] transition-colors" title="Top Left" />
                    <button onClick={() => applySnap('top-right')} className="rounded bg-white/5 hover:bg-[#8d6bff]/20 border-t-2 border-r-2 border-[#8d6bff] transition-colors" title="Top Right" />
                    <button onClick={() => applySnap('bottom-left')} className="rounded bg-white/5 hover:bg-[#8d6bff]/20 border-b-2 border-l-2 border-[#8d6bff] transition-colors" title="Bottom Left" />
                    <button onClick={() => applySnap('bottom-right')} className="rounded bg-white/5 hover:bg-[#8d6bff]/20 border-b-2 border-r-2 border-[#8d6bff] transition-colors" title="Bottom Right" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest text-gray-400 absolute left-1/2 -translate-x-1/2 pointer-events-none">
            {AppDef && <AppDef.icon size={12} className={AppDef.color} />}
            {AppDef ? AppDef.name : win.title}
          </div>

          <div className="w-12" />
        </div>

        <div className="flex-1 w-full h-full relative overflow-hidden pointer-events-auto">
          {children}
        </div>
      </motion.div>
    </>
  );
};