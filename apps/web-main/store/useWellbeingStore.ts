import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, API_URLS } from '@/lib/api'; 

export interface WellbeingState {
  totalOnlineTime: number; // in seconds
  appUsage: Record<string, number>; // App ID -> Seconds Used
  
  incrementTime: (activeApps: string[]) => void;
  syncWithCloud: () => Promise<void>;
  persistToCloud: () => Promise<void>;
}

export const useWellbeingStore = create<WellbeingState>()(
  persist(
    (set, get) => ({
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

      // ☁️ CLOUD ACTIONS
      syncWithCloud: async () => {
        try {
          // 🚀 FIX YAHAN HAI: "/os/wellbeing" kar diya
          const data = await api.get(`${API_URLS.OS}/os/wellbeing`);
          if (data && data.status !== "not_found") {
            set({
              totalOnlineTime: data.totalOnlineTime || 0,
              appUsage: data.appUsage || {}
            });
            console.log("✅ Wellbeing Data synced from secure DB!");
          }
        } catch (err) {
          console.warn("⚠️ Wellbeing cloud sync failed, using local vault", err);
        }
      },

      persistToCloud: async () => {
        try {
          const { totalOnlineTime, appUsage } = get();
          // 🚀 FIX YAHAN BHI HAI: "/os/wellbeing" kar diya
          await api.post(`${API_URLS.OS}/os/wellbeing`, {
            totalOnlineTime,
            appUsage
          });
        } catch (err) {
          console.error("❌ Wellbeing DB save failed", err);
        }
      }
    }),
    {
      name: 'hyper-wellbeing-data',
      skipHydration: true, 
    }
  )
);