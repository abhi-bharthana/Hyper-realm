'use client';

import { useEffect } from 'react';
import { useOSStore } from '@/store/useOSStore';
import { useWellbeingStore } from '@/store/useWellbeingStore'; 

export const TelemetryDaemon = ({ isBooted }: { isBooted: boolean }) => {
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

  return null; 
};