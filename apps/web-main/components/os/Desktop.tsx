'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic'; 
import { useOSStore } from '@/store/useOSStore';
import { useUserStore } from '@/store/useUserStore'; 
import { Window } from '@/components/os/Window';
import { Dock } from '@/components/os/Dock';
import { ContextMenu } from '@/components/os/ContextMenu';
import { TopBar } from '@/components/os/TopBar';
import { TaskManager } from '@/components/os/apps/TaskManager'; 
import { SettingsApp } from '@/components/os/apps/SettingsApp';
import CalculatorApp from '@/components/os/apps/CalculatorApp'; 
import { NeuralCanvasApp } from '@/components/os/apps/NeuralCanvasApp'; 
import { WellbeingTracker } from '@/components/os/WellbeingTracker'; // 👈 Wellbeing Tracker Import Kiya

const DriveDashboard = dynamic(
  () => import('@/components/Drive/DriveDashboard').then((mod) => mod.DriveDashboard),
  { ssr: false, loading: () => <div className="p-4 text-white/50 flex h-full items-center justify-center">Loading VFS Core...</div> }
);

export const Desktop = () => {
  const { windows, openApp } = useOSStore(); 
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 });
  const [isHydrated, setIsHydrated] = useState(false);

  // 🚀 YAHAN fetchCloudState BHI NIKAL LIYA
  const { preferences, fetchCloudState } = useUserStore();
  
  const dockPos = preferences?.dockPosition || 'bottom';
  const autoHide = preferences?.dockAutoHide || false;
  const wallpaper = preferences?.wallpaper || 'default'; 

  useEffect(() => {
    // 1. Local Storage rehydrate karo pehle
    useOSStore.persist.rehydrate();
    useUserStore.persist.rehydrate(); 
    
    // 2. 🚀 THE MAGIC: OS load hote hi seedha Go Backend se fresh data uthao!
    fetchCloudState();
    
    setIsHydrated(true);
  }, [fetchCloudState]); // Dependency add kardi taaki react warning na de

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

  if (!isHydrated) return null;

  return (
    <div className="relative w-full h-full overflow-hidden bg-black" onContextMenu={handleContextMenu}>
      
      {/* 🚀 INVISIBLE DAEMON RUNNING IN BACKGROUND */}
      <WellbeingTracker /> 

      {wallpaper === 'default' ? (
        <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-[#030305] to-[#12121a]">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8d6bff]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#52d9ff]/10 rounded-full blur-[120px]" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img src={wallpaper} alt="Desktop Wallpaper" className="w-full h-full object-cover opacity-90 transition-opacity duration-1000" />
          <div className="absolute inset-0 bg-black/30" /> 
        </div>
      )}

      <TopBar onFileClick={() => openApp('explorer', 'File Explorer')} />
      
      <div className="absolute top-7 bottom-0 left-0 right-0 z-10 pointer-events-none os-desktop-area">
        {windows.map((w) => (
          <div key={w.id} className="pointer-events-auto">
            <Window id={w.id}>
              {w.appId === 'explorer' && <div className="w-full h-full overflow-hidden"><DriveDashboard isOSMode={true} /></div>}
              {w.appId === 'taskmanager' && <TaskManager />}
              {w.appId === 'terminal' && <div className="p-4 text-green-400 font-mono">root@hyper-realm:~# _</div>}
              {w.appId === 'notes' && <div className="p-4 text-white">Note-Mate Editor Load Hoga...</div>}
              {w.appId === 'canvas' && <NeuralCanvasApp />} 
              {w.appId === 'settings' && <SettingsApp />}
              {w.appId === 'calculator' && <CalculatorApp />} 
            </Window>
          </div>
        ))}
      </div>

      <div 
        className={`absolute z-[9999] flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          dockPos === 'bottom' 
            ? `bottom-0 left-1/2 -translate-x-1/2 pb-4 pt-10 px-20 ${autoHide ? 'translate-y-[calc(100%-8px)] hover:translate-y-0' : 'translate-y-0'}`
            : dockPos === 'left'
            ? `left-0 top-1/2 -translate-y-1/2 pl-4 pr-10 py-20 ${autoHide ? '-translate-x-[calc(100%-8px)] hover:translate-x-0' : 'translate-x-0'}`
            : `right-0 top-1/2 -translate-y-1/2 pr-4 pl-10 py-20 ${autoHide ? 'translate-x-[calc(100%-8px)] hover:translate-x-0' : 'translate-x-0'}`
        }`}
      >
         <Dock />
      </div>

      <ContextMenu x={contextMenu.x} y={contextMenu.y} isOpen={contextMenu.show} onClose={() => setContextMenu({ ...contextMenu, show: false })} />
    </div>
  );
};