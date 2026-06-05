'use client';

import React from 'react';
import { useOSStore } from '@/store/useOSStore';
import { TopBar } from '@/components/os/TopBar';
import { DesktopDock } from '@/components/os/desktop/DesktopDock';
import { Launcher } from '@/components/os/Launcher';
import { ContextMenu } from '@/components/os/ContextMenu';
import { NotificationOverlay } from '@/components/os/NotificationOverlay';
import { PermissionPrompt } from '@/components/os/PermissionPrompt';

export const SystemUI = ({ events }: { events: any }) => {
  const { openApp } = useOSStore(); 

  return (
    <>
      {/* MAC-STYLE NAVIGATION */}
      <TopBar onFileClick={() => openApp('explorer', 'File Explorer')} />
      <DesktopDock />
      <Launcher isOpen={events.isLauncherOpen} onClose={() => events.setIsLauncherOpen(false)} />
      
      {/* FLOATING OVERLAYS */}
      <ContextMenu 
        x={events.contextMenu.x} 
        y={events.contextMenu.y} 
        isOpen={events.contextMenu.show} 
        onClose={() => events.setContextMenu({ ...events.contextMenu, show: false })} 
      />
      <NotificationOverlay />
      <PermissionPrompt />
    </>
  );
};