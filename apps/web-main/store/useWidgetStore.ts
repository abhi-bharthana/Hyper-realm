import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useVFSStore } from '@/store/useVFSStore'; 

export interface WidgetInstance {
  instanceId: string; 
  widgetId: string;   
  x: number;          
  y: number;          
  w: number;          
  h: number;          
  isLocked?: boolean; 
  config?: Record<string, any>; // 🚀 NAYA: Widget Settings Config Save Karne Ke Liye
}

interface WidgetStore {
  activeWidgets: WidgetInstance[];
  isEditMode: boolean; 
  setEditMode: (status: boolean) => void; 
  addWidget: (widgetId: string, x?: number, y?: number) => void;
  removeWidget: (instanceId: string) => void;
  updatePosition: (instanceId: string, x: number, y: number) => void;
  updateSize: (instanceId: string, w: number, h: number) => void;
  toggleLock: (instanceId: string) => void;
  
  // 🚀 NAYA: Panel se settings change karne ka function
  updateWidgetConfig: (instanceId: string, key: string, value: any) => void;

  syncFromCloud: (cloudData: WidgetInstance[]) => void;
  syncToCloud: () => Promise<void>; 
  fetchCloudWidgets: () => Promise<void>; 
}

// 🚀 VFS CONFIG PATH
const CONFIG_FILE_PATH = '/home/user/.config/hyper_widgets.json';
const CONFIG_DIR = '/home/user/.config';
let writeTimeout: NodeJS.Timeout;

export const useWidgetStore = create<WidgetStore>()(
  persist(
    (set, get) => ({
      activeWidgets: [
        { instanceId: 'w_clock_1', widgetId: 'com.system.clock', x: 20, y: 50, w: 2, h: 2, isLocked: false, config: {} }
      ],
      
      isEditMode: false,
      setEditMode: (status) => set({ isEditMode: status }),

      addWidget: (widgetId, x = 100, y = 100) => {
        const widgetRegistry = require('@/config/widgets.config').SYSTEM_WIDGETS;
        const widgetConfig = widgetRegistry[widgetId];
        
        const defaultW = widgetConfig?.defaultSize?.w || 2;
        const defaultH = widgetConfig?.defaultSize?.h || 2;

        const newWidget: WidgetInstance = {
          instanceId: `w_${Date.now()}`,
          widgetId,
          x, y,
          w: defaultW,
          h: defaultH,
          isLocked: false,
          config: {} // Blank config assign karo initially
        };
        
        set({ activeWidgets: [...get().activeWidgets, newWidget] });
        get().syncToCloud();
      },

      removeWidget: (instanceId) => {
        set({ activeWidgets: get().activeWidgets.filter(w => w.instanceId !== instanceId) });
        get().syncToCloud();
      },

      updatePosition: (instanceId, x, y) => {
        set({
          activeWidgets: get().activeWidgets.map(w => 
            w.instanceId === instanceId ? { ...w, x, y } : w
          )
        });
        get().syncToCloud();
      },

      updateSize: (instanceId, w, h) => {
        set({
          activeWidgets: get().activeWidgets.map(widget => 
            widget.instanceId === instanceId ? { ...widget, w, h } : widget
          )
        });
        get().syncToCloud(); 
      },

      toggleLock: (instanceId) => {
        set({
          activeWidgets: get().activeWidgets.map(widget => 
            widget.instanceId === instanceId ? { ...widget, isLocked: !widget.isLocked } : widget
          )
        });
        get().syncToCloud(); 
      },

      // 🚀 NAYA: EDIT PANEL SETTINGS SAVER
      updateWidgetConfig: (instanceId, key, value) => {
        set({
          activeWidgets: get().activeWidgets.map(widget => 
            widget.instanceId === instanceId 
              // Purani config ko preserve karke nayi key update maro
              ? { ...widget, config: { ...(widget.config || {}), [key]: value } } 
              : widget
          )
        });
        get().syncToCloud(); // VFS mein live dump karo
      },

      syncFromCloud: (cloudData) => {
        set({ activeWidgets: cloudData });
      },

      syncToCloud: async () => {
        if (writeTimeout) clearTimeout(writeTimeout);
        writeTimeout = setTimeout(() => {
          try {
            const vfs = useVFSStore.getState();
            if (!vfs.readNode(CONFIG_DIR, 'system')) {
              vfs.makeDir(CONFIG_DIR, 'system');
            }
            const currentWidgets = get().activeWidgets;
            vfs.writeNode(CONFIG_FILE_PATH, JSON.stringify(currentWidgets, null, 2), 'file', 'system');
            console.log('[Hyper OS] Widget settings safely written to Hyper Drive! 💾');
          } catch (err) {
            console.error('[Hyper OS] Failed to write widgets to Drive:', err);
          }
        }, 1000); 
      },

      fetchCloudWidgets: async () => {
        try {
          const vfs = useVFSStore.getState();
          const fileNode = vfs.readNode(CONFIG_FILE_PATH, 'system');
          
          if (fileNode && fileNode.content) {
            const savedWidgets = JSON.parse(fileNode.content);
            if (savedWidgets && savedWidgets.length > 0) {
              set({ activeWidgets: savedWidgets });
              console.log('[Hyper OS] Widgets hydrated from Hyper Drive! ⚡');
            }
          } else {
             if (!vfs.readNode(CONFIG_DIR, 'system')) {
                vfs.makeDir(CONFIG_DIR, 'system');
             }
             vfs.writeNode(CONFIG_FILE_PATH, JSON.stringify(get().activeWidgets, null, 2), 'file', 'system');
          }
        } catch (error) {
          console.error('[Hyper OS] Failed to load widgets on boot:', error);
        }
      }
    }),
    {
      name: 'hyper-widget-storage',
      skipHydration: true, 
    }
  )
);