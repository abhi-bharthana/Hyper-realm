import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { usePermissionStore } from './usePermissionStore'; // 🛡️ IMPORTED PERMISSION STORE

// ==========================================
// 📦 VFS TYPES
// ==========================================
export type FileType = 'file' | 'folder' | 'symlink';

export interface VFSNode {
  path: string;          // e.g., '/home/user/drive/photos'
  name: string;
  type: FileType;
  owner: string;         // 'system', 'user', or 'appId' (e.g., 'com.dev.weather')
  content?: string;      // Base64, text, or JSON stringified data
  size: number;          // Bytes
  createdAt: number;
  updatedAt: number;
  isReadOnly?: boolean;  // For system files
}

interface VFSState {
  // 🗄️ THE MASTER FILE TABLE (Flat structure for O(1) lookups)
  nodes: Record<string, VFSNode>;
  
  // 🛠️ SYSTEM INITIALIZATION
  initFileSystem: () => void;

  // 🔒 CORE SECURITY & SANDBOX HELPERS
  resolvePath: (appId: string, path: string) => string;
  hasPermission: (appId: string, path: string, intent: 'read' | 'write') => boolean;

  // 📂 VFS OPERATIONS (The Developer API Backend)
  readNode: (path: string, appId: string) => VFSNode | null;
  writeNode: (path: string, content: string, type: FileType, appId: string) => { success: boolean; error?: string };
  makeDir: (path: string, appId: string) => { success: boolean; error?: string };
  deleteNode: (path: string, appId: string) => { success: boolean; error?: string };
  
  // 🧹 CACHE MANAGEMENT
  clearAppCache: (appId: string) => void;
}

// ==========================================
// 🚀 THE VFS ENGINE
// ==========================================
export const useVFSStore = create<VFSState>()(
  persist(
    (set, get) => ({
      nodes: {},

      // 1. 🏗️ INIT: Format the Drive with Default Directories
      initFileSystem: () => {
        const { nodes } = get();
        if (nodes['/']) return; // Already formatted

        const now = Date.now();
        const defaultNodes: Record<string, VFSNode> = {
          '/': { path: '/', name: 'root', type: 'folder', owner: 'system', size: 0, createdAt: now, updatedAt: now, isReadOnly: true },
          '/system': { path: '/system', name: 'system', type: 'folder', owner: 'system', size: 0, createdAt: now, updatedAt: now, isReadOnly: true },
          '/apps': { path: '/apps', name: 'apps', type: 'folder', owner: 'system', size: 0, createdAt: now, updatedAt: now, isReadOnly: true },
          '/home': { path: '/home', name: 'home', type: 'folder', owner: 'system', size: 0, createdAt: now, updatedAt: now },
          '/home/user': { path: '/home/user', name: 'user', type: 'folder', owner: 'user', size: 0, createdAt: now, updatedAt: now },
          '/home/user/drive': { path: '/home/user/drive', name: 'drive', type: 'folder', owner: 'user', size: 0, createdAt: now, updatedAt: now },
          '/home/user/app_data': { path: '/home/user/app_data', name: 'app_data', type: 'folder', owner: 'system', size: 0, createdAt: now, updatedAt: now },
          '/home/user/cache': { path: '/home/user/cache', name: 'cache', type: 'folder', owner: 'system', size: 0, createdAt: now, updatedAt: now },
        };

        set({ nodes: defaultNodes });
        console.log("💾 Hyper-VFS: File System Initialized Successfully!");
      },

      // 2. 🛡️ PATH RESOLUTION (Sandbox Magic)
      resolvePath: (appId, path) => {
        if (appId === 'system' || appId === 'user') return path;
        
        if (path.startsWith('hyper://drive')) {
            return path.replace('hyper://drive', '/home/user/drive');
        }

        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        return `/home/user/app_data/${appId}/${cleanPath}`;
      },

      // 3. 🚨 ZERO-TRUST PERMISSION ENGINE (Fully Connected to Hyper-Shield)
      hasPermission: (appId, path, intent) => {
        if (appId === 'system') return true;
        
        const node = get().nodes[path];
        
        // Rule 1: Read-only system files
        if (node?.isReadOnly && intent === 'write') return false;

        // Rule 2: App Sandbox absolute authority
        if (path.startsWith(`/home/user/app_data/${appId}/`)) return true;
        if (path.startsWith(`/home/user/cache/${appId}/`)) return true;

        // Rule 3: User Drive access (Connected to Permission Engine)
        if (path.startsWith('/home/user/drive')) {
            const intentPerm = intent === 'read' ? 'storage:drive_read' : 'storage:drive_write';
            return usePermissionStore.getState().checkPermission(appId, intentPerm);
        }

        return false;
      },

      // 4. 📖 READ FILE
      readNode: (path, appId) => {
        const actualPath = get().resolvePath(appId, path);
        if (!get().hasPermission(appId, actualPath, 'read')) {
          console.error(`VFS: Access Denied. [${appId}] cannot read [${actualPath}]`);
          return null;
        }
        return get().nodes[actualPath] || null;
      },

      // 5. ✍️ WRITE FILE
      writeNode: (path, content, type, appId) => {
        const actualPath = get().resolvePath(appId, path);
        
        if (!get().hasPermission(appId, actualPath, 'write')) {
          return { success: false, error: 'Permission Denied: Sandboxed Environment' };
        }

        const now = Date.now();
        const parts = actualPath.split('/');
        const name = parts[parts.length - 1];
        const size = new Blob([content]).size;

        set((state) => ({
          nodes: {
            ...state.nodes,
            [actualPath]: {
              path: actualPath,
              name,
              type,
              owner: appId,
              content,
              size,
              createdAt: state.nodes[actualPath]?.createdAt || now,
              updatedAt: now,
            }
          }
        }));

        return { success: true };
      },

      // 6. 📁 MAKE DIRECTORY
      makeDir: (path, appId) => {
        return get().writeNode(path, '', 'folder', appId);
      },

      // 7. 🗑️ DELETE FILE/DIR
      deleteNode: (path, appId) => {
        const actualPath = get().resolvePath(appId, path);
        
        if (!get().hasPermission(appId, actualPath, 'write')) {
          return { success: false, error: 'Permission Denied' };
        }

        set((state) => {
          const newNodes = { ...state.nodes };
          Object.keys(newNodes).forEach(key => {
            if (key === actualPath || key.startsWith(`${actualPath}/`)) {
              delete newNodes[key];
            }
          });
          return { nodes: newNodes };
        });

        return { success: true };
      },

      // 8. 🧹 CACHE CLEARER
      clearAppCache: (appId: string) => {
        const cachePath = `/home/user/cache/${appId}`;
        set((state) => {
          const newNodes = { ...state.nodes };
          Object.keys(newNodes).forEach(key => {
            if (key.startsWith(`${cachePath}/`)) {
              delete newNodes[key];
            }
          });
          return { nodes: newNodes };
        });
      }
    }),
    {
      name: 'hyper-vfs-engine',
      skipHydration: true,
    }
  )
);