import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, API_URLS } from '@/lib/api';

export interface UserProfile {
  name: string;
  nickname: string;
  username: string;
  avatarUrl: string;
  bio: string; 
  gender: string; // 🚀 ADDED: Gender now persisted
}

export interface SystemPreferences {
  dockPosition: 'bottom' | 'left' | 'right' | 'top'; // 🪟 Added 'top' just in case
  dockAutoHide: boolean;
  wallpaper: string; 
}

interface UserStore {
  profile: UserProfile;
  preferences: SystemPreferences;
  isBooted: boolean; // ⚙️ Tracks if OS has finished loading DB state

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
      gender: profile.gender // 🚀 SYNCED: Gender pushed to Hub
    });
    console.log("🌍 Hub Profile Synced from OS!");
  } catch (err) {
    console.error("❌ Hub Sync Failed:", err);
  }
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      
      profile: {
        name: 'Hyper User',
        nickname: 'Hyper',
        username: '@hyperuser',
        avatarUrl: '/avatar-3d.png', 
        bio: 'Welcome to the Hyper-Realm. System operational.',
        gender: 'prefer_not_to_say', // Default
      },
      
      preferences: {
        dockPosition: 'bottom',
        dockAutoHide: false,
        wallpaper: 'default',
      },

      isBooted: false,
      
      // 🚀 USER UPDATES SETTINGS VIA OS PRIVACY/IDENTITY MODULE
      updateProfile: (updates) => {
        set((state) => {
          const updatedProfile = { ...state.profile, ...updates };
          syncToCloud(updatedProfile, state.preferences); 
          syncToHub(updatedProfile); // 🔥 THE BRIDGE (Fires to external Hub)
          return { profile: updatedProfile };
        });
      },
        
      // 🚀 SOCIAL HUB SE DATA AAYA (E.g., User logged into dashboard)
      syncFromHub: (hubData) => {
        set((state) => {
          const updatedProfile = { 
            ...state.profile, 
            name: hubData.nickname || state.profile.name,
            nickname: hubData.nickname || state.profile.nickname,
            username: hubData.nickname ? `@${hubData.nickname.toLowerCase().replace(/\s+/g, '')}` : state.profile.username,
            bio: hubData.bio || state.profile.bio,
            avatarUrl: hubData.avatarUrl || state.profile.avatarUrl,
            gender: hubData.gender || state.profile.gender // 🚀 SYNCED: Gender retrieved
          };
          syncToCloud(updatedProfile, state.preferences); // Push mapped Hub data to OS Postgres
          return { profile: updatedProfile };
        });
      },
        
      // 🎨 OS DESKTOP CUSTOMIZATION
      updatePreferences: (updates) => {
        set((state) => {
          const updatedPrefs = { ...state.preferences, ...updates };
          syncToCloud(state.profile, updatedPrefs); 
          return { preferences: updatedPrefs };
        });
      },
        
      // ⚙️ OS BOOT SEQUENCE INITIALIZER
      fetchCloudState: async () => {
        try {
          const data = await api.get(`${API_URLS.OS}/os`);
          if (data && data.profile && data.preferences) {
            set({ 
              profile: { ...get().profile, ...data.profile }, 
              preferences: { ...get().preferences, ...data.preferences },
              isBooted: true // OS is ready to render
            });
            console.log("☁️ Data loaded from OS Postgres!");
          }
        } catch (err: any) {
          if (err.message && err.message.includes("not_found")) {
            console.log("🌱 Initialize default OS state...");
            syncToCloud(get().profile, get().preferences); 
          }
          set({ isBooted: true }); // Fallback: Ensure UI still loads even if backend is unreachable
        }
      }
    }),
    {
      name: 'hyper-user-matrix',
      skipHydration: true, 
      partialize: (state) => ({ profile: state.profile, preferences: state.preferences }) // 🛡️ Save strictly these to local DB, avoid persisting isBooted flag
    }
  )
);