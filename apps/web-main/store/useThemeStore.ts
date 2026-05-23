import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: string;
  isMagicPillVisible: boolean;
  pillPosition: { x: number; y: number };
  isSettingsOpen: boolean;
  // Dashboard Component Visibility
  showClock: boolean;
  showNews: boolean;
  
  setTheme: (t: string) => Promise<void>;
  setPillPosition: (pos: { x: number; y: number }) => void;
  toggleMagicPill: () => void;
  toggleSettings: () => void;
  
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
      showClock: true,  // Default: On
      showNews: true,   // Default: On

      // Shared function to update cloud settings
      persistToCloud: async (updates: Partial<ThemeState>) => {
        const token = localStorage.getItem("hyper_id_token");
        if (!token) return;

        const current = get();
        try {
          await fetch("http://localhost:8081/api/v1/settings", {
            method: "POST",
            headers: { 
              "Authorization": `Bearer ${token}`, 
              "Content-Type": "application/json" 
            },
            body: JSON.stringify({ 
              theme: updates.theme ?? current.theme, 
              isMagicPillVisible: updates.isMagicPillVisible ?? current.isMagicPillVisible, 
              pillX: current.pillPosition.x, 
              pillY: current.pillPosition.y,
              showClock: updates.showClock ?? current.showClock,
              showNews: updates.showNews ?? current.showNews
            })
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

      syncWithCloud: async () => {
        const token = localStorage.getItem("hyper_id_token");
        if (!token) return;

        try {
          const res = await fetch("http://localhost:8081/api/v1/settings", {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            set({ 
              theme: data.theme || 'dark-green', 
              isMagicPillVisible: data.isMagicPillVisible ?? true, 
              pillPosition: { x: data.pillX ?? 20, y: data.pillY ?? 20 },
              showClock: data.showClock ?? true,
              showNews: data.showNews ?? true
            });
          }
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
      }),
    }
  )
);