// apps/web-main/store/useChatStore.ts
import { create } from 'zustand';

type ChatMode = 'hidden' | 'docked' | 'floating' | 'fullscreen';

interface ChatState {
  mode: ChatMode;
  activeReceiverId: string | null;
  
  // Actions
  openChat: (receiverId: string) => void;
  closeChat: () => void;
  setMode: (mode: ChatMode) => void;
  minimizeToFloating: () => void;
  maximizeToFullscreen: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  mode: 'hidden',
  activeReceiverId: null,

  openChat: (receiverId) => set({ mode: 'docked', activeReceiverId: receiverId }),
  closeChat: () => set({ mode: 'hidden', activeReceiverId: null }),
  setMode: (mode) => set({ mode }),
  
  // Page switch hone par automatically call hoga
  minimizeToFloating: () => set({ mode: 'floating' }),
  maximizeToFullscreen: () => set({ mode: 'fullscreen' }),
}));