import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, API_URLS } from '@/lib/api'; 

interface ThemeState {
  theme: string;
  isMagicPillVisible: boolean;
  pillPosition: { x: number; y: number };
  
  // UI Panels State
  isSettingsOpen: boolean;
  isDiscoverOpen: boolean; 
  
  // Dashboard Component Visibility
  showClock: boolean;
  showNews: boolean;

  // ==========================================
  // 🎨 HYPER-CANVAS STATE (For Navbar Transformation)
  // ==========================================
  isCanvasMode: boolean;
  canvasTitle: string;
  canvasSaveStatus: string;
  
  // 🚀 ACTION TRIGGERS
  forceSaveTrigger: number; 
  forceShareTrigger: number;  // NAYA: Share button click track karne ke liye
  forceDeleteTrigger: number; // NAYA: Delete button click track karne ke liye
  
  setTheme: (t: string) => Promise<void>;
  setPillPosition: (pos: { x: number; y: number }) => void;
  toggleMagicPill: () => void;
  
  // Toggles
  toggleSettings: () => void;
  toggleDiscover: () => void; 
  
  // Dashboard Control Actions
  setShowClock: (val: boolean) => Promise<void>;
  setShowNews: (val: boolean) => Promise<void>;
  
  // Canvas Actions
  setCanvasMode: (isMode: boolean) => void;
  setCanvasTitle: (title: string) => void;
  setCanvasSaveStatus: (status: string) => void;
  
  // 🚀 TRIGGER DISPATCHERS
  triggerCanvasSave: () => void; 
  triggerCanvasShare: () => void;  // NAYA
  triggerCanvasDelete: () => void; // NAYA

  syncWithCloud: () => Promise<void>; 
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark-green',
      isMagicPillVisible: true,
      pillPosition: { x: 20, y: 20 },
      isSettingsOpen: false,
      isDiscoverOpen: false, 
      showClock: true,  
      showNews: true,   

      // Canvas Defaults
      isCanvasMode: false,
      canvasTitle: "Untitled Node",
      canvasSaveStatus: "Saved",
      
      forceSaveTrigger: 0, 
      forceShareTrigger: 0,  // Default state 0
      forceDeleteTrigger: 0, // Default state 0

      // Shared function to update cloud settings
      persistToCloud: async (updates: Partial<ThemeState>) => {
        const current = get();
        try {
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

      toggleDiscover: () => set((state) => ({ 
        isDiscoverOpen: !state.isDiscoverOpen 
      })),

      // 🚀 Canvas Setters
      setCanvasMode: (isMode) => set({ isCanvasMode: isMode }),
      setCanvasTitle: (title) => set({ canvasTitle: title }),
      setCanvasSaveStatus: (status) => set({ canvasSaveStatus: status }),
      
      // 🚀 Action Triggers
      triggerCanvasSave: () => set((state) => ({ forceSaveTrigger: state.forceSaveTrigger + 1 })),
      triggerCanvasShare: () => set((state) => ({ forceShareTrigger: state.forceShareTrigger + 1 })),
      triggerCanvasDelete: () => set((state) => ({ forceDeleteTrigger: state.forceDeleteTrigger + 1 })),

      syncWithCloud: async () => {
        try {
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
        // NOTE: isCanvasMode, canvasTitle, triggers aadi local storage mein persist NAHI honge 
        // taaki refresh pe ye clean state se start hon.
      }),
    }
  )
);