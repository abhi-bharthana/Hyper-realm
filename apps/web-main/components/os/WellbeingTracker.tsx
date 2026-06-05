'use client';

import { useEffect, useRef } from 'react';
import { useWellbeingStore } from '@/store/useWellbeingStore';
import { useOSStore } from '@/store/useOSStore';

export const WellbeingTracker = () => {
  // 🚀 IDLE DETECTION TRACKER (User AFK hai ya nahi)
  const lastActivity = useRef(Date.now());
  const IDLE_THRESHOLD = 2 * 60 * 1000; // 2 minutes (120,000 ms)

  useEffect(() => {
    // 1. Rehydrate & Sync on Boot
    useWellbeingStore.persist.rehydrate();
    useWellbeingStore.getState().syncWithCloud();

    // 2. Activity Listeners for Idle Detection
    const updateActivity = () => { lastActivity.current = Date.now(); };
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);

    let tick = 0; // Local counter for DB pushes

    // 3. The Smart Daemon Loop (1 Sec)
    const interval = setInterval(() => {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        
        // Check if user is actually at the screen
        const isIdle = (Date.now() - lastActivity.current) > IDLE_THRESHOLD;
        
        if (!isIdle) {
          const windows = useOSStore.getState().windows;
          const openWindows = windows.filter(w => !w.isMinimized);

          let focusedAppId = null;
          let backgroundAppIds: string[] = [];
          let combo = '';

          if (openWindows.length > 0) {
            // 🎯 FIND THE FOCUSED APP (Highest Z-Index)
            const focusedWindow = openWindows.reduce((prev, current) => 
              (prev.zIndex > current.zIndex) ? prev : current
            );
            
            focusedAppId = focusedWindow.appId;
            
            // 🎯 BACKGROUND APPS
            backgroundAppIds = openWindows
              .filter(w => w.id !== focusedWindow.id)
              .map(w => w.appId);

            // 🎯 APP COMBINATIONS (Sorted alphabetically e.g., "canvas+explorer")
            combo = [...new Set(openWindows.map(w => w.appId))].sort().join('+');
          }

          // 🚀 SEND SMART TICK TO ZUSTAND STORE
          useWellbeingStore.getState().trackSmartTick({
            focusedApp: focusedAppId,
            backgroundApps: backgroundAppIds,
            combo: combo
          });
        }
        
        tick++;
        
        // Push securely to Database every 60 seconds
        if (tick >= 60) {
           useWellbeingStore.getState().persistToCloud();
           tick = 0; // Reset counter
        }
      }
    }, 1000);

    // Cleanup phase
    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
    };
  }, []);

  return null; 
};