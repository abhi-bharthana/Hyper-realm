"use client";

import { useState, useEffect } from "react"; 
import { useChatStore } from "@/store/useChatStore";
import { useThemeStore } from "@/store/useThemeStore";
import { Minimize2, Square, X, MessageSquare, ArrowLeft } from "lucide-react"; 
import { motion, useDragControls } from "framer-motion"; 

import { CompactLayout } from "./layouts/CompactLayout";
import { WorkspaceLayout } from "./layouts/WorkspaceLayout";

export default function GlobalChatWindow() {
  const { mode, activeReceiverId, closeChat, setMode, openChat } = useChatStore();
  const { theme } = useThemeStore();
  const dragControls = useDragControls(); 
  const isLight = theme === 'light-verdant';
  const isFull = mode === 'fullscreen';

  const [dragBounds, setDragBounds] = useState({ left: 0, right: 0, top: 0, bottom: 0 });

  useEffect(() => {
    if (typeof window === "undefined" || mode !== 'floating') return;

    const calculateScreenConstraints = () => {
      const chatWidth = 320;
      const chatHeight = 460;
      const rightOffset = 16;  
      const bottomOffset = 96; 

      setDragBounds({
        left: -(window.innerWidth - chatWidth - rightOffset),
        right: rightOffset,    
        top: -(window.innerHeight - chatHeight - bottomOffset),
        bottom: bottomOffset   
      });
    };

    calculateScreenConstraints();
    window.addEventListener("resize", calculateScreenConstraints);
    return () => window.removeEventListener("resize", calculateScreenConstraints);
  }, [mode]);

  if (mode === 'hidden') return null;

  const windowStyles = {
    docked: `fixed bottom-0 right-4 w-[380px] h-[550px] max-h-[85vh] rounded-t-[2.5rem] border shadow-[0_0_50px_rgba(0,0,0,0.1)] ${isLight ? 'bg-white border-slate-200' : 'bg-zinc-950/80 border-white/10 backdrop-blur-3xl'}`,
    floating: `fixed bottom-24 right-4 w-[320px] h-[460px] rounded-[2.5rem] border shadow-[0_0_50px_rgba(var(--primary),0.05)] ${isLight ? 'bg-white border-slate-200' : 'bg-zinc-950/80 border-primary/20 backdrop-blur-3xl'}`,
    fullscreen: `fixed top-3 inset-x-0 bottom-0 w-full h-[calc(100vh-1.5rem)] z-40 px-6 pb-6 flex flex-col rounded-none border-0 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-zinc-950 text-white'}`, 
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={mode === 'floating' ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      
      drag={mode === 'floating'}
      dragControls={dragControls} 
      dragListener={false} 
      dragConstraints={dragBounds} 
      dragElastic={0} 
      
      className={`overflow-hidden z-40 hidden md:flex flex-col ${windowStyles[mode]} ${
        mode === 'floating' ? 'touch-none' : 'transition-all duration-300 ease-in-out'
      }`}
    >
      
      {/* 🟢 FLOATING INTERFACE HEADER */}
      <div 
        onPointerDown={(e) => mode === 'floating' && dragControls.start(e)}
        className={`h-16 flex justify-between items-center select-none shrink-0 z-50 ${
          isFull 
            ? 'bg-transparent border-0 px-0' 
            : isLight 
            ? 'bg-slate-200/40 border-b border-slate-200/60 px-5' 
            : 'bg-zinc-900 border-b border-white/5 px-5 backdrop-blur-md'
        }`}
      >
        <div className="flex items-center gap-3 max-w-[60%] pointer-events-none">
          {activeReceiverId && !isFull && (
            <button 
              onClick={() => openChat("")}
              className={`p-2 rounded-full transition-all shrink-0 active:scale-90 pointer-events-auto ${
                isLight ? 'hover:bg-slate-300/50 text-slate-500' : 'hover:bg-white/5 text-zinc-400'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {!isFull && (
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="font-black text-[10px] uppercase tracking-[0.25em] text-primary">Comms Core</span>
            </div>
          )}
        </div>

        {/* 🎯 CONTROL CAPSULE PILL - THEME DROPSHADOW INTEGRATION */}
        <div className="flex items-center pointer-events-auto z-50 ml-auto h-full">
          {isFull ? (
            /* 🖥️ Pill shape shadows configured dynamically based on style themes selection */
            <div className={`flex items-center justify-evenly h-11 w-[120px] rounded-full transition-all border ${
              isLight 
                ? 'bg-zinc-900 border-zinc-800 shadow-[0_15px_35px_rgba(0,0,0,0.18)]' // Solid elegant drop layout shadow in light theme
                : 'bg-zinc-900/90 border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.6)] backdrop-blur-2xl hover:border-white/20'
            }`}>
              <button 
                onClick={() => setMode('docked')} 
                className="text-zinc-400 hover:text-white transition-colors text-xs font-black px-2 transform hover:scale-120 active:scale-90" 
                title="Minimize to Dock"
              >
                —
              </button>
              <button 
                onClick={() => setMode('docked')} 
                className="text-zinc-400 hover:text-white transition-colors flex items-center justify-center transform hover:scale-[1.15] active:scale-90" 
                title="Restore Window"
              >
                <Square className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>
              <button 
                onClick={closeChat} 
                className="text-red-500/90 hover:text-red-400 transition-colors flex items-center justify-center transform hover:scale-[1.15] active:scale-90" 
                title="Close Session"
              >
                <X className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          ) : (
            <div className={`flex items-center gap-2.5 border px-3 py-1.5 rounded-full ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-black/20 border-white/5'
            }`}>
              <button 
                onClick={() => setMode('fullscreen')}
                className={`p-0.5 rounded-full transition-all ${isLight ? 'text-slate-500 hover:text-black' : 'text-zinc-400 hover:text-white'}`}
                title="Expand Workspace"
              >
                <Square className="w-3 h-3 stroke-[2]" />
              </button>
              <span className={`w-px h-3 ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />
              <div 
                className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 cursor-pointer transition-transform hover:scale-110" 
                onClick={() => setMode(mode === 'floating' ? 'docked' : 'floating')}
              />
              <div 
                className="w-2.5 h-2.5 rounded-full bg-red-500/80 cursor-pointer transition-transform hover:scale-110" 
                onClick={closeChat}
              />
            </div>
          )}
        </div>
      </div>

      {/* 🟢 CONTENT FRAMEWORK INJECTION */}
      <div className="flex-1 overflow-hidden flex bg-transparent select-text mt-1">
        {isFull ? <WorkspaceLayout /> : <CompactLayout />}
      </div>

    </motion.div>
  );
}