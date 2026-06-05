'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Layers } from 'lucide-react';
import { useWidgetStore } from '@/store/useWidgetStore';
import { SYSTEM_WIDGETS } from '@/config/widgets.config';

// Base Grid Size mapping (e.g., 1 unit = 80px)
const GRID_SIZE = 80;
const GRID_GAP = 16;

// 🚀 THE BUG FIX: WIDGET RENDERER ISOLATION
// Ye naya component har widget ke hooks ko safely isolate karega.
const IsolatedWidgetWrapper = ({ widgetDef }: { widgetDef: any }) => {
  // Yahan api props inject ho jayenge (jaise notification ya vfs)
  return <>{widgetDef.render({ vfs: {}, notification: {} })}</>;
};

export const WidgetEngine = () => {
  const { activeWidgets, updatePosition, removeWidget, isEditMode, setEditMode, addWidget, syncToCloud } = useWidgetStore();
  const [showGallery, setShowGallery] = useState(false);

  return (
    <>
      {/* 🚀 THE WIDGET RENDERER & JIGGLE ENGINE */}
      <div className={`absolute inset-0 z-0 overflow-hidden ${isEditMode ? 'pointer-events-auto bg-black/40 backdrop-blur-sm transition-all duration-500' : 'pointer-events-none'}`}>
        
        {/* Exit Edit Mode Overlay */}
        {isEditMode && (
          <div 
            className="absolute inset-0" 
            onClick={async () => { 
              setEditMode(false); 
              setShowGallery(false); 
              await syncToCloud(); 
            }} 
          />
        )}

        {activeWidgets.map((widgetInstance) => {
          const WidgetDef = SYSTEM_WIDGETS[widgetInstance.widgetId];
          if (!WidgetDef) return null;

          const widthPx = (widgetInstance.w * GRID_SIZE) + ((widgetInstance.w - 1) * GRID_GAP);
          const heightPx = (widgetInstance.h * GRID_SIZE) + ((widgetInstance.h - 1) * GRID_GAP);

          return (
            <motion.div
              key={widgetInstance.instanceId}
              drag={isEditMode}
              dragMomentum={false}
              animate={isEditMode ? { rotate: [-0.5, 0.5, -0.5] } : { rotate: 0 }}
              transition={isEditMode ? { repeat: Infinity, duration: 0.25, ease: "linear" } : {}}
              className={`absolute group ${isEditMode ? 'cursor-grab active:cursor-grabbing z-50' : 'pointer-events-auto'}`} 
              style={{ width: widthPx, height: heightPx, x: widgetInstance.x, y: widgetInstance.y }}
              onDragEnd={(e, info) => {
                // 🚀 BUG FIX 2: Float vs Int Issue Fixed! (Math.round added)
                const newX = Math.round(Math.max(0, widgetInstance.x + info.offset.x));
                const newY = Math.round(Math.max(0, widgetInstance.y + info.offset.y));
                updatePosition(widgetInstance.instanceId, newX, newY);
              }}
            >
              {/* 🚀 FIXED: Wrapped the render function in an isolated component */}
              <div className={`w-full h-full transition-transform ${isEditMode ? 'scale-95 pointer-events-none' : 'scale-100'}`}>
                <IsolatedWidgetWrapper widgetDef={WidgetDef} />
              </div>

              {/* ❌ REMOVE BUTTON */}
              <AnimatePresence>
                {isEditMode && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      removeWidget(widgetInstance.instanceId); 
                    }}
                    className="absolute -top-3 -left-3 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-[#050508] hover:bg-red-400 z-50"
                  >
                    <X size={14} />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* 🔮 EDIT MODE TOP BAR */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
            className="absolute top-10 left-1/2 -translate-x-1/2 flex gap-4 z-[999] pointer-events-auto"
          >
            <button 
              onClick={() => setShowGallery(true)}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-full text-white font-bold flex items-center gap-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all"
            >
              <Plus size={18} /> Add Widget
            </button>
            <button 
              onClick={async () => { 
                setEditMode(false); 
                setShowGallery(false); 
                await syncToCloud(); 
              }}
              className="px-6 py-3 bg-[#52d9ff]/20 hover:bg-[#52d9ff]/30 text-[#52d9ff] border border-[#52d9ff]/30 backdrop-blur-xl rounded-full font-bold transition-all shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
            >
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🛍️ WIDGET GALLERY MODAL */}
      <AnimatePresence>
        {showGallery && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#0d0d12]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-[1000] flex flex-col overflow-hidden pointer-events-auto"
          >
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#8d6bff]/20 text-[#8d6bff] rounded-xl"><Layers size={20} /></div>
                <h2 className="text-xl font-bold text-white tracking-wide">Widget Gallery</h2>
              </div>
              <button onClick={() => setShowGallery(false)} className="p-2 rounded-full hover:bg-white/10 text-gray-400 transition-colors"><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-4 custom-scrollbar">
              {Object.values(SYSTEM_WIDGETS).map((widget) => (
                <div key={widget.id} className="bg-black/40 border border-white/5 rounded-2xl p-5 hover:bg-white/5 hover:border-white/10 transition-all group flex flex-col">
                  <h3 className="font-bold text-white mb-1 text-lg">{widget.name}</h3>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2 flex-1">{widget.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#52d9ff] bg-[#52d9ff]/10 px-2 py-1 rounded-md">Size: {widget.defaultSize.w}x{widget.defaultSize.h}</span>
                    <button 
                      onClick={() => { addWidget(widget.id); setShowGallery(false); }}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#52d9ff] hover:text-black flex items-center justify-center transition-all text-white"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};