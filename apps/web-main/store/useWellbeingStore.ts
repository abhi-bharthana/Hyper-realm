import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WellbeingState {
  totalOnlineTime: number; // in seconds
  appUsage: Record<string, number>; // App ID -> Seconds Used
  incrementTime: (activeApps: string[]) => void;
  resetData: () => void;
}

export const useWellbeingStore = create<WellbeingState>()(
  persist(
    (set) => ({
      totalOnlineTime: 0,
      appUsage: {},
      
      incrementTime: (activeApps) => set((state) => {
        const newUsage = { ...state.appUsage };
        activeApps.forEach(app => {
          newUsage[app] = (newUsage[app] || 0) + 1;
        });
        return { 
          totalOnlineTime: state.totalOnlineTime + 1, 
          appUsage: newUsage 
        };
      }),

      resetData: () => set({ totalOnlineTime: 0, appUsage: {} })
    }),
    {
      name: 'hyper-wellbeing-data',
      skipHydration: true,
    }
  )
);