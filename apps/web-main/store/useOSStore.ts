import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, API_URLS } from '@/lib/api'; 
import { SYSTEM_APPS } from '@/config/apps.config'; // 👈 Central Registry Import

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
  pinnedToDock: string[]; // 👈 NEW: Cloud-synced pinned dock apps
  pinnedToStart: string[]; // 👈 NEW: Cloud-synced pinned start menu apps
}

interface OSStore {
  windows: WindowState[];
  activeZIndex: number;
  recentApps: string[]; // 👈 NAYA: Track recent apps
  
  // ☁️ Cloud Synced States
  profile: OSProfile;
  preferences: OSPreferences;

  // Window Actions 
  openApp: (appId: string, title?: string) => void;
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
      recentApps: [], // 👈 Initialize empty array
      
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
        // 📌 Default pinned apps IDs
        pinnedToDock: ['explorer', 'terminal', 'notes', 'canvas', 'taskmanager', 'calculator', 'settings'],
        pinnedToStart: ['explorer', 'settings', 'canvas', 'calculator'],
      },

// ==========================================
      // 🪟 WINDOW MANAGEMENT LOGIC 
      // ==========================================
      openApp: (appId, title) => {
        const { windows, recentApps, focusWindow } = get();
        const existingWindow = windows.find((w) => w.appId === appId);

        // 🚀 Recent apps logic
        const updatedRecents = [appId, ...recentApps.filter(id => id !== appId)].slice(0, 6);

        if (existingWindow) {
          // Agar app pehle se open hai, usko unminimize karo aur normal focus laga do
          set((state) => ({
            recentApps: updatedRecents,
            windows: state.windows.map((w) =>
              w.appId === appId ? { ...w, isMinimized: false } : w
            ),
          }));
          focusWindow(existingWindow.id); // 👈 Re-using our smart focus logic
          return;
        }

        // 🚀 Fetch config dynamically from Central Registry
        const appDefinition = SYSTEM_APPS[appId];
        const config = appDefinition?.config || { width: 800, height: 600 };
        const windowTitle = title || appDefinition?.name || 'Unknown App';
        
        const newWindow: WindowState = {
          id: `${appId}-${Date.now()}`,
          appId,
          title: windowTitle,
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          x: typeof window !== 'undefined' ? (window.innerWidth - config.width) / 2 + (Math.random() * 40 - 20) : 50,
          y: typeof window !== 'undefined' ? (window.innerHeight - config.height) / 2 + (Math.random() * 40 - 20) : 50,
          width: config.width,
          height: config.height,
          zIndex: 9999, // Temp zIndex, normalization aage handle karega
        };

        // 🚀 Z-INDEX NORMALIZATION FOR NEW APP
        const baseZIndex = 10;
        const allWindows = [...windows, newWindow].sort((a, b) => a.zIndex - b.zIndex);
        const updatedWindows = allWindows.map((w, index) => ({
          ...w,
          zIndex: baseZIndex + index,
        }));

        set({
          windows: updatedWindows,
          activeZIndex: baseZIndex + updatedWindows.length - 1,
          recentApps: updatedRecents, 
        });
      },

      closeWindow: (id) => set((state) => ({ windows: state.windows.filter((w) => w.id !== id) })),
      minimizeWindow: (id) => set((state) => ({ windows: state.windows.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)) })),
      toggleMaximize: (id) => set((state) => ({ windows: state.windows.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)) })),
      
      focusWindow: (id) => {
        const { windows, activeZIndex } = get();
        const target = windows.find(w => w.id === id);
        
        // Agar target window exist nahi karti, ya already top par hai toh fालतू re-render roko
        if (!target || target.zIndex === activeZIndex) return;
        
        // 🚀 Z-INDEX NORMALIZATION LOGIC (The Magic Trick 🎩)
        // 1. Target window ko chhod kar baaki sabko current z-index ke hisaab se sort kar lo
        const otherWindows = windows.filter(w => w.id !== id).sort((a, b) => a.zIndex - b.zIndex);
        
        // 2. Target window ko array ke sabse end me daalo (taaki wo top par aaye)
        const reorderedWindows = [...otherWindows, target];
        
        // 3. Sabko tightly pack kar do wapas 10 se start karke (10, 11, 12, 13...)
        const baseZIndex = 10;
        const updatedWindows = reorderedWindows.map((w, index) => ({
          ...w,
          zIndex: baseZIndex + index,
        }));

        set({
          windows: updatedWindows,
          activeZIndex: baseZIndex + updatedWindows.length - 1,
        });
      },
      updateWindowBounds: (id, bounds) => {
        set((state) => ({
          windows: state.windows.map((w) => (w.id === id ? { ...w, ...bounds } : w)),
        }));
      },
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
      
      // 🚀 F5 (REFRESH) FIX: Persistence logic
      partialize: (state) => ({ 
        windows: state.windows,
        activeZIndex: state.activeZIndex,
        profile: state.profile,
        preferences: state.preferences, // 👈 pinnedToDock wagera sab ab automatically yahan se save/load hoga
        recentApps: state.recentApps // 👈 Isko localStorage mein save hone de taaki reload pe na ude
      }),
    }
  )
);