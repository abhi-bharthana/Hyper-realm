'use client';

import React from 'react';

// 🚀 CUSTOM HOOKS
import { useSystemHydration } from '@/components/os/desktop/useSystemHydration';
import { useDesktopEvents } from '@/components/os/desktop/useDesktopEvents';

// 🚀 MODULAR OS LAYERS
import { BootOverlay } from '@/components/os/desktop/BootOverlay';
import { TelemetryDaemon } from '@/components/os/desktop/TelemetryDaemon';
import { WallpaperEngine } from '@/components/os/desktop/WallpaperEngine';
import { WindowManager } from '@/components/os/desktop/WindowManager';
import { WidgetEngine } from '@/components/os/widgets/WidgetEngine';
import { SystemUI } from '@/components/os/desktop/SystemUI';

export const Desktop = () => {
  // 1. Logic Controllers
  const { isHydrated, isBooted } = useSystemHydration();
  const events = useDesktopEvents();

  if (!isHydrated) return null;

  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-black select-none" 
      onContextMenu={events.handleContextMenu}
      onClick={events.closeContextMenu} 
      onDragOver={events.handleDragOver} 
      onDrop={events.handleDrop}         
    >
      {/* 👻 INVISIBLE DAEMONS */}
      <TelemetryDaemon isBooted={isBooted} />
      
      {/* 🖼️ BACKGROUND LAYER */}
      <WallpaperEngine />
      
      {/* 🧩 WIDGET LAYER */}
      <WidgetEngine />
      
      {/* 🪟 ACTIVE APPLICATIONS LAYER */}
      <WindowManager />
      
      {/* 🧭 NAVIGATION & SYSTEM UI LAYER */}
      <SystemUI events={events} />

      {/* 🛡️ SECURITY / BOOT LAYER (Always on top) */}
      <BootOverlay isBooted={isBooted} />
    </div>
  );
};