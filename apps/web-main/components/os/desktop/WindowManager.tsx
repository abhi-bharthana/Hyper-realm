'use client';

import React from 'react';
import { useOSStore } from '@/store/useOSStore';
import { SYSTEM_APPS } from '@/config/apps.config';
import { Window } from '@/components/os/Window';

export const WindowManager = () => {
  const { windows } = useOSStore(); 

  return (
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
  );
};