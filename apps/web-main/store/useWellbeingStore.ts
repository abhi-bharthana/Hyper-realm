import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, API_URLS } from '@/lib/api';

export interface AppUsageStats {
  activeTime: number;     // focused seconds
  backgroundTime: number; // unfocused seconds
  launchCount: number;    // exact number of times app was opened
}

interface WellbeingState {
  realScreenTime: number; // True active time in seconds
  appUsage: Record<string, AppUsageStats>;
  appCombos: Record<string, number>; // E.g., { "canvas+explorer": 120 }
  
  // Actions
  registerAppLaunch: (appId: string) => void; // 🚀 NAYA: To track actual app opens
  trackSmartTick: (data: { focusedApp: string | null; backgroundApps: string[]; combo: string | null }) => void;
  syncWithCloud: () => Promise<void>;
  persistToCloud: () => Promise<void>;
}

export const useWellbeingStore = create<WellbeingState>()(
  persist(
    (set, get) => ({
      realScreenTime: 0,
      appUsage: {},
      appCombos: {},

      // 1️⃣ 🚀 ACCURATE LAUNCH TRACKER (Trigger this when an app window is spawned)
      registerAppLaunch: (appId) => {
        set((state) => {
          const newUsage = { ...state.appUsage };
          if (!newUsage[appId]) {
            newUsage[appId] = { activeTime: 0, backgroundTime: 0, launchCount: 1 };
          } else {
            newUsage[appId] = { ...newUsage[appId], launchCount: newUsage[appId].launchCount + 1 };
          }
          return { appUsage: newUsage };
        });
      },

      // 2️⃣ ⏱️ THE SMART 1-SECOND ENGINE
      trackSmartTick: ({ focusedApp, backgroundApps, combo }) => {
        set((state) => {
          const newUsage = { ...state.appUsage };
          const newCombos = { ...state.appCombos };

          // Helper to safely initialize app in state if missing
          const initApp = (appId: string) => {
            if (!newUsage[appId]) {
              newUsage[appId] = { activeTime: 0, backgroundTime: 0, launchCount: 0 }; // 0 cuz launch handled by registerAppLaunch
            }
          };

          // Track Focused App
          if (focusedApp) {
            initApp(focusedApp);
            newUsage[focusedApp] = { ...newUsage[focusedApp], activeTime: newUsage[focusedApp].activeTime + 1 };
          }

          // Track Background Apps
          backgroundApps.forEach(appId => {
            initApp(appId);
            newUsage[appId] = { ...newUsage[appId], backgroundTime: newUsage[appId].backgroundTime + 1 };
          });

          // Track Combinations (Only if multiple apps exist)
          if (combo) {
            newCombos[combo] = (newCombos[combo] || 0) + 1;
          }

          // 🛡️ SMART LOGIC: Only increment total screen time if OS is actively rendering apps
          const isScreenActive = focusedApp !== null || backgroundApps.length > 0;

          return {
            realScreenTime: isScreenActive ? state.realScreenTime + 1 : state.realScreenTime,
            appUsage: newUsage,
            appCombos: newCombos
          };
        });
      },

      // 3️⃣ ☁️ FETCH FROM POSTGRES DB
      syncWithCloud: async () => {
        try {
          const data = await api.get(`${API_URLS.OS}/os/wellbeing`);
          
          if (data && !data.status) { 
             set({ 
               // 🛡️ TAMPER PROOF: DB se kam value aayi toh local (higher) value use hogi
               realScreenTime: Math.max(get().realScreenTime, data.realScreenTime || 0), 
               appUsage: data.appUsage || {},
               appCombos: data.appCombos || {}
             }); 
             console.log("✅ Digital Wellbeing telemetry synced from cloud!");
          }
        } catch (err: any) {
          if (err.message && err.message.includes("not_found")) {
            console.log("ℹ️ Wellbeing Tracker: No previous footprint found. Initializing Matrix!");
          } else {
            console.warn("⚠️ Wellbeing sync deferred (Network unverified)", err);
          }
        }
      },

      // 4️⃣ 📡 PUSH TO POSTGRES DB
      persistToCloud: async () => {
        try {
          const { realScreenTime, appUsage, appCombos } = get();
          await api.post(`${API_URLS.OS}/os/wellbeing/telemetry`, {
             realScreenTime,
             appUsage,
             appCombos
          });
        } catch (err) {
          console.error("❌ Failed to push telemetry to Matrix", err);
        }
      }
    }),
    {
      name: 'hyper-wellbeing-storage',
      skipHydration: true,
    }
  )
);