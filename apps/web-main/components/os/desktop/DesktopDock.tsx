'use client';

import React from 'react';
import { Dock } from '@/components/os/Dock';
import { useUserStore } from '@/store/useUserStore';

export const DesktopDock = () => {
  const { preferences } = useUserStore();
  
  const dockPos = preferences?.dockPosition || 'bottom';
  const autoHide = preferences?.dockAutoHide || false;

  return (
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
  );
};