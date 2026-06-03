'use client';

import { useEffect } from 'react';
import { useWellbeingStore } from '@/store/useWellbeingStore';
import { useOSStore } from '@/store/useOSStore';

export const WellbeingTracker = () => {
  useEffect(() => {
    // 1. Rehydrate & Sync on Boot
    useWellbeingStore.persist.rehydrate();
    useWellbeingStore.getState().syncWithCloud();

    let tick = 0; // Local counter for DB pushes

    // 2. The Daemon Loop (1 Sec)
    const interval = setInterval(() => {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        
        const windows = useOSStore.getState().windows;
        const activeApps = windows
          .filter(w => !w.isMinimized)
          .map(w => w.appId);

        // Increment locally (instant UI update)
        useWellbeingStore.getState().incrementTime(activeApps);
        
        tick++;
        
        // Push securely to Database every 60 seconds
        if (tick >= 60) {
           useWellbeingStore.getState().persistToCloud();
           tick = 0; // Reset counter
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return null; 
};