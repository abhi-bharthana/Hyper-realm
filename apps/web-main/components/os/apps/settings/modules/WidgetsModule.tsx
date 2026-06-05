'use client';

import React from 'react';
import { useWidgetStore } from '@/store/useWidgetStore'; 
import { useAppManager } from '@/store/useAppManager'; 
import { DownloadCloud, Zap, Layers, GripHorizontal } from 'lucide-react';
import { SYSTEM_WIDGETS } from '@/config/widgets.config'; 

// 🚀 Grid configuration for exact scaling
const GRID_SIZE = 80;
const GRID_GAP = 16;
const PREVIEW_SCALE = 0.55; // Widget ko 55% scale par render karenge

const IsolatedWidgetWrapper = ({ widgetDef }: { widgetDef: any }) => {
  if (!widgetDef || !widgetDef.render) return null;
  return <>{widgetDef.render({ vfs: {}, notification: {} })}</>;
};

// 🚀 Eye-pleasing Pill-Shaped Toggle Switch
const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
  <div 
    onClick={onChange}
    className={`relative w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-500 shadow-inner overflow-hidden ${
      checked ? 'bg-gradient-to-r from-[#52d9ff] to-[#8d6bff]' : 'bg-black/60 border border-white/10'
    }`}
  >
    {checked && <div className="absolute inset-0 bg-white/20 blur-md"></div>}
    <div 
      className={`relative z-10 bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-500 ease-out ${
        checked ? 'translate-x-6 scale-105' : 'translate-x-0'
      }`} 
    />
  </div>
);

export default function WidgetsModule() {
  const { activeWidgets, addWidget, removeWidget } = useWidgetStore();
  const { installedApps } = useAppManager();

  const appStoreWidgets = installedApps.map((appId) => ({
    id: `${appId}.widget`,
    name: `${appId.split('.').pop()} Module`,
    desc: 'Installed from App Store',
  }));

  const getActiveInstance = (widgetId: string) => {
    return activeWidgets.find((w) => w.widgetId === widgetId);
  };

  const handleToggle = (widgetId: string) => {
    const instance = getActiveInstance(widgetId);
    if (instance) {
      removeWidget(instance.instanceId); 
    } else {
      const startX = typeof window !== 'undefined' ? window.innerWidth / 2 - 100 : 100;
      addWidget(widgetId, startX, 100); 
    }
  };

  // 🚀 NATIVE DRAG AND DROP HANDLER
  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    e.dataTransfer.setData('application/hyper-widget', widgetId);
    e.dataTransfer.effectAllowed = 'copy';
    
    // Transparent drag image taaki maza aaye
    const dragGhost = document.createElement('div');
    dragGhost.style.opacity = '0';
    document.body.appendChild(dragGhost);
    e.dataTransfer.setDragImage(dragGhost, 0, 0);
    setTimeout(() => document.body.removeChild(dragGhost), 0);
  };

  return (
    <div className="p-8 text-white h-full overflow-y-auto space-y-10 pb-24 custom-scrollbar">
      
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
          <Zap size={28} className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            Widget Engine
          </h2>
          <p className="text-sm text-gray-400 font-medium mt-1">
            Drag to workspace or toggle to quick-add modules.
          </p>
        </div>
      </div>

      {/* ==========================================
          ⚙️ SYSTEM WIDGETS WITH PRECISE DYNAMIC SIZING
          ========================================== */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold tracking-widest uppercase text-gray-500 ml-2 flex items-center gap-2">
          <Layers size={14} /> Core System Modules
        </h3>
        
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
          {Object.values(SYSTEM_WIDGETS).map((widget) => {
            const isActive = !!getActiveInstance(widget.id);
            
            // 🚀 MAGIC: Exact widget sizing calculate ho rahi hai
            const wPx = (widget.defaultSize.w * GRID_SIZE) + ((widget.defaultSize.w - 1) * GRID_GAP);
            const hPx = (widget.defaultSize.h * GRID_SIZE) + ((widget.defaultSize.h - 1) * GRID_GAP);

            // Container size based on scale
            const previewWidth = wPx * PREVIEW_SCALE;
            const previewHeight = hPx * PREVIEW_SCALE;

            return (
              <div 
                key={widget.id} 
                className={`group flex flex-col p-4 bg-[#0d0d12]/60 backdrop-blur-2xl rounded-[2rem] border transition-all duration-300 shadow-xl ${isActive ? 'border-[#52d9ff]/40 bg-white/[0.04]' : 'border-white/5 hover:bg-white/5'}`}
              >
                
                {/* 🟢 EXACT SIZED DRAGGABLE LIVE PREVIEW */}
                <div className="w-full flex justify-center py-4">
                  <div 
                    draggable
                    onDragStart={(e) => handleDragStart(e, widget.id)}
                    style={{ width: previewWidth, height: previewHeight }}
                    className="relative bg-black/40 rounded-[1.5rem] overflow-hidden border border-white/10 flex items-center justify-center shadow-inner cursor-grab active:cursor-grabbing hover:scale-[1.05] hover:border-[#52d9ff]/50 transition-all duration-300 group/preview"
                  >
                    <div 
                      style={{ width: wPx, height: hPx, transform: `scale(${PREVIEW_SCALE})` }} 
                      className="absolute origin-center pointer-events-none"
                    >
                      <IsolatedWidgetWrapper widgetDef={widget} />
                    </div>

                    {/* Drag Overlay Hint */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 flex flex-col items-center justify-center transition-opacity duration-300 backdrop-blur-[2px]">
                      <GripHorizontal size={24} className="text-white mb-1" />
                      <p className="text-white text-[10px] font-bold tracking-widest uppercase">Drag Me</p>
                    </div>
                  </div>
                </div>

                {/* 📝 DETAILS & TOGGLE */}
                <div className="flex items-center justify-between mt-auto px-2 pt-2 border-t border-white/5">
                  <div>
                    <h3 className={`font-bold text-base tracking-wide transition-colors ${isActive ? 'text-[#52d9ff]' : 'text-gray-200'}`}>
                      {widget.name}
                    </h3>
                    <p className="text-[10px] text-gray-500">{widget.defaultSize.w}x{widget.defaultSize.h} GRID</p>
                  </div>
                  
                  <div className="pl-4">
                    <ToggleSwitch 
                      checked={isActive} 
                      onChange={() => handleToggle(widget.id)} 
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==========================================
          ☁️ APP STORE WIDGETS
          ========================================== */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold tracking-widest uppercase text-gray-500 ml-2 mt-8 flex items-center gap-2">
          <DownloadCloud size={14} /> Installed Modules
        </h3>
        
        {appStoreWidgets.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {appStoreWidgets.map((widget) => {
              const isActive = !!getActiveInstance(widget.id);
              return (
                <div 
                  key={widget.id} 
                  className={`group flex items-center justify-between p-4 bg-[#0d0d12]/60 backdrop-blur-2xl rounded-[1.5rem] border transition-all duration-300 shadow-xl ${isActive ? 'border-[#8d6bff]/50' : 'border-white/5 hover:bg-white/5'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 shadow-inner border border-white/5">
                      <DownloadCloud size={20} className="text-emerald-300" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white capitalize tracking-wide">{widget.name.replace(/_/g, ' ')}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{widget.desc}</p>
                    </div>
                  </div>
                  <ToggleSwitch checked={isActive} onChange={() => handleToggle(widget.id)} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 bg-[#0d0d12]/40 backdrop-blur-2xl rounded-[2rem] border border-white/5 flex flex-col items-center justify-center text-center shadow-inner">
            <div className="p-4 bg-white/5 rounded-full mb-3">
              <DownloadCloud size={32} className="text-gray-500" />
            </div>
            <p className="text-sm font-bold text-gray-300">No Third-Party Widgets</p>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              Open the App Store to download and install new widgets for your dashboard.
            </p>
          </div>
        )}
      </div>
      
    </div>
  );
}