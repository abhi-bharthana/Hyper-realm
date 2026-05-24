"use client";

import { useState, useEffect } from "react";
import { useChatStore } from "@/store/useChatStore";
import { useThemeStore } from "@/store/useThemeStore"; 
import { api, API_URLS } from "@/lib/api";
import { Loader2, MessageCircle, Users } from "lucide-react";

export function ChatChannels() {
  const { openChat, activeReceiverId, mode, setMode } = useChatStore();
  const { theme } = useThemeStore();
  const isLight = theme === 'light-verdant';

  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const data = await api.get(`${API_URLS.HUB}/users/friends`);
        setFriends(data || []);
      } catch (err) {
        console.error("Failed to load chat channels:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 h-full">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span className={`text-[9px] font-mono uppercase tracking-[0.2em] ${isLight ? 'text-slate-400' : 'text-muted-foreground'}`}>Syncing Node Map...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      <div className="space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
        {friends.length > 0 ? (
          friends.map((friend: any) => {
            const isSelected = activeReceiverId === friend.hid;
            return (
              <div
                key={friend.hid}
                onClick={() => {
                  const previousMode = mode;
                  openChat(friend.hid);
                  if (previousMode === 'fullscreen') {
                    setMode('fullscreen');
                  }
                }}
                className={`p-3.5 rounded-[1.75rem] cursor-pointer flex items-center justify-between transition-all duration-300 group border scale-100 active:scale-[0.98] ${
                  isSelected 
                    ? "bg-primary text-black border-primary shadow-[0_10px_30px_rgba(var(--primary),0.15)] font-black" 
                    : isLight
                    ? "border-transparent hover:bg-slate-100 hover:border-slate-200/60 text-slate-600 hover:text-slate-900"
                    : "border-transparent hover:bg-white/[0.03] hover:border-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Pill shaped modular initials badge */}
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-black uppercase shrink-0 transition-all duration-300 ${
                    isSelected 
                      ? "bg-black text-primary shadow-md" 
                      : isLight 
                      ? "bg-slate-200 text-slate-700 border border-slate-300/30" 
                      : "bg-white/5 border border-white/10 text-primary"
                  }`}>
                    {friend.nickname?.charAt(0) || 'U'}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`text-xs font-black tracking-tight truncate ${isSelected ? 'text-black' : isLight ? 'text-slate-800' : 'text-zinc-100'}`}>{friend.nickname}</span>
                    <span className={`text-[8px] uppercase tracking-[0.15em] font-black transition-colors ${
                      isSelected ? 'text-black/60' : isLight ? 'text-slate-400' : 'text-zinc-500 group-hover:text-primary/70'
                    }`}>
                      {friend.role || 'Agent'}
                    </span>
                  </div>
                </div>
                
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 ${
                  isSelected 
                    ? 'border-black/10 bg-black/5 text-black' 
                    : 'border-white/5 bg-white/[0.02] text-zinc-500 group-hover:text-primary group-hover:border-primary/20 group-hover:bg-primary/5'
                }`}>
                  <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 px-4">
            <Users className={`w-8 h-8 mx-auto mb-3 opacity-30 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`} />
            <p className={`text-xs font-black uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>No Active Links</p>
          </div>
        )}
      </div>
    </div>
  );
}