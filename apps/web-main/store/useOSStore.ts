import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // 👈 Magic Import

const APP_CONFIGS: Record<string, { width: number; height: number }> = {
  explorer: { width: 1050, height: 700 },
  terminal: { width: 750, height: 450 },
  notes: { width: 900, height: 600 },
  canvas: { width: 1100, height: 750 },
  settings: { width: 600, height: 500 },
  taskmanager: { width: 600, height: 400 }, // 👈 Task Manager ka size
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

interface OSStore {
  windows: WindowState[];
  activeZIndex: number;
  openApp: (appId: string, title: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowBounds: (id: string, bounds: Partial<WindowState>) => void;
}

export const useOSStore = create<OSStore>()(
  // 💾 STATE PERSISTENCE: Ye browser ke localStorage mein save karega
  persist(
    (set, get) => ({
      windows: [],
      activeZIndex: 10,

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
        const initialWidth = config.width;
        const initialHeight = config.height;
        
        const newWindow: WindowState = {
          id: `${appId}-${Date.now()}`,
          appId,
          title,
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          x: typeof window !== 'undefined' ? (window.innerWidth - initialWidth) / 2 + (Math.random() * 40 - 20) : 50,
          y: typeof window !== 'undefined' ? (window.innerHeight - initialHeight) / 2 + (Math.random() * 40 - 20) : 50,
          width: initialWidth,
          height: initialHeight,
          zIndex: activeZIndex + 1,
        };

        set({
          windows: [...windows, newWindow],
          activeZIndex: activeZIndex + 1,
        });
      },

      closeWindow: (id) =>
        set((state) => ({ windows: state.windows.filter((w) => w.id !== id) })),

      minimizeWindow: (id) =>
        set((state) => ({
          windows: state.windows.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)),
        })),

      toggleMaximize: (id) =>
        set((state) => ({
          windows: state.windows.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)),
        })),

      focusWindow: (id) => {
        const { activeZIndex, windows } = get();
        const target = windows.find(w => w.id === id);
        if (target?.zIndex === activeZIndex) return;
        
        set((state) => ({
          activeZIndex: activeZIndex + 1,
          windows: state.windows.map((w) => (w.id === id ? { ...w, zIndex: activeZIndex + 1 } : w)),
        }));
      },

      updateWindowBounds: (id, bounds) =>
        set((state) => ({
          windows: state.windows.map((w) => (w.id === id ? { ...w, ...bounds } : w)),
        })),
    }),
    {
      name: 'hyper-os-windows', // Local Storage mein is naam se save hoga
      // Custom storage check for Next.js SSR
      skipHydration: true, // Hydration mismatch rokne ke liye
    }
  )
);