import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 🛡️ AVAILABLE PERMISSIONS IN HYPER-REALM
export type PermissionType = 
  | 'storage:drive_read' 
  | 'storage:drive_write'
  | 'notifications'
  | 'network:outbound'
  | 'system:wallpaper';

export interface PermissionRequest {
  id: string;
  appId: string;
  appName: string;
  permission: PermissionType;
  justification: string; // Dev ko batana padega ki permission kyu chahiye
}

interface PermissionState {
  // 🗄️ Record of granted/denied permissions: { "com.weather.app": { "notifications": true, "storage:drive_write": false } }
  appPermissions: Record<string, Record<string, boolean>>;
  
  // 🚨 Queue for prompts waiting for user action
  pendingRequests: PermissionRequest[];

  // 🛠️ ENGINE ACTIONS
  requestPermission: (appId: string, appName: string, permission: PermissionType, justification: string) => Promise<boolean>;
  grantPermission: (requestId: string) => void;
  denyPermission: (requestId: string) => void;
  checkPermission: (appId: string, permission: PermissionType) => boolean;
  revokePermission: (appId: string, permission: PermissionType) => void;
  
  // 🎛️ NEW: TOGGLE PERMISSION (For Settings App)
  togglePermission: (appId: string, permission: PermissionType, isGranted: boolean) => void;
}

export const usePermissionStore = create<PermissionState>()(
  persist(
    (set, get) => ({
      appPermissions: {},
      pendingRequests: [],

      // 1. 🛑 APP REQUESTS PERMISSION
      requestPermission: async (appId, appName, permission, justification) => {
        // Agar pehle se granted ya denied hai, toh wahi return kar do
        const existing = get().appPermissions[appId]?.[permission];
        if (existing !== undefined) return existing;

        // Agar queue mein pehle se hai, toh ignore karo
        if (get().pendingRequests.some(req => req.appId === appId && req.permission === permission)) {
           return false; // Pending
        }

        // Promise banayenge taaki SDK await kar sake jab tak user click na kare!
        return new Promise((resolve) => {
          const requestId = `${appId}-${permission}-${Date.now()}`;
          
          set((state) => ({
            pendingRequests: [
              ...state.pendingRequests,
              { id: requestId, appId, appName, permission, justification }
            ]
          }));

          // 🧠 GOD LEVEL TRICK: Hum ek listener laga rahe hain jo state change hone par resolve karega
          const unsubscribe = usePermissionStore.subscribe((state) => {
            const result = state.appPermissions[appId]?.[permission];
            if (result !== undefined) {
              resolve(result);
              unsubscribe(); // Cleanup memory
            }
          });
        });
      },

      // 2. ✅ USER CLICKS ALLOW
      grantPermission: (requestId) => {
        const req = get().pendingRequests.find(r => r.id === requestId);
        if (!req) return;

        set((state) => ({
          appPermissions: {
            ...state.appPermissions,
            [req.appId]: { ...(state.appPermissions[req.appId] || {}), [req.permission]: true }
          },
          pendingRequests: state.pendingRequests.filter(r => r.id !== requestId)
        }));
      },

      // 3. ❌ USER CLICKS DENY
      denyPermission: (requestId) => {
        const req = get().pendingRequests.find(r => r.id === requestId);
        if (!req) return;

        set((state) => ({
          appPermissions: {
            ...state.appPermissions,
            [req.appId]: { ...(state.appPermissions[req.appId] || {}), [req.permission]: false }
          },
          pendingRequests: state.pendingRequests.filter(r => r.id !== requestId)
        }));
      },

      // 4. 🔍 SYNCHRONOUS CHECK (For VFS & Background Tasks)
      checkPermission: (appId, permission) => {
        if (appId === 'system') return true; // OS has god mode
        return !!get().appPermissions[appId]?.[permission]; // defaults to false
      },

      // 5. 🗑️ REVOKE
      revokePermission: (appId, permission) => {
        set((state) => {
          const updatedAppPerms = { ...state.appPermissions[appId] };
          delete updatedAppPerms[permission];
          return {
            appPermissions: { ...state.appPermissions, [appId]: updatedAppPerms }
          };
        });
      },

      // 6. 🎛️ TOGGLE PERMISSION (Directly switch true/false from Settings App)
      togglePermission: (appId, permission, isGranted) => {
        set((state) => ({
          appPermissions: {
            ...state.appPermissions,
            [appId]: {
              ...(state.appPermissions[appId] || {}),
              [permission]: isGranted
            }
          }
        }));
      }
    }),
    {
      name: 'hyper-shield-permissions',
      skipHydration: true,
      partialize: (state) => ({ appPermissions: state.appPermissions }) // Save only decisions, not pending prompts
    }
  )
);