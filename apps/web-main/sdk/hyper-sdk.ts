import { useVFSStore } from '@/store/useVFSStore';
import { usePermissionStore, PermissionType } from '@/store/usePermissionStore';
import { useOSStore } from '@/store/useOSStore';
import { useNotificationStore } from '@/store/useNotificationStore'; // 🔔 IMPORTED TOAST ENGINE

// ==========================================
// 📦 SDK TYPES FOR DEVELOPERS
// ==========================================
export interface RealmAPI {
  id: string;
  permissions: {
    request: (permission: PermissionType, justification: string) => Promise<boolean>;
    check: (permission: PermissionType) => boolean;
  };
  fs: {
    read: (path: string) => Promise<string | null>;
    write: (path: string, content: string) => Promise<boolean>;
    makeDir: (path: string) => Promise<boolean>;
  };
  kv: { 
    // Key-Value local storage built ON TOP of the VFS Sandbox!
    set: (key: string, value: any) => Promise<boolean>;
    get: (key: string) => Promise<any>;
  };
  window: {
    resize: (width: number, height: number) => void;
    close: () => void;
  };
  notification: {
    show: (title: string, message: string) => void;
  };
}

export interface AppConfig {
  id: string;
  name: string;
  version: string;
  permissions: PermissionType[];
  setup?: (api: RealmAPI) => void; // Background tasks when app installs/boots
  render: (api: RealmAPI) => React.ReactNode; // UI Component (Gets API as prop)
}

// ==========================================
// 🚀 THE MAGIC WRAPPER (defineApp)
// ==========================================
export const defineApp = (config: AppConfig) => {
  
  // 🛡️ API OBJECT INJECTION (OS binds this dynamically to the app)
  const api: RealmAPI = {
    id: config.id,
    
    // 🛑 1. PERMISSIONS
    permissions: {
      request: async (perm, justification) => {
        return await usePermissionStore.getState().requestPermission(config.id, config.name, perm, justification);
      },
      check: (perm) => {
        return usePermissionStore.getState().checkPermission(config.id, perm);
      }
    },

    // 📁 2. VIRTUAL FILE SYSTEM
    fs: {
      read: async (path) => {
        const node = useVFSStore.getState().readNode(path, config.id);
        return node && node.content ? node.content : null;
      },
      write: async (path, content) => {
        const res = useVFSStore.getState().writeNode(path, content, 'file', config.id);
        if (!res.success) console.error(`[${config.name}] FS Error: ${res.error}`);
        return res.success;
      },
      makeDir: async (path) => {
         const res = useVFSStore.getState().makeDir(path, config.id);
         return res.success;
      }
    },

    // 🔑 3. KEY-VALUE STORE (Sandboxed to app_data)
    kv: {
      set: async (key, value) => {
         const kvPath = `/home/user/app_data/${config.id}/kv.json`;
         const store = useVFSStore.getState();
         let data: Record<string, any> = {};
         
         const existingNode = store.readNode(kvPath, config.id);
         if (existingNode && existingNode.content) {
            try { data = JSON.parse(existingNode.content); } catch {}
         }
         
         data[key] = value;
         const res = store.writeNode(kvPath, JSON.stringify(data), 'file', config.id);
         return res.success;
      },
      get: async (key) => {
         const kvPath = `/home/user/app_data/${config.id}/kv.json`;
         const existingNode = useVFSStore.getState().readNode(kvPath, config.id);
         if (!existingNode || !existingNode.content) return null;
         try {
            const data = JSON.parse(existingNode.content);
            return data[key] ?? null;
         } catch { return null; }
      }
    },

    // 🪟 4. WINDOW MANAGEMENT
    window: {
      resize: (width, height) => {
        const os = useOSStore.getState();
        const win = os.windows.find(w => w.appId === config.id);
        if (win) os.updateWindowBounds(win.id, { width, height });
      },
      close: () => {
        const os = useOSStore.getState();
        const win = os.windows.find(w => w.appId === config.id);
        if (win) os.closeWindow(win.id);
      }
    },

    // 🔔 5. NOTIFICATIONS (Fully connected with OS Engine)
    notification: {
       show: (title, message) => {
         const hasPerm = usePermissionStore.getState().checkPermission(config.id, 'notifications');
         if (hasPerm) {
             useNotificationStore.getState().notify({
                 title,
                 message,
                 appName: config.name
             });
         } else {
             console.warn(`[${config.id}] Blocked: Notification permission denied. Run api.permissions.request() first.`);
         }
       }
    }
  };

  // Run initial setup if dev provided it
  if (config.setup) {
    config.setup(api);
  }

  // Return the packaged app for the App Registry
  return {
    ...config,
    component: () => config.render(api), // Bind API to the React component!
  };
};