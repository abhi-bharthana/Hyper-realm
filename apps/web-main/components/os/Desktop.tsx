'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 
import { useOSStore } from '@/store/useOSStore';
import { useUserStore } from '@/store/useUserStore'; 
import { useVFSStore } from '@/store/useVFSStore';
import { useWellbeingStore } from '@/store/useWellbeingStore'; 
import { useWidgetStore } from '@/store/useWidgetStore'; 
import { useAppManager } from '@/store/useAppManager'; 

import { Window } from '@/components/os/Window';
import { Dock } from '@/components/os/Dock';
import { ContextMenu } from '@/components/os/ContextMenu';
import { TopBar } from '@/components/os/TopBar';

// 🚀 NAYA: Launcher Import kiya
import { Launcher } from '@/components/os/Launcher';

// 🧩 IMPORTED WIDGET ENGINE
import { WidgetEngine } from '@/components/os/widgets/WidgetEngine';

// 🛡️ IMPORTED PERMISSION ENGINE
import { PermissionPrompt } from '@/components/os/PermissionPrompt';
// 🔔 IMPORTED NOTIFICATION ENGINE
import { NotificationOverlay } from '@/components/os/NotificationOverlay';

// 🚀 CENTRAL REGISTRY IMPORT
import { SYSTEM_APPS } from '@/config/apps.config';

export const Desktop = () => {
  const { windows, openApp } = useOSStore(); 
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 });
  const [isHydrated, setIsHydrated] = useState(false);
  
  // 🚀 NAYA: Launcher ka state
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);

  // User Matrix State
  const { preferences, fetchCloudState, isBooted } = useUserStore();
  
  const dockPos = preferences?.dockPosition || 'bottom';
  const autoHide = preferences?.dockAutoHide || false;
  const wallpaper = preferences?.wallpaper || 'default'; 

  // ==========================================
  // 1️⃣ OS BOOT & HYDRATION SEQUENCE
  // ==========================================
  useEffect(() => {
    useOSStore.persist.rehydrate();
    useUserStore.persist.rehydrate(); 
    useVFSStore.persist.rehydrate();
    useWellbeingStore.persist.rehydrate();
    useWidgetStore.persist.rehydrate();
    useAppManager.persist.rehydrate(); 
    
    fetchCloudState();
    useWellbeingStore.getState().syncWithCloud();
    useVFSStore.getState().initFileSystem();
    useWidgetStore.getState().fetchCloudWidgets();
    
    useAppManager.getState().mountInstalledApps();
    
    setIsHydrated(true);
  }, []); 

  // ==========================================
  // 🚀 NAYA: GLOBAL KEYBOARD SHORTCUTS
  // ==========================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Launcher on Ctrl + Space or Cmd + Space
      if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
        e.preventDefault();
        setIsLauncherOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ==========================================
  // 2️⃣ THE SILENT TELEMETRY DAEMON
  // ==========================================
  useEffect(() => {
    if (!isBooted) return; 

    const tickInterval = setInterval(() => {
      const { windows } = useOSStore.getState();
      const openApps = windows.filter(w => !w.isMinimized);
      
      const focusedApp = openApps.find(w => w.isFocused)?.appId || null;
      const backgroundApps = openApps.filter(w => !w.isFocused).map(w => w.appId);
      
      let combo = null;
      if (openApps.length > 1) {
        combo = openApps.map(w => w.appId).sort().join('+');
      }

      useWellbeingStore.getState().trackSmartTick({ focusedApp, backgroundApps, combo });
    }, 1000);

    const syncInterval = setInterval(() => {
      useWellbeingStore.getState().persistToCloud();
    }, 60000);

    return () => {
      clearInterval(tickInterval);
      clearInterval(syncInterval);
    };
  }, [isBooted]);

  // ==========================================
  // 3️⃣ DESKTOP EVENT HANDLERS
  // ==========================================
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const menuWidth = 224;
    const menuHeight = 200;
    
    let x = e.pageX;
    let y = e.pageY;

    if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 10;
    if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 10;

    setContextMenu({ show: true, x, y });
  };

  const closeContextMenu = () => {
    if (contextMenu.show) setContextMenu({ show: false, x: 0, y: 0 });
  };

  if (!isHydrated) return null;

  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-black select-none" 
      onContextMenu={handleContextMenu}
      onClick={closeContextMenu} 
    >
      
      {/* 🚀 BOOT SEQUENCE OVERLAY */}
      <AnimatePresence>
        {!isBooted && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 z-[99999] bg-[#030305] flex flex-col items-center justify-center pointer-events-auto"
          >
            <div className="w-24 h-24 border-t-2 border-[#52d9ff] border-r-2 border-[#8d6bff] rounded-full animate-spin mb-8" />
            <h1 className="text-white font-black text-3xl tracking-[0.3em] uppercase">Hyper<span className="text-[#52d9ff]">OS</span></h1>
            <p className="text-gray-500 text-[10px] font-mono mt-3 tracking-widest uppercase animate-pulse">Initializing Neural Matrix...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <PermissionPrompt />
      <NotificationOverlay />

      {/* 🎨 DYNAMIC WALLPAPER ENGINE */}
      {wallpaper === 'default' ? (
        <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-[#030305] to-[#12121a]">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8d6bff]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#52d9ff]/10 rounded-full blur-[120px]" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img src={wallpaper} alt="Desktop Wallpaper" className="w-full h-full object-cover opacity-90 transition-opacity duration-1000" />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" /> 
        </div>
      )}

      {/* 🧩 INJECTED THE WIDGET ENGINE HERE */}
      <WidgetEngine />

      {/* 🪄 MAC-STYLE TOP NAVIGATION */}
      <TopBar onFileClick={() => openApp('explorer', 'File Explorer')} />
      
      {/* ==========================================
          🪟 DYNAMIC WINDOW RENDERING SYSTEM
          ========================================== */}
      {/* 🚀 BUG FIX 1: Changed `top-7` to `top-0` to fix the double gap in snapped windows */}
      <div className="absolute top-0 bottom-0 left-0 right-0 z-10 pointer-events-none os-desktop-area">
        {windows.map((w) => {
          const AppDefinition = SYSTEM_APPS[w.appId];
          const AppComponent = AppDefinition?.component;

          return (
            <div key={w.id} className="pointer-events-auto">
              <Window id={w.id}>
                {AppComponent ? (
                  <div className="w-full h-full overflow-hidden">
                    <AppComponent />
                  </div>
                ) : (
                  <div className="flex flex-col h-full items-center justify-center bg-black/80 p-6 text-center text-white backdrop-blur-md">
                    <div className="text-[#ff5f56] mb-2 font-bold text-lg">⚠️ App Error</div>
                    <div className="text-sm text-gray-400">
                      The module <span className="text-white font-mono bg-white/10 px-1 rounded">'{w.appId}'</span> could not be loaded.
                    </div>
                  </div>
                )}
              </Window>
            </div>
          );
        })}
      </div>

      {/* ==========================================
          📱 DYNAMIC DOCK
          ========================================== */}
      {/* 🚀 BUG FIX 2: Removed `pointer-events-none` so mouse hover can be detected naturally. 
          Changed hidden state pixel calculations so 10px stays visible to catch the mouse. */}
      <div 
        className={`absolute z-[9999] flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          dockPos === 'bottom' 
            ? `bottom-0 left-1/2 -translate-x-1/2 pb-2 pt-12 px-6 ${autoHide ? 'translate-y-[calc(100%-10px)] hover:translate-y-0' : 'translate-y-0'}`
            : dockPos === 'left'
            ? `left-0 top-1/2 -translate-y-1/2 pl-2 pr-12 py-6 ${autoHide ? '-translate-x-[calc(100%-10px)] hover:translate-x-0' : 'translate-x-0'}`
            : dockPos === 'top'
            ? `top-7 left-1/2 -translate-x-1/2 pt-2 pb-12 px-6 ${autoHide ? '-translate-y-[calc(100%-10px)] hover:translate-y-0' : 'translate-y-0'}`
            : `right-0 top-1/2 -translate-y-1/2 pr-2 pl-12 py-6 ${autoHide ? 'translate-x-[calc(100%-10px)] hover:translate-x-0' : 'translate-x-0'}`
        }`}
      >
         <Dock />
      </div>

      {/* 🚀 NAYA: LAUNCHPAD RENDERER */}
      <Launcher isOpen={isLauncherOpen} onClose={() => setIsLauncherOpen(false)} />
      
      <ContextMenu x={contextMenu.x} y={contextMenu.y} isOpen={contextMenu.show} onClose={() => setContextMenu({ ...contextMenu, show: false })} />
    </div>
  );
};