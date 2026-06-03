'use client';

import { useEffect } from 'react';
import { useWellbeingStore } from '@/store/useWellbeingStore';
import { useOSStore } from '@/store/useOSStore';

export const WellbeingTracker = () => {
  useEffect(() => {
    // Rehydrate local storage data
    useWellbeingStore.persist.rehydrate();

    // The Background Daemon Loop (Runs every 1 second)
    const interval = setInterval(() => {
      // Check if User is connected to the Internet
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        
        // Fetch currently running apps from the OS Task Manager
        const windows = useOSStore.getState().windows;
        
        // Get IDs of apps that are open and NOT minimized
        const activeApps = windows
          .filter(w => !w.isMinimized)
          .map(w => w.appId);

        // Send to Store
        useWellbeingStore.getState().incrementTime(activeApps);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return null; // This is a headless component, it renders nothing!
};