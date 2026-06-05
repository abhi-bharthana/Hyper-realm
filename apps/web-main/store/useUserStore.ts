import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, API_URLS } from '@/lib/api';
import { useVFSStore } from './useVFSStore'; // 🚀 IMPORTED VFS STORE

export interface UserProfile {
  name: string;
  nickname: string;
  username: string;
  avatarUrl: string;
  bio: string; 
  gender: string;
}

export interface SystemPreferences {
  dockPosition: 'bottom' | 'left' | 'right' | 'top'; 
  dockAutoHide: boolean;
  wallpaper: string; 
  wallpaperBlur: number; 
  wallpaperDim: number;  
  dynamicWallpaper: boolean; // 🚀 NAYA: Dynamic Wallpaper Toggle State
}

interface UserStore {
  profile: UserProfile;
  preferences: SystemPreferences;
  isBooted: boolean; 

  updateProfile: (updates: Partial<UserProfile>) => void;
  updatePreferences: (updates: Partial<SystemPreferences>) => void;
  fetchCloudState: () => Promise<void>; 
  syncFromHub: (hubData: Partial<UserProfile>) => void; 
}

// ☁️ OS CLOUD SYNC (PostgreSQL Go Backend)
const syncToCloud = async (profile: UserProfile, preferences: SystemPreferences) => {
  try {
    await api.post(`${API_URLS.OS}/os`, { profile, preferences });
    console.log("⚡ Hyper-OS Matrix Synced to DB!");
  } catch (err) {
    console.error("❌ Cloud Sync Failed:", err);
  }
};

// 🌍 SOCIAL HUB SYNC (Profile DB Bridge)
const syncToHub = async (profile: UserProfile) => {
  try {
    await api.post(`${API_URLS.HUB}/profile/update`, {
      nickname: profile.name, 
      bio: profile.bio,
      avatar_url: profile.avatarUrl,
      gender: profile.gender
    });
    console.log("🌍 Hub Profile Synced from OS!");
  } catch (err) {
    console.error("❌ Hub Sync Failed:", err);
  }
};

// 🗄️ VFS CONFIG PATHS
const CONFIG_DIR = '/home/user/.config';
const CONFIG_FILE_PATH = '/home/user/.config/hyper_prefs.json';
let prefsWriteTimeout: NodeJS.Timeout;

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      
      profile: {
        name: 'Hyper User',
        nickname: 'Hyper',
        username: '@hyperuser',
        avatarUrl: '/avatar-3d.png', 
        bio: 'Welcome to the Hyper-Realm. System operational.',
        gender: 'prefer_not_to_say', 
      },
      
      preferences: {
        dockPosition: 'bottom',
        dockAutoHide: false,
        wallpaper: 'default',
        wallpaperBlur: 2,  
        wallpaperDim: 30,  
        dynamicWallpaper: false, // 🚀 Default state OFF rakhi hai
      },

      isBooted: false,
      
      // 🚀 USER UPDATES PROFILE VIA OS IDENTITY MODULE
      updateProfile: (updates) => {
        set((state) => {
          const updatedProfile = { ...state.profile, ...updates };
          syncToCloud(updatedProfile, state.preferences); 
          syncToHub(updatedProfile); 
          return { profile: updatedProfile };
        });
      },
        
      // 🚀 SOCIAL HUB SE DATA AAYA
      syncFromHub: (hubData) => {
        set((state) => {
          const updatedProfile = { 
            ...state.profile, 
            name: hubData.nickname || state.profile.name,
            nickname: hubData.nickname || state.profile.nickname,
            username: hubData.nickname ? `@${hubData.nickname.toLowerCase().replace(/\s+/g, '')}` : state.profile.username,
            bio: hubData.bio || state.profile.bio,
            avatarUrl: hubData.avatarUrl || state.profile.avatarUrl,
            gender: hubData.gender || state.profile.gender
          };
          syncToCloud(updatedProfile, state.preferences); 
          return { profile: updatedProfile };
        });
      },
        
      // 🎨 OS DESKTOP CUSTOMIZATION (VFS DRIVEN 🚀)
      updatePreferences: (updates) => {
        set((state) => {
          const updatedPrefs = { ...state.preferences, ...updates };
          
          // 🚀 ZERO API SPAM: Direct write to VFS with 1-sec Debounce
          if (prefsWriteTimeout) clearTimeout(prefsWriteTimeout);
          
          prefsWriteTimeout = setTimeout(() => {
            try {
              const vfs = useVFSStore.getState();
              
              if (!vfs.readNode(CONFIG_DIR, 'system')) {
                vfs.makeDir(CONFIG_DIR, 'system');
              }
              
              vfs.writeNode(CONFIG_FILE_PATH, JSON.stringify(updatedPrefs, null, 2), 'file', 'system');
              console.log("[Hyper OS] OS Preferences safely written to Hyper Drive! 💾");
            } catch (err) {
              console.error("[Hyper OS] VFS Write failed:", err);
            }
          }, 1000); 

          return { preferences: updatedPrefs };
        });
      },
        
      // ⚙️ OS BOOT SEQUENCE INITIALIZER
      fetchCloudState: async () => {
        try {
          const data = await api.get(`${API_URLS.OS}/os`).catch(() => null);
          if (data && data.profile) {
             set({ profile: { ...get().profile, ...data.profile } });
          }

          const vfs = useVFSStore.getState();
          const configFile = vfs.readNode(CONFIG_FILE_PATH, 'system');
          
          if (configFile && configFile.content) {
            const parsedPrefs = JSON.parse(configFile.content);
            set({ preferences: { ...get().preferences, ...parsedPrefs } });
            console.log("⚡ OS Settings loaded directly from Hyper Drive!");
          } else {
            if (!vfs.readNode(CONFIG_DIR, 'system')) {
              vfs.makeDir(CONFIG_DIR, 'system');
            }
            vfs.writeNode(CONFIG_FILE_PATH, JSON.stringify(get().preferences, null, 2), 'file', 'system');
            console.log("🌱 Initialize default OS configuration in Drive...");
            
            syncToCloud(get().profile, get().preferences); 
          }

          set({ isBooted: true }); 
        } catch (err) {
          console.error("OS Boot Error:", err);
          set({ isBooted: true }); 
        }
      }
    }),
    {
      name: 'hyper-user-matrix',
      skipHydration: true, 
      partialize: (state) => ({ profile: state.profile, preferences: state.preferences }) 
    }
  )
);