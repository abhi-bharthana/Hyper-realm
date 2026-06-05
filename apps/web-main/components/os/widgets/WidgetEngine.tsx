'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Layers, Sparkles, Lock, Unlock, Maximize2, Settings2 } from 'lucide-react';
import { useWidgetStore } from '@/store/useWidgetStore';
import { SYSTEM_WIDGETS } from '@/config/widgets.config';

const GRID_SIZE = 80;
const GRID_GAP = 16;

const IsolatedWidgetWrapper = ({ widgetDef, widgetConfig }: { widgetDef: any, widgetConfig?: any }) => {
  return <>{widgetDef.render({ vfs: {}, notification: {} }, widgetConfig)}</>;
};

// 🚀 NAYA: WIDGET EDIT PANEL COMPONENT
const WidgetEditPanel = ({ instanceId, closePanel }: { instanceId: string, closePanel: () => void }) => {
  const { activeWidgets, updateWidgetConfig } = useWidgetStore() as any;
  const widget = activeWidgets.find((w: any) => w.instanceId === instanceId);
  const def = widget ? SYSTEM_WIDGETS[widget.widgetId] : null;

  if (!def || !def.settingsSchema) return null;

  const currentConfig = widget.config || {};

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute right-0 top-0 bottom-0 w-80 bg-black/80 backdrop-blur-3xl border-l border-white/10 p-6 z-[2000] shadow-2xl flex flex-col pointer-events-auto"
    >
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-white font-bold tracking-wide">Customize Widget</h3>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{def.name}</p>
        </div>
        <button onClick={closePanel} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors bg-black/20">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2">
        {def.settingsSchema.map((s: any) => {
          const value = currentConfig[s.key] !== undefined ? currentConfig[s.key] : s.defaultValue;

          return (
            <div key={s.key} className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{s.label}</label>
              
              {/* Color Picker */}
              {s.type === 'color' && (
                <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                   <input 
                    type="color" 
                    value={value} 
                    onChange={(e) => updateWidgetConfig(instanceId, s.key, e.target.value)} 
                    className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-0 p-0"
                  />
                  <span className="text-xs font-mono text-gray-300">{value}</span>
                </div>
              )}

              {/* Select Dropdown */}
              {s.type === 'select' && (
                <select 
                  value={value} 
                  onChange={(e) => updateWidgetConfig(instanceId, s.key, e.target.value)}
                  className="bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-[#52d9ff] transition-colors appearance-none cursor-pointer"
                  style={{ fontFamily: value === 'Syncopate' ? 'sans-serif' : `'${value}', sans-serif` }}
                >
                  {s.options.map((opt: string) => (
                    <option key={opt} value={opt} className="bg-[#0d0d12] text-white">
                      {opt}
                    </option>
                  ))}
                </select>
              )}

              {/* Toggle Switch */}
              {s.type === 'toggle' && (
                <button
                  onClick={() => updateWidgetConfig(instanceId, s.key, !value)}
                  className={`relative w-14 h-7 rounded-full transition-colors flex items-center px-1 ${value ? 'bg-[#52d9ff]/80' : 'bg-white/10'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${value ? 'translate-x-7 shadow-md' : 'translate-x-0'}`} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};


export const WidgetEngine = () => {
  const { 
    activeWidgets, updatePosition, removeWidget, updateSize, toggleLock, 
    isEditMode, setEditMode, addWidget, syncToCloud 
  } = useWidgetStore() as any; // 🚀 ANY lgaya kyuki store me config update func abhi nahi h
  
  const [showGallery, setShowGallery] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [resizePreview, setResizePreview] = useState<{id: string, w: number, h: number} | null>(null);
  const [editingWidgetId, setEditingWidgetId] = useState<string | null>(null); // 🚀 NAYA STATE PANEL KE LIYE

  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const startPoint = useRef<{ x: number, y: number } | null>(null);
  const desktopRef = useRef<HTMLDivElement>(null); 

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    if (e.button !== 0) return; 
    startPoint.current = { x: e.clientX, y: e.clientY };
    pressTimer.current = setTimeout(() => {
      setActiveMenuId(id); 
      pressTimer.current = null;
    }, 500); 
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (startPoint.current && pressTimer.current) {
      const dx = Math.abs(e.clientX - startPoint.current.x);
      const dy = Math.abs(e.clientY - startPoint.current.y);
      if (dx > 10 || dy > 10) {
        clearTimeout(pressTimer.current);
        pressTimer.current = null;
      }
    }
  };

  const cancelPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  return (
    <>
      <div 
        ref={desktopRef}
        className={`absolute inset-0 z-0 overflow-hidden ${isEditMode || activeMenuId ? 'pointer-events-auto' : 'pointer-events-none'}`}
        onClick={() => { if (activeMenuId) setActiveMenuId(null); }}
      >
        
        {(isEditMode || activeMenuId) && (
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-all duration-500" 
            onClick={async () => { 
              setEditMode(false); 
              setActiveMenuId(null);
              setShowGallery(false); 
              setEditingWidgetId(null);
              await syncToCloud(); 
            }} 
          />
        )}

        {activeWidgets.map((widgetInstance: any) => {
          const WidgetDef = SYSTEM_WIDGETS[widgetInstance.widgetId];
          if (!WidgetDef) return null;

          const isMenuOpen = activeMenuId === widgetInstance.instanceId;
          
          const currentW = resizePreview?.id === widgetInstance.instanceId ? resizePreview.w : (widgetInstance.w || WidgetDef.defaultSize.w);
          const currentH = resizePreview?.id === widgetInstance.instanceId ? resizePreview.h : (widgetInstance.h || WidgetDef.defaultSize.h);

          const widthPx = (currentW * GRID_SIZE) + ((currentW - 1) * GRID_GAP);
          const heightPx = (currentH * GRID_SIZE) + ((currentH - 1) * GRID_GAP);

          return (
            <motion.div
              key={widgetInstance.instanceId}
              drag={!widgetInstance.isLocked && (isEditMode || isMenuOpen) && resizePreview?.id !== widgetInstance.instanceId}
              dragConstraints={desktopRef}
              dragElastic={0.1}
              dragMomentum={false}
              animate={isEditMode && !widgetInstance.isLocked && !isMenuOpen ? { rotate: [-0.5, 0.5, -0.5] } : { rotate: 0 }}
              transition={isEditMode ? { repeat: Infinity, duration: 0.25, ease: "linear" } : {}}
              className={`absolute group ${isEditMode || isMenuOpen ? 'z-50 cursor-grab active:cursor-grabbing' : 'pointer-events-auto'}`} 
              style={{ width: widthPx, height: heightPx, x: widgetInstance.x, y: widgetInstance.y }}
              onDragEnd={(e, info) => {
                let newX = widgetInstance.x + info.offset.x;
                let newY = widgetInstance.y + info.offset.y;

                if (desktopRef.current) {
                  const rect = desktopRef.current.getBoundingClientRect();
                  const maxX = rect.width - widthPx;
                  const maxY = rect.height - heightPx;
                  
                  newX = Math.max(0, Math.min(newX, maxX));
                  newY = Math.max(0, Math.min(newY, maxY));
                }

                updatePosition(widgetInstance.instanceId, Math.round(newX), Math.round(newY));
              }}
              onPointerDown={(e) => handlePointerDown(e, widgetInstance.instanceId)}
              onPointerMove={handlePointerMove}
              onPointerUp={cancelPress}
              onPointerLeave={cancelPress}
              onClick={(e) => e.stopPropagation()}
            >
              
              <div 
                className={`w-full h-full transition-all duration-300 ${isEditMode && !isMenuOpen ? 'scale-95 pointer-events-none' : 'scale-100'}`}
                style={{
                  boxShadow: isMenuOpen ? '0 0 0 2px rgba(82,217,255,0.6), 0 20px 40px rgba(0,0,0,0.5)' : 'none',
                  borderRadius: isMenuOpen ? '1.5rem' : '0' 
                }}
              >
                {/* 🚀 INJECTED CONFIG HERE */}
                <IsolatedWidgetWrapper widgetDef={WidgetDef} widgetConfig={widgetInstance.config} />
              </div>

              {widgetInstance.isLocked && isEditMode && !isMenuOpen && (
                <div className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full backdrop-blur-md text-white border border-white/10 shadow-lg">
                  <Lock size={12} />
                </div>
              )}

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 15, scale: 0.9 }}
                    className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl z-[100]"
                    onPointerDown={(e) => e.stopPropagation()} 
                  >
                    <div className="px-3 border-r border-white/10 text-[10px] font-bold tracking-widest text-gray-400 uppercase whitespace-nowrap">
                      {WidgetDef.name}
                    </div>
                    
                    {/* 🚀 EDIT CONFIG BUTTON (Only if widget has settings) */}
                    {WidgetDef.settingsSchema && (
                      <button 
                        onClick={() => { setEditingWidgetId(widgetInstance.instanceId); setActiveMenuId(null); }}
                        className="p-2 rounded-full transition-all hover:scale-110 bg-white/10 hover:bg-[#52d9ff]/20 text-[#52d9ff]"
                        title="Customize Widget"
                      >
                        <Settings2 size={14} />
                      </button>
                    )}

                    <button 
                      onClick={() => toggleLock(widgetInstance.instanceId)}
                      className={`p-2 rounded-full transition-all hover:scale-110 ${widgetInstance.isLocked ? 'bg-red-500/20 text-red-400' : 'bg-white/10 hover:bg-[#52d9ff]/20 text-white'}`}
                      title={widgetInstance.isLocked ? 'Unlock Widget' : 'Lock Widget'}
                    >
                      {widgetInstance.isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                    </button>

                    <button 
                      onClick={() => { removeWidget(widgetInstance.instanceId); setActiveMenuId(null); }}
                      className="p-2 rounded-full bg-white/10 hover:bg-red-500 hover:text-white transition-all text-white hover:scale-110"
                      title="Remove Widget"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isMenuOpen && !widgetInstance.isLocked && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}
                    onPointerDown={(e) => e.stopPropagation()} 
                    onPan={(e, info) => {
                      const newW = Math.max(2, (widgetInstance.w || WidgetDef.defaultSize.w) + Math.round(info.offset.x / (GRID_SIZE + GRID_GAP)));
                      const newH = Math.max(2, (widgetInstance.h || WidgetDef.defaultSize.h) + Math.round(info.offset.y / (GRID_SIZE + GRID_GAP)));
                      setResizePreview({ id: widgetInstance.instanceId, w: newW, h: newH });
                    }}
                    onPanEnd={(e, info) => {
                      const newW = Math.max(2, (widgetInstance.w || WidgetDef.defaultSize.w) + Math.round(info.offset.x / (GRID_SIZE + GRID_GAP)));
                      const newH = Math.max(2, (widgetInstance.h || WidgetDef.defaultSize.h) + Math.round(info.offset.y / (GRID_SIZE + GRID_GAP)));
                      updateSize(widgetInstance.instanceId, newW, newH);
                      setResizePreview(null);
                    }}
                    className="absolute -bottom-3 -right-3 w-8 h-8 bg-[#52d9ff] border-2 border-black rounded-full flex items-center justify-center cursor-se-resize shadow-[0_0_15px_rgba(82,217,255,0.6)] z-[100] text-black hover:scale-110 transition-transform"
                    title="Drag to Resize"
                  >
                    <Maximize2 size={14} className="rotate-90" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* 🔮 EDIT PANEL MODAL SLIDER */}
      <AnimatePresence>
        {editingWidgetId && (
          <WidgetEditPanel instanceId={editingWidgetId} closePanel={() => setEditingWidgetId(null)} />
        )}
      </AnimatePresence>

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
                setEditingWidgetId(null);
                await syncToCloud(); 
              }}
              className="px-6 py-3 bg-[#52d9ff]/20 hover:bg-[#52d9ff]/30 text-[#52d9ff] border border-[#52d9ff]/30 backdrop-blur-xl rounded-full font-bold transition-all shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
            >
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGallery && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] max-h-[80vh] bg-[#0d0d12]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-[1000] flex flex-col overflow-hidden pointer-events-auto"
          >
             <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-[#8d6bff] to-[#52d9ff] text-white rounded-xl shadow-lg"><Layers size={20} /></div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                    Widget Gallery <Sparkles size={16} className="text-[#52d9ff]" />
                  </h2>
                  <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase mt-0.5">Live Interactive Previews</p>
                </div>
              </div>
              <button onClick={() => setShowGallery(false)} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors bg-black/20"><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 custom-scrollbar pb-10">
              {Object.values(SYSTEM_WIDGETS).map((widget) => {
                const wPx = (widget.defaultSize.w * GRID_SIZE) + ((widget.defaultSize.w - 1) * GRID_GAP);
                const hPx = (widget.defaultSize.h * GRID_SIZE) + ((widget.defaultSize.h - 1) * GRID_GAP);

                return (
                  <div key={widget.id} className="bg-white/5 border border-white/10 rounded-3xl p-4 hover:bg-white/10 hover:border-white/20 transition-all group flex flex-col gap-4 shadow-xl">
                    <div className="relative w-full h-40 bg-black/40 rounded-2xl overflow-hidden pointer-events-none border border-black/50 flex items-center justify-center shadow-inner group-hover:scale-[1.02] transition-transform duration-300">
                      <div style={{ width: wPx, height: hPx }} className="absolute scale-[0.6] origin-center">
                        <IsolatedWidgetWrapper widgetDef={widget} />
                      </div>
                    </div>

                    <div className="px-2 flex flex-col flex-1 justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-white text-lg tracking-wide group-hover:text-[#52d9ff] transition-colors">{widget.name}</h3>
                        <p className="text-xs text-gray-400 line-clamp-2 mt-1">{widget.description}</p>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-[10px] font-mono font-bold text-[#8d6bff] bg-[#8d6bff]/10 border border-[#8d6bff]/20 px-2.5 py-1.5 rounded-lg">
                          {widget.defaultSize.w}x{widget.defaultSize.h} GRID
                        </span>
                        <button 
                          onClick={() => { addWidget(widget.id); setShowGallery(false); }}
                          className="px-4 py-2 rounded-full bg-white/10 hover:bg-[#52d9ff] hover:text-black flex items-center gap-2 transition-all text-white font-bold text-xs hover:shadow-[0_0_20px_rgba(82,217,255,0.4)]"
                        >
                          <Plus size={14} strokeWidth={3} /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};