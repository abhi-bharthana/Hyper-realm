'use client';

import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import { useOSStore } from '@/store/useOSStore';
import { Minus, Square, X, Copy } from 'lucide-react';

export const Window = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { windows, closeWindow, focusWindow, toggleMaximize, minimizeWindow, updateWindowBounds } = useOSStore();
  const win = windows.find((w) => w.id === id);
  
  const [isInteracting, setIsInteracting] = useState(false);

  // 🗑️ THE BUGGY USE-EFFECT HAS BEEN COMPLETELY REMOVED!

  if (!win || win.isMinimized) return null; 

  const resizeHandleStyles = {
    top: { height: '10px', top: '-5px', cursor: 'ns-resize' },
    bottom: { height: '10px', bottom: '-5px', cursor: 'ns-resize' },
    left: { width: '10px', left: '-5px', cursor: 'ew-resize' },
    right: { width: '10px', right: '-5px', cursor: 'ew-resize' },
    topLeft: { width: '20px', height: '20px', left: '-10px', top: '-10px', cursor: 'nwse-resize' },
    topRight: { width: '20px', height: '20px', right: '-10px', top: '-10px', cursor: 'nesw-resize' },
    bottomLeft: { width: '20px', height: '20px', left: '-10px', bottom: '-10px', cursor: 'nesw-resize' },
    bottomRight: { width: '20px', height: '20px', right: '-10px', bottom: '-10px', cursor: 'nwse-resize' }
  };

  return (
    <Rnd
      size={{ width: win.isMaximized ? '100%' : win.width, height: win.isMaximized ? '100%' : win.height }}
      
      // 🔥 THE STACK FIX: Simple Math.max use kiya hai. Koi complex window.innerHeight ki zaroorat nahi.
      position={{ x: win.isMaximized ? 0 : win.x, y: win.isMaximized ? 0 : Math.max(0, Number(win.y) || 50) }}
      
      minWidth={400}
      minHeight={300}
      bounds="window" 
      dragHandleClassName="drag-handle"
      disableDragging={win.isMaximized} 
      enableResizing={!win.isMaximized} 
      resizeHandleStyles={resizeHandleStyles}
      
      onDragStart={() => {
        focusWindow(id);
        setIsInteracting(true);
      }}
      onDragStop={(e, d) => {
        updateWindowBounds(id, { x: d.x, y: Math.max(0, d.y) }); 
        setIsInteracting(false);
      }}
      onResizeStart={() => {
        focusWindow(id);
        setIsInteracting(true);
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        updateWindowBounds(id, {
          width: ref.style.width,
          height: ref.style.height,
          x: position.x,
          y: Math.max(0, position.y),
        });
        setIsInteracting(false);
      }}
      
      style={{ 
        zIndex: win.zIndex,
        willChange: isInteracting ? 'transform, width, height' : 'auto' 
      }}
      
      className={`flex flex-col overflow-hidden border border-white/10 ${
        isInteracting 
          ? 'bg-[#12121a]/95 shadow-xl' 
          : 'backdrop-blur-3xl bg-black/40 shadow-[0_20px_60px_rgba(0,0,0,0.5)]'
      } ${
        win.isMaximized ? 'rounded-none transition-all duration-300 ease-in-out' : 'rounded-[24px]'
      }`}
    >
      <div 
        className="drag-handle h-8 bg-white/[0.02] border-b border-white/5 flex items-center px-3 cursor-grab active:cursor-grabbing shrink-0"
        onDoubleClick={() => toggleMaximize(id)} 
        onMouseDown={() => focusWindow(id)}
      >
        <div className="flex items-center gap-2 w-20">
          <button onClick={(e) => { e.stopPropagation(); closeWindow(id); }} className="w-3 h-3 rounded-full bg-[#ff5f56] flex items-center justify-center group hover:bg-[#ff5f56]/80 transition-colors">
            <X size={8} className="opacity-0 group-hover:opacity-100 text-black" strokeWidth={3} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); minimizeWindow(id); }} className="w-3 h-3 rounded-full bg-[#ffbd2e] flex items-center justify-center group hover:bg-[#ffbd2e]/80 transition-colors">
            <Minus size={8} className="opacity-0 group-hover:opacity-100 text-black" strokeWidth={3} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); toggleMaximize(id); }} className="w-3 h-3 rounded-full bg-[#27c93f] flex items-center justify-center group hover:bg-[#27c93f]/80 transition-colors">
            {win.isMaximized ? (
              <Copy size={6} className="opacity-0 group-hover:opacity-100 text-black" strokeWidth={3} />
            ) : (
              <Square size={6} className="opacity-0 group-hover:opacity-100 text-black" strokeWidth={3} />
            )}
          </button>
        </div>

        <div className="flex-1 text-center text-white/50 text-[10px] font-semibold tracking-widest uppercase select-none">
          {win.title}
        </div>

        <div className="w-20" />
      </div>

      <div className={`flex-1 min-h-0 w-full h-full flex flex-col overflow-hidden relative ${isInteracting ? 'pointer-events-none select-none opacity-90' : ''}`}>
        {children}
      </div>
    </Rnd>
  );
};