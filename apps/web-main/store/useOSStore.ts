import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, API_URLS } from '@/lib/api'; // 👈 API module import for Cloud Sync

const APP_CONFIGS: Record<string, { width: number; height: number }> = {
  explorer: { width: 1050, height: 700 },
  terminal: { width: 750, height: 450 },
  notes: { width: 900, height: 600 },
  canvas: { width: 1100, height: 750 },
  settings: { width: 600, height: 500 },
  taskmanager: { width: 600, height: 400 },
  calculator: { width: 380, height: 600 }, // 👈 Calculator App Add Kiya
  default: { width: 800, height: 600 }
};

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  x: number;
  y: number;
  width: number | string;
  height: number | string;
  zIndex: number;
}

export interface OSProfile {
  name: string;
  nickname: string;
  username: string;
  avatarUrl: string;
  bio: string;
}

export interface OSPreferences {
  dockPosition: string;
  dockAutoHide: boolean;
  wallpaper: string;
}

interface OSStore {
  windows: WindowState[];
  activeZIndex: number;
  
  // ☁️ Cloud Synced States
  profile: OSProfile;
  preferences: OSPreferences;

  // Window Actions 
  openApp: (appId: string, title: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowBounds: (id: string, bounds: Partial<WindowState>) => void;
  
  // ☁️ Cloud Actions
  updatePreference: (key: keyof OSPreferences, value: any) => Promise<void>;
  updateProfile: (profileData: Partial<OSProfile>) => Promise<void>;
  persistToCloud: (profile: OSProfile, preferences: OSPreferences) => Promise<void>;
  syncWithCloud: () => Promise<void>;
}

export const useOSStore = create<OSStore>()(
  persist(
    (set, get) => ({
      windows: [],
      activeZIndex: 10,
      
      // Default Fallback State
      profile: {
        name: 'Hyper User',
        nickname: 'Admin',
        username: 'admin',
        avatarUrl: '/images/default-male.png',
        bio: 'Welcome to Hyper-Realm',
      },
      preferences: {
        dockPosition: 'bottom',
        dockAutoHide: false,
        wallpaper: 'default-hyper.jpg',
      },

      // ==========================================
      // 🪟 WINDOW MANAGEMENT LOGIC 
      // ==========================================
      openApp: (appId, title) => {
        const { windows, activeZIndex } = get();
        const existingWindow = windows.find((w) => w.appId === appId);

        if (existingWindow) {
          set({
            activeZIndex: activeZIndex + 1,
            windows: windows.map((w) =>
              w.appId === appId ? { ...w, isMinimized: false, zIndex: activeZIndex + 1 } : w
            ),
          });
          return;
        }

        const config = APP_CONFIGS[appId] || APP_CONFIGS.default;
        
        const newWindow: WindowState = {
          id: `${appId}-${Date.now()}`,
          appId,
          title,
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          x: typeof window !== 'undefined' ? (window.innerWidth - config.width) / 2 + (Math.random() * 40 - 20) : 50,
          y: typeof window !== 'undefined' ? (window.innerHeight - config.height) / 2 + (Math.random() * 40 - 20) : 50,
          width: config.width,
          height: config.height,
          zIndex: activeZIndex + 1,
        };

        set({
          windows: [...windows, newWindow],
          activeZIndex: activeZIndex + 1,
        });
      },

      closeWindow: (id) => set((state) => ({ windows: state.windows.filter((w) => w.id !== id) })),
      minimizeWindow: (id) => set((state) => ({ windows: state.windows.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)) })),
      toggleMaximize: (id) => set((state) => ({ windows: state.windows.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)) })),
      
      focusWindow: (id) => {
        const { activeZIndex, windows } = get();
        const target = windows.find(w => w.id === id);
        if (target?.zIndex === activeZIndex) return;
        
        set((state) => ({
          activeZIndex: activeZIndex + 1,
          windows: state.windows.map((w) => (w.id === id ? { ...w, zIndex: activeZIndex + 1 } : w)),
        }));
      },

      updateWindowBounds: (id, bounds) => set((state) => ({ windows: state.windows.map((w) => (w.id === id ? { ...w, ...bounds } : w)) })),

      // ==========================================
      // ☁️ CLOUD SYNC & PERSISTENCE LOGIC
      // ==========================================
      updatePreference: async (key, value) => {
        const { profile, preferences } = get();
        const newPrefs = { ...preferences, [key]: value };
        
        set({ preferences: newPrefs });
        await get().persistToCloud(profile, newPrefs);
      },

      updateProfile: async (profileUpdates) => {
        const { profile, preferences } = get();
        const newProfile = { ...profile, ...profileUpdates };
        
        set({ profile: newProfile });
        await get().persistToCloud(newProfile, preferences);
      },

      persistToCloud: async (profile, preferences) => {
        try {
          await api.post(`${API_URLS.OS}/os`, {
            profile,
            preferences
          });
        } catch (err) {
          console.error("❌ OS State cloud sync failed", err);
        }
      },

      syncWithCloud: async () => {
        try {
          const data = await api.get(`${API_URLS.OS}/os`);
          
          if (data && data.status !== "not_found") {
            set((state) => ({
              profile: { ...state.profile, ...data.profile },
              preferences: { ...state.preferences, ...data.preferences },
            }));
            console.log("✅ OS State successfully synced from Hyper-Realm Cloud!");
          }
        } catch (err) {
          console.warn("⚠️ Could not fetch OS state, relying on local storage", err);
        }
      }
    }),
    {
      name: 'hyper-os-windows',
      skipHydration: true,
      
      // 🚀 F5 (REFRESH) FIX: windows aur activeZIndex ko localStorage mein save hone diya.
      partialize: (state) => ({ 
        windows: state.windows,
        activeZIndex: state.activeZIndex,
        profile: state.profile,
        preferences: state.preferences
      }),
    }
  )
);