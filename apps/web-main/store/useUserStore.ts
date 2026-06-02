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
  dockPosition: 'bottom' | 'left' | 'right';
  dockAutoHide: boolean;
  wallpaper: string; 
}

interface UserStore {
  profile: UserProfile;
  preferences: SystemPreferences;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updatePreferences: (updates: Partial<SystemPreferences>) => void;
  fetchCloudState: () => Promise<void>; 
  syncFromHub: (hubData: Partial<UserProfile>) => void; 
}

// ☁️ OS CLOUD SYNC (Postgres)
const syncToCloud = async (state: any) => {
  try {
    await api.post(`${API_URLS.OS}/os`, {
      profile: state.profile,
      preferences: state.preferences
    });
    console.log("⚡ Hyper-OS Matrix Synced!");
  } catch (err) {
    console.error("❌ Cloud Sync Failed:", err);
  }
};

// 🌍 SOCIAL HUB SYNC (Profile DB)
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
        name: 'hey!',
        nickname: 'hey!',
        username: '@hey!',
        avatarUrl: '/avatar-3d.png', 
        bio: 'Creative director at @hey! | A designer that keens simplicity and usability',
        gender: 'prefer_not_to_say', // Default
      },
      
      preferences: {
        dockPosition: 'bottom',
        dockAutoHide: false,
        wallpaper: 'default',
      },
      
      // 🚀 USER NE OS SETTINGS MEIN KUCH BADLA
      updateProfile: (updates) =>
        set((state) => {
          const newState = { profile: { ...state.profile, ...updates } };
          syncToCloud({ ...state, ...newState }); 
          syncToHub(newState.profile); // 🔥 THE BRIDGE (Gender Included)
          return newState;
        }),
        
      // 🚀 SOCIAL HUB SE DATA AAYA (Dashboard load hone pe)
      syncFromHub: (hubData) => 
        set((state) => {
          const newState = { 
            profile: { 
              ...state.profile, 
              name: hubData.nickname || state.profile.name,
              nickname: hubData.nickname || state.profile.nickname,
              username: hubData.nickname ? `@${hubData.nickname.toLowerCase().replace(/\s+/g, '')}` : state.profile.username,
              bio: hubData.bio || state.profile.bio,
              avatarUrl: hubData.avatarUrl || state.profile.avatarUrl,
              gender: hubData.gender || state.profile.gender // 🚀 SYNCED: Gender retrieved
            } 
          };
          syncToCloud({ ...state, ...newState });
          return newState;
        }),
        
      updatePreferences: (updates) =>
        set((state) => {
          const newState = { preferences: { ...state.preferences, ...updates } };
          syncToCloud({ ...state, ...newState }); 
          return newState;
        }),
        
      fetchCloudState: async () => {
        try {
          const data = await api.get(`${API_URLS.OS}/os`);
          if (data && data.profile && data.preferences) {
            set({ profile: data.profile, preferences: data.preferences });
            console.log("☁️ Data loaded from OS Postgres!");
          }
        } catch (err: any) {
          if (err.message && err.message.includes("not_found")) {
            console.log("🌱 Initialize default OS state...");
            syncToCloud(get()); 
          }
        }
      }
    }),
    {
      name: 'hyper-user-profile',
      skipHydration: true, 
    }
  )
);