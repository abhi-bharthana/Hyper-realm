// apps/web-main/components/Chat/layouts/WorkspaceLayout.tsx
"use client";

import { useChatStore } from "@/store/useChatStore";
import { useThemeStore } from "@/store/useThemeStore";
import { ChatChannels } from "../ChatChannels";
import { MessageStream } from "../MessageStream";
import { MessageSquare } from "lucide-react";

export function WorkspaceLayout() {
  const { activeReceiverId } = useChatStore();
  const { theme } = useThemeStore();
  const isLight = theme === 'light-verdant';

  return (
    <div className="flex-1 flex h-full w-full gap-5 overflow-hidden">
      
      {/* 🖥️ LEFT SIDEBAR: Soft tint adaptive background with dynamic border contrast */}
      <div className={`w-80 md:w-96 rounded-[2rem] border flex flex-col h-full shrink-0 overflow-hidden p-4 transition-all duration-300 ${
        isLight 
          ? 'bg-slate-100/80 border-slate-200/90 text-slate-900 shadow-sm' // Light theme template core sync
          : 'bg-zinc-900/20 border-white/5 backdrop-blur-2xl text-white'
      }`}>
        <div className={`pb-3 border-b mb-3 flex items-center justify-between px-1 ${
          isLight ? 'border-slate-200/60' : 'border-white/5'
        }`}>
          <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${isLight ? 'text-slate-500' : 'text-primary'}`}>Active Core Directory</p>
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatChannels />
        </div>
      </div>

      {/* 🖥️ RIGHT MAIN STREAM: Seamlessly balanced inside container layers */}
      <div className={`flex-1 flex flex-col h-full rounded-[2rem] border overflow-hidden transition-all duration-300 ${
        isLight 
          ? 'bg-slate-100/50 border-slate-200/90 shadow-sm' // System constant surface style sync
          : 'border-white/5 bg-zinc-900/10 backdrop-blur-2xl'
      }`}>
        {activeReceiverId ? (
          <MessageStream />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center font-mono text-xs p-8 text-center select-none">
            <div className={`w-14 h-14 rounded-[1.5rem] border flex items-center justify-center mb-4 shadow-inner ${
              isLight ? 'bg-slate-200/60 border-slate-300/40 text-slate-400' : 'bg-white/[0.01] border-white/5 text-white/20'
            }`}>
              <MessageSquare className="w-5 h-5 opacity-50" />
            </div>
            <h3 className={`font-black uppercase tracking-widest text-xs mb-1 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>Secure Terminal Core</h3>
            <p className={`text-[9px] max-w-xs uppercase leading-relaxed tracking-wide ${isLight ? 'text-slate-400' : 'text-zinc-600'}`}>
              Select an operational node connection from the directory grid to pipeline secure logs.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}