'use client';

import { useState, useEffect } from 'react';
import { useOSStore } from '@/store/useOSStore';
import { useUserStore } from '@/store/useUserStore'; 
import { useVFSStore } from '@/store/useVFSStore';
import { useWellbeingStore } from '@/store/useWellbeingStore'; 
import { useWidgetStore } from '@/store/useWidgetStore'; 
import { useAppManager } from '@/store/useAppManager'; 

export const useSystemHydration = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const { fetchCloudState, isBooted } = useUserStore();

  useEffect(() => {
    // 1. Rehydrate all persist stores
    useOSStore.persist.rehydrate();
    useUserStore.persist.rehydrate(); 
    useVFSStore.persist.rehydrate();
    useWellbeingStore.persist.rehydrate();
    useWidgetStore.persist.rehydrate();
    useAppManager.persist.rehydrate(); 
    
    // 2. Fire Boot Sequences
    fetchCloudState();
    useWellbeingStore.getState().syncWithCloud();
    useVFSStore.getState().initFileSystem();
    useWidgetStore.getState().fetchCloudWidgets();
    useAppManager.getState().mountInstalledApps();
    
    setIsHydrated(true);
  }, [fetchCloudState]);

  return { isHydrated, isBooted };
};