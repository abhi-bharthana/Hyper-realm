import { create } from 'zustand';
import { api } from '@/lib/api'; 

export interface Track {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
}

interface MusicStore {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  volume: number;
  progress: number; 
  currentTime: number; 
  duration: number; 
  
  // 🚀 NAYE STATES (Tabs, Favorites, Recent)
  activeTab: 'queue' | 'favorites' | 'recent' | 'playlists' | 'albums';
  favorites: string[]; // Stores track IDs
  recentPlays: Track[]; 

  playTrack: (track: Track) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  updateTime: (currentTime: number, duration: number) => void;
  setProgressFromUI: (progress: number) => void; 
  nextTrack: () => void;
  prevTrack: () => void;
  
  // 🚀 NAYE ACTIONS (Tabs handle karna aur Gaane Favorite karna)
  setActiveTab: (tab: 'queue' | 'favorites' | 'recent' | 'playlists' | 'albums') => void;
  toggleFavorite: (trackId: string) => void;
  addToRecent: (track: Track) => void;

  loadTracksFromCloud: (folderPath?: string) => Promise<void>; 
  extractMetadata: (url: string, trackId: string) => Promise<void>; 
}

export const useMusicStore = create<MusicStore>((set, get) => ({
  currentTrack: null,
  queue: [], 
  isPlaying: false,
  volume: 0.8, 
  progress: 0,
  currentTime: 0,
  duration: 0,

  // 🚀 NAYE INITIAL STATES
  activeTab: 'queue',
  favorites: [],
  recentPlays: [],

  // ==========================================
  // 🎛️ CORE ACTIONS & RECENT LOGIC
  // ==========================================
  setActiveTab: (tab) => set({ activeTab: tab }),

  toggleFavorite: (trackId) => set((state) => {
    const isFav = state.favorites.includes(trackId);
    return {
      favorites: isFav 
        ? state.favorites.filter(id => id !== trackId) 
        : [...state.favorites, trackId]
    };
  }),

  addToRecent: (track) => set((state) => {
    // Purana hata ke list ke top pe wapas laane ka logic
    const filtered = state.recentPlays.filter(t => t.id !== track.id);
    return { recentPlays: [track, ...filtered].slice(0, 20) }; // Keeps only last 20
  }),

  playTrack: (track) => {
    get().addToRecent(track); // 🚀 Automatic recent me add karega play hone pe
    set({ currentTrack: track, isPlaying: true, progress: 0, currentTime: 0 });
  },
  
  togglePlay: () => set((state) => {
    if (!state.currentTrack && state.queue.length > 0) {
      // Agar pehli baar play dabaya bina gaana slect kiye toh queue ka pehla play hoga 
      // AND wo recent me bhi jayega
      get().addToRecent(state.queue[0]); 
      return { currentTrack: state.queue[0], isPlaying: true };
    }
    return { isPlaying: !state.isPlaying };
  }),
  
  setVolume: (volume) => set({ volume }),

  updateTime: (currentTime, duration) => {
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    set({ currentTime, duration, progress });
  },

  setProgressFromUI: (progress) => set({ progress }),

  // ==========================================
  // ⏭️ NAVIGATION LOGIC
  // ==========================================
  nextTrack: () => {
    const { currentTrack, queue, playTrack } = get();
    if (queue.length === 0) return;
    if (!currentTrack) return playTrack(queue[0]);

    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      playTrack(queue[currentIndex + 1]);
    } else {
      playTrack(queue[0]);
    }
  },
  
  prevTrack: () => {
    const { currentTrack, queue, playTrack } = get();
    if (queue.length === 0) return;
    if (!currentTrack) return;

    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex > 0) {
      playTrack(queue[currentIndex - 1]);
    } else {
      playTrack(queue[queue.length - 1]);
    }
  },

  // ==========================================
  // 🎵 ID3 TAGS EXTRACTOR (TURBOPACK SAFE)
  // ==========================================
  extractMetadata: async (url, trackId) => {
    try {
      let jsmediatags = (window as any).jsmediatags;

      if (!jsmediatags) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/jsmediatags/3.9.5/jsmediatags.min.js";
          script.onload = () => {
            jsmediatags = (window as any).jsmediatags;
            resolve(true);
          };
          script.onerror = () => reject("Failed to load jsmediatags CDN");
          document.head.appendChild(script);
        });
      }

      jsmediatags.read(url, {
        onSuccess: (tag: any) => {
          const { title, artist, picture } = tag.tags;
          let coverUrl = undefined;

          if (picture) {
            const byteArray = new Uint8Array(picture.data);
            const blob = new Blob([byteArray], { type: picture.format });
            coverUrl = URL.createObjectURL(blob);
          }

          set((state) => ({
            queue: state.queue.map(t => 
              t.id === trackId 
                ? { 
                    ...t, 
                    title: title || t.title, 
                    artist: artist || t.artist, 
                    coverUrl: coverUrl || t.coverUrl 
                  } 
                : t
            ),
            currentTrack: state.currentTrack?.id === trackId 
              ? {
                  ...state.currentTrack,
                  title: title || state.currentTrack.title, 
                  artist: artist || state.currentTrack.artist, 
                  coverUrl: coverUrl || state.currentTrack.coverUrl 
                }
              : state.currentTrack,
              
            // 🚀 IMPORTANT: Recent Plays ke andar bhi art aur title update karna hoga
            recentPlays: state.recentPlays.map(t => 
              t.id === trackId 
                ? { 
                    ...t, 
                    title: title || t.title, 
                    artist: artist || t.artist, 
                    coverUrl: coverUrl || t.coverUrl 
                  } 
                : t
            )
          }));
        },
        onError: (error: any) => {
          console.warn(`No ID3 tags found for: ${trackId}`);
        }
      });
    } catch (e) {
      console.error("ID3 Extractor failed:", e);
    }
  },

  // ==========================================
  // ☁️ HYPER CLOUD BACKEND INTEGRATION
  // ==========================================
  loadTracksFromCloud: async (folderPath = "") => {
    try {
      const USER_ID = "abhishek-babu-node"; 
      const API_BASE = "/api/v1/storage";
      const MINIO_GATEWAY = "http://localhost:7480/hyper-users-data";

      console.log(`☁️ [Hyper Music] Fetching audio from Cloud...`);
      
      const data = await api.get(`${API_BASE}/files?user_id=${USER_ID}&folder=${encodeURIComponent(folderPath)}`);
      
      if (!data || !data.files) return;

      const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'];

      const driveAudioFiles = data.files.filter((file: any) => {
        const fileNameLower = String(file.file_name || '').toLowerCase();
        const hasAudioExt = audioExtensions.some(ext => fileNameLower.endsWith(ext));
        const isAudioMime = file.content_type?.startsWith('audio/');
        const isUnknownBinary = file.content_type === 'application/octet-stream';

        return hasAudioExt || isAudioMime || isUnknownBinary;
      });

      const fetchedTracks: Track[] = driveAudioFiles.map((file: any) => {
        const cleanFileName = String(file.file_name).replace(/\.[^/.]+$/, "");
        return {
          id: file.object_name,
          title: cleanFileName, 
          artist: 'Hyper Drive File',
          coverUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(cleanFileName)}&backgroundColor=0a0a0f,8d6bff,52d9ff`, 
          audioUrl: `${MINIO_GATEWAY}/${file.object_name}`
        };
      });

      if (fetchedTracks.length > 0) {
        set({ queue: fetchedTracks });

        const extractMetadata = get().extractMetadata;
        fetchedTracks.forEach(track => {
          extractMetadata(track.audioUrl, track.id);
        });
      } else {
        console.log("⚠️ [Hyper Music] No audio files found.");
      }
    } catch (error) {
      console.error("❌ [Hyper Music] Backend sync failed:", error);
    }
  }
}));