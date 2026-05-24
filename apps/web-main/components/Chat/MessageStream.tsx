"use client";

import { useChatStore } from "@/store/useChatStore";
import { useThemeStore } from "@/store/useThemeStore";
import { Send, ShieldCheck, Phone, Video } from "lucide-react";

interface MessageStreamProps {
  hideHeader?: boolean;
}

export function MessageStream({ hideHeader = false }: MessageStreamProps) {
  const { activeReceiverId } = useChatStore();
  const { theme } = useThemeStore();
  const isLight = theme === 'light-verdant';

  if (!activeReceiverId) return null;

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent min-w-0">
      
      {/* HEADER SECTION PANEL */}
      {!hideHeader && (
        <div className={`h-16 px-5 flex items-center justify-between shrink-0 select-none ${
          isLight ? 'bg-slate-50' : 'bg-transparent'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-xs font-black text-primary uppercase shadow-inner shrink-0">
              {activeReceiverId.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className={`text-xs font-black tracking-tight uppercase truncate ${isLight ? 'text-slate-800' : 'text-zinc-100'}`}>{activeReceiverId}</h2>
              <p className="text-[8px] text-primary tracking-[0.2em] font-black uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> SECURE TUNNEL ACTIVE
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
              isLight ? 'border-slate-200 bg-white text-slate-500 hover:text-slate-800' : 'border-white/5 bg-white/[0.02] text-zinc-400 hover:text-primary hover:border-primary/20'
            }`}>
              <Phone className="w-3.5 h-3.5" />
            </button>
            <button className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
              isLight ? 'border-slate-200 bg-white text-slate-500 hover:text-slate-800' : 'border-white/5 bg-white/[0.02] text-zinc-400 hover:text-primary hover:border-primary/20'
            }`}>
              <Video className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* MESSAGES CONTEXT STREAM SCROLL CONTAINER */}
      <div className={`flex-1 p-5 overflow-y-auto font-mono text-xs space-y-4 custom-scrollbar ${isLight ? 'bg-slate-50/40' : 'bg-black/10'}`}>
        <div className={`p-4 rounded-[1.5rem] border text-center shadow-inner max-w-sm mx-auto mt-4 backdrop-blur-md ${
          isLight ? 'border-slate-200 bg-white text-slate-500' : 'border-white/5 bg-white/[0.01] text-zinc-500'
        }`}>
          Encrypted network bridge established with node:
          <span className="text-primary block mt-1 font-bold tracking-tight break-all">[{activeReceiverId}]</span>
        </div>
      </div>
      
      {/* 🟢 NEXT-LEVEL ROUNDED INPUT BAR */}
      <div className="p-4 shrink-0 bg-transparent">
        <div className={`flex items-center gap-3 border rounded-[1.75rem] pl-5 pr-2 py-1.5 transition-all focus-within:ring-1 focus-within:ring-primary/30 ${
          isLight ? 'bg-white border-slate-200 focus-within:border-primary' : 'bg-zinc-900 border-white/5 focus-within:border-primary/40'
        }`}>
          <input 
            type="text" 
            placeholder="Transmit encrypted directive..." 
            className={`w-full bg-transparent py-1.5 outline-none text-xs font-semibold ${
              isLight ? 'text-slate-800 placeholder:text-slate-400' : 'text-white placeholder:text-zinc-600'
            }`}
          />
          <button className="bg-primary text-black w-9 h-9 rounded-2xl flex items-center justify-center transform hover:scale-105 active:scale-95 transition-all shrink-0 shadow-lg shadow-primary/10">
            <Send className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>

    </div>
  );
}