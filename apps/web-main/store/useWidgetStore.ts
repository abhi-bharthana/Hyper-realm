import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WidgetInstance {
  instanceId: string; 
  widgetId: string;   
  x: number;          
  y: number;          
  w: number;          
  h: number;          
}

interface WidgetStore {
  activeWidgets: WidgetInstance[];
  isEditMode: boolean; 
  setEditMode: (status: boolean) => void; 
  addWidget: (widgetId: string, x?: number, y?: number) => void;
  removeWidget: (instanceId: string) => void;
  updatePosition: (instanceId: string, x: number, y: number) => void;
  syncFromCloud: (cloudData: WidgetInstance[]) => void;
  syncToCloud: () => Promise<void>; 
  fetchCloudWidgets: () => Promise<void>; // 🚀 NAYA: Fetch hook
}

export const useWidgetStore = create<WidgetStore>()(
  persist(
    (set, get) => ({
      activeWidgets: [
        { instanceId: 'w_clock_1', widgetId: 'com.system.clock', x: 20, y: 50, w: 2, h: 2 },
        { instanceId: 'w_img_1', widgetId: 'com.dev.dailyimage', x: 20, y: 220, w: 4, h: 2 }
      ],
      
      isEditMode: false,
      setEditMode: (status) => set({ isEditMode: status }),

      addWidget: (widgetId, x = 100, y = 100) => {
        const { defaultSize } = require('@/config/widgets.config').SYSTEM_WIDGETS[widgetId];
        const newWidget: WidgetInstance = {
          instanceId: `w_${Date.now()}`,
          widgetId,
          x, y,
          w: defaultSize.w,
          h: defaultSize.h,
        };
        set({ activeWidgets: [...get().activeWidgets, newWidget] });
      },

      removeWidget: (instanceId) => {
        set({ activeWidgets: get().activeWidgets.filter(w => w.instanceId !== instanceId) });
      },

      updatePosition: (instanceId, x, y) => {
        set({
          activeWidgets: get().activeWidgets.map(w => 
            w.instanceId === instanceId ? { ...w, x, y } : w
          )
        });
      },

      syncFromCloud: (cloudData) => {
        set({ activeWidgets: cloudData });
      },

      syncToCloud: async () => {
        try {
          const currentWidgets = get().activeWidgets;
          const response = await fetch('http://localhost:4000/api/v1/os/widgets/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('hyper_token') || 'test-token'}` 
            },
            body: JSON.stringify({ widgets: currentWidgets }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Cloud sync failed');
          }
          console.log('[Hyper Cloud] Widgets successfully synced to Database! ☁️');
        } catch (error) {
          console.error('[Hyper Cloud] Failed to sync widgets:', error);
        }
      },

      // ☁️ 🚀 THE BOOT HYDRATION ENGINE
      fetchCloudWidgets: async () => {
        try {
          const response = await fetch('http://localhost:4000/api/v1/os/widgets', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('hyper_token') || 'test-token'}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            // Agar DB mein widgets hain, toh local state ko unse replace kar do
            if (data.widgets && data.widgets.length > 0) {
              set({ activeWidgets: data.widgets });
              console.log('[Hyper Cloud] Widgets hydrated from Database! ⚡');
            }
          }
        } catch (error) {
          console.error('[Hyper Cloud] Failed to fetch widgets on boot:', error);
        }
      }
    }),
    {
      name: 'hyper-widget-storage',
    }
  )
);