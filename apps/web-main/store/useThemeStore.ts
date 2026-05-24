import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, API_URLS } from '@/lib/api'; // Naya centralized API client import kiya

interface ThemeState {
  theme: string;
  isMagicPillVisible: boolean;
  pillPosition: { x: number; y: number };
  
  // UI Panels State
  isSettingsOpen: boolean;
  isDiscoverOpen: boolean; // <-- NAYA: Discover panel ka state
  
  // Dashboard Component Visibility
  showClock: boolean;
  showNews: boolean;
  
  setTheme: (t: string) => Promise<void>;
  setPillPosition: (pos: { x: number; y: number }) => void;
  toggleMagicPill: () => void;
  
  // Toggles
  toggleSettings: () => void;
  toggleDiscover: () => void; // <-- NAYA: Discover panel toggle karne ka function
  
  // Dashboard Control Actions
  setShowClock: (val: boolean) => Promise<void>;
  setShowNews: (val: boolean) => Promise<void>;
  
  syncWithCloud: () => Promise<void>; 
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark-green',
      isMagicPillVisible: true,
      pillPosition: { x: 20, y: 20 },
      isSettingsOpen: false,
      isDiscoverOpen: false, // <-- NAYA: By default panel band rahega
      showClock: true,  // Default: On
      showNews: true,   // Default: On

      // Shared function to update cloud settings
      persistToCloud: async (updates: Partial<ThemeState>) => {
        const current = get();
        try {
          // Token aur Headers ab 'api' client khud inject karega
          await api.post(`${API_URLS.HUB}/settings`, {
            theme: updates.theme ?? current.theme, 
            isMagicPillVisible: updates.isMagicPillVisible ?? current.isMagicPillVisible, 
            pillX: current.pillPosition.x, 
            pillY: current.pillPosition.y,
            showClock: updates.showClock ?? current.showClock,
            showNews: updates.showNews ?? current.showNews
          });
        } catch (err) {
          console.error("Cloud update failed", err);
        }
      },

      setTheme: async (theme) => {
        set({ theme });
        await get().persistToCloud({ theme });
      },

      setShowClock: async (showClock) => {
        set({ showClock });
        await get().persistToCloud({ showClock });
      },

      setShowNews: async (showNews) => {
        set({ showNews });
        await get().persistToCloud({ showNews });
      },

      setPillPosition: (pillPosition) => set({ pillPosition }),

      toggleMagicPill: () => set((state) => {
        const newState = !state.isMagicPillVisible;
        get().persistToCloud({ isMagicPillVisible: newState });
        return { isMagicPillVisible: newState };
      }),

      toggleSettings: () => set((state) => ({ 
        isSettingsOpen: !state.isSettingsOpen 
      })),

      // <-- NAYA: Discover panel toggle logic
      toggleDiscover: () => set((state) => ({ 
        isDiscoverOpen: !state.isDiscoverOpen 
      })),

      syncWithCloud: async () => {
        try {
          // Direct api.get call lagai, localstorage fetch karne ki zaroorat nahi
          const data = await api.get(`${API_URLS.HUB}/settings`);
          
          set({ 
            theme: data.theme || 'dark-green', 
            isMagicPillVisible: data.isMagicPillVisible ?? true, 
            pillPosition: { x: data.pillX ?? 20, y: data.pillY ?? 20 },
            showClock: data.showClock ?? true,
            showNews: data.showNews ?? true
          });
        } catch (err) {
          console.error("Cloud sync failed", err);
        }
      }
    }),
    { 
      name: 'hyper-realm-storage',
      partialize: (state) => ({ 
        theme: state.theme, 
        isMagicPillVisible: state.isMagicPillVisible, 
        pillPosition: state.pillPosition,
        showClock: state.showClock,
        showNews: state.showNews
        // NOTE: isSettingsOpen aur isDiscoverOpen ko partialize mein nahi dala
        // Taaki page refresh hone par panels hamesha close mode (default) se start ho.
      }),
    }
  )
);