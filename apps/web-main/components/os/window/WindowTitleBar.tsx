'use client';

import React from 'react';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { DragControls } from 'framer-motion';
import { SnapType } from './useWindowDrag';

interface TitleBarProps {
  id: string;
  title: string;
  icon?: any;
  color?: string;
  snappedLayout: SnapType;
  dragControls: DragControls;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void; // 🚀 NAYA: Window ko upar laane ke liye func
  applySnap: (layout: SnapType) => void;
  setShowSnapAssist: (val: any) => void;
}

export const WindowTitleBar: React.FC<TitleBarProps> = ({
  id, title, icon: Icon, color, snappedLayout, dragControls, closeWindow, focusWindow, applySnap, setShowSnapAssist
}) => {
  return (
    <div 
      className="h-9 bg-white/[0.02] border-b border-white/5 flex items-center justify-between px-3 shrink-0 select-none cursor-grab active:cursor-grabbing group/titlebar"
      onPointerDown={(e) => {
        focusWindow(id); // 🚀 BUG FIX: Title bar click/drag start karte hi focus
        if (snappedLayout) applySnap(null); // Tear-off Restore
        setShowSnapAssist(null);
        dragControls.start(e);
      }}
      onDoubleClick={() => applySnap(snappedLayout === 'top' ? null : 'top')}
    >
      <div className="flex items-center gap-1.5 relative z-[300]">
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
              
              <div className="flex gap-1 h-8">
                <button onClick={() => applySnap('left')} className="flex-1 rounded bg-white/5 hover:bg-[#52d9ff]/20 border-l-2 border-[#52d9ff] transition-colors" title="Left Half" />
                <button onClick={() => applySnap('right')} className="flex-1 rounded bg-white/5 hover:bg-[#52d9ff]/20 border-r-2 border-[#52d9ff] transition-colors" title="Right Half" />
              </div>

              <div className="flex gap-1 h-8">
                <button onClick={() => applySnap('third-left')} className="flex-1 rounded bg-white/5 hover:bg-emerald-400/20 border-l-2 border-emerald-400 transition-colors" title="Third Left" />
                <button onClick={() => applySnap('third-center')} className="flex-1 rounded bg-white/5 hover:bg-emerald-400/20 border-x-2 border-emerald-400 transition-colors" title="Third Center" />
                <button onClick={() => applySnap('third-right')} className="flex-1 rounded bg-white/5 hover:bg-emerald-400/20 border-r-2 border-emerald-400 transition-colors" title="Third Right" />
              </div>

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

      <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest text-gray-300 absolute left-1/2 -translate-x-1/2 pointer-events-none">
        {Icon && <Icon size={12} className={color} />}
        {title}
      </div>

      <div className="w-12" />
    </div>
  );
};