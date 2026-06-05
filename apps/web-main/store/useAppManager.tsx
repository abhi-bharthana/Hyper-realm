import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import React from 'react';
import { usePermissionStore, PermissionType } from './usePermissionStore';
import { useVFSStore } from './useVFSStore';
import { SYSTEM_APPS } from '@/config/apps.config'; 
// 🚀 FIXED: Emojis ki jagah real Lucide React components use kar rahe hain
import { CloudSun, Music } from 'lucide-react'; 

export const CLOUD_APPS_DB = [
  {
    id: 'com.dev.weather',
    name: 'Weather Now',
    author: 'Hyper Devs',
    description: 'Real-time weather tracking with drive export capabilities.',
    icon: CloudSun, // 🚀 Fixed Icon
    color: '#f97316', // Orange Hex
    permissions: ['notifications', 'storage:drive_write'] as PermissionType[],
    size: '1.2 MB'
  },
  {
    id: 'com.dev.spotify_lite',
    name: 'Hyper Music',
    author: 'Audio Corp',
    description: 'Stream lofi beats while you code. Needs background network access.',
    icon: Music, // 🚀 Fixed Icon
    color: '#22c55e', // Green Hex
    permissions: ['network:outbound'] as PermissionType[],
    size: '3.4 MB'
  }
];

interface AppManagerState {
  installedApps: string[]; 
  isInstalling: string | null; 
  installApp: (appId: string) => Promise<boolean>;
  uninstallApp: (appId: string) => void;
  mountInstalledApps: () => void; 
}

export const useAppManager = create<AppManagerState>()(
  persist(
    (set, get) => ({
      installedApps: [],
      isInstalling: null,

      installApp: async (appId: string) => {
        const app = CLOUD_APPS_DB.find(a => a.id === appId);
        if (!app) return false;

        set({ isInstalling: appId });

        for (const perm of app.permissions) {
          const granted = await usePermissionStore.getState().requestPermission(
            app.id, 
            app.name, 
            perm, 
            `Required for installation to function properly.`
          );
          
          if (!granted) {
            console.warn(`[AppManager] Installation aborted: User denied ${perm}`);
            set({ isInstalling: null });
            return false; 
          }
        }

        console.log(`[AppManager] Permissions granted. Building Sandbox for ${app.name}...`);
        const vfs = useVFSStore.getState();
        vfs.makeDir(`/home/user/app_data/${app.id}`, 'system');
        vfs.makeDir(`/home/user/cache/${app.id}`, 'system');

        await new Promise(resolve => setTimeout(resolve, 2000));

        // 🚀 FIXED: Dynamic component mein JSX icon securely render kiya
        SYSTEM_APPS[app.id] = {
          id: app.id,
          name: app.name,
          icon: app.icon, // Lucide Component pass kiya OS registry ko
          defaultWidth: 800,
          defaultHeight: 500,
          isSystem: false,
          component: () => {
            const AppIcon = app.icon; // JSX Tag mapping
            return (
              <div className={`w-full h-full flex flex-col items-center justify-center bg-black/90 text-white p-10 font-sans border-t-4`} style={{ borderTopColor: app.color }}>
                <div className="mb-6 animate-bounce" style={{ color: app.color }}>
                  <AppIcon size={64} />
                </div>
                <h1 className="text-3xl font-black mb-2">{app.name}</h1>
                <p className="text-gray-400 font-mono text-sm mb-8">{app.id} • v1.0.0</p>
                <div className="bg-white/10 p-4 rounded-xl border border-white/20 text-center max-w-md">
                  <p className="font-bold uppercase tracking-widest text-xs mb-2" style={{ color: app.color }}>.Realm Package Executed</p>
                  <p className="text-sm">This app was dynamically injected into the Hyper-OS Matrix at runtime. Sandbox created successfully.</p>
                </div>
              </div>
            );
          }
        };

        set((state) => ({
          installedApps: [...new Set([...state.installedApps, appId])],
          isInstalling: null
        }));

        console.log(`✅ [AppManager] ${app.name} installed successfully!`);
        return true;
      },

      uninstallApp: (appId: string) => {
        const vfs = useVFSStore.getState();
        vfs.deleteNode(`/home/user/app_data/${appId}`, 'system');
        vfs.deleteNode(`/home/user/cache/${appId}`, 'system');

        const perms = usePermissionStore.getState().appPermissions[appId] || {};
        Object.keys(perms).forEach(perm => {
           usePermissionStore.getState().revokePermission(appId, perm as PermissionType);
        });

        delete SYSTEM_APPS[appId];

        set((state) => ({
          installedApps: state.installedApps.filter(id => id !== appId)
        }));
        
        console.log(`[Realm Injector] Purged ${appId} from the system completely.`);
      },

      mountInstalledApps: () => {
        const { installedApps } = get();
        installedApps.forEach(appId => {
          const app = CLOUD_APPS_DB.find(a => a.id === appId);
          if (app && !SYSTEM_APPS[appId]) {
            SYSTEM_APPS[app.id] = {
              id: app.id,
              name: app.name,
              icon: app.icon, // Lucide Component
              defaultWidth: 800,
              defaultHeight: 500,
              isSystem: false,
              component: () => {
                const AppIcon = app.icon;
                return (
                  <div className={`w-full h-full flex flex-col items-center justify-center bg-black/90 text-white p-10 font-sans border-t-4`} style={{ borderTopColor: app.color }}>
                    <div className="mb-6" style={{ color: app.color }}>
                      <AppIcon size={64} />
                    </div>
                    <h1 className="text-3xl font-black mb-2">{app.name}</h1>
                    <div className="bg-white/10 p-4 rounded-xl border border-white/20 text-center mt-4">
                       <p className="text-green-400 font-bold uppercase tracking-widest text-xs mb-1">Restored from Memory</p>
                    </div>
                  </div>
                );
              }
            };
          }
        });
        console.log(`[Realm Injector] Boot Hydration complete. ${installedApps.length} apps mounted.`);
      }
    }),
    {
      name: 'hyper-app-manager',
      skipHydration: true, 
    }
  )
);