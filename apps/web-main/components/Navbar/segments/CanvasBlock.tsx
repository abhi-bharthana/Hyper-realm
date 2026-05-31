"use client";

import { useRouter } from "next/navigation";
import { CloudUpload, Share2, Trash2, Edit2 } from "lucide-react";
import { useThemeStore } from "@/store/useThemeStore";

interface CanvasBlockProps {
  title: string;
  setTitle: (val: string) => void;
  saveStatus: string;
  isLight: boolean;
}

export function CanvasBlock({ title, setTitle, saveStatus, isLight }: CanvasBlockProps) {
  const router = useRouter();
  const { triggerCanvasSave, triggerCanvasShare, triggerCanvasDelete } = useThemeStore(); // 🚀 Global Triggers
  
  return (
    <>
      {/* 🟢 LEFT SIDE: BACK & RENAME */}
      <div className="flex items-center gap-3 flex-1 animate-in fade-in slide-in-from-left-4 duration-300">
        <button 
          onClick={() => router.push('/canvas')} 
          className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-95 ${
            isLight 
              ? 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-sm' 
              : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'
          }`}
          title="Back to Nodes"
        >
          ←
        </button>
        
        <div className={`h-6 w-[2px] rounded-full opacity-50 ${isLight ? 'bg-slate-300' : 'bg-white/20'}`}></div>
        
        {/* RENAME INPUT WIDGET */}
        <div className="relative flex items-center group w-full max-w-sm">
          <input 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`bg-transparent border-none outline-none font-black text-xl w-full placeholder:opacity-30 tracking-tight transition-all px-2 py-1 rounded-lg
              ${isLight ? 'focus:bg-slate-100 text-slate-900' : 'focus:bg-white/5 text-white'}`}
            placeholder="Untitled Node"
          />
          <Edit2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity absolute right-3 pointer-events-none" />
        </div>
      </div>

      {/* 🟢 RIGHT SIDE: ACTION CONTROLS */}
      <div className="flex items-center gap-2.5 text-xs font-mono shrink-0 animate-in fade-in slide-in-from-right-4 duration-300">
        <span className={`mr-2 tracking-widest uppercase transition-all duration-300 ${saveStatus === 'Saving...' ? 'animate-pulse text-primary font-bold' : 'opacity-50'}`}>
          {saveStatus}
        </span>
        
        <div className={`h-5 w-[1px] mx-1 ${isLight ? 'bg-slate-300' : 'bg-white/20'}`}></div>
        
        {/* 🚀 MANUAL SAVE BUTTON (Primary Tint) */}
        <button 
          onClick={triggerCanvasSave}
          className={`px-3 py-2 rounded-xl transition-all active:scale-95 flex items-center gap-2 font-bold tracking-wider
            ${isLight 
              ? 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 shadow-sm' 
              : 'bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30'}`}
          title="Force Save to Database"
        >
          <CloudUpload className="w-4 h-4" />
          <span className="hidden md:inline">SAVE</span>
        </button>

        {/* 🚀 SHARE BUTTON */}
        <button 
          onClick={triggerCanvasShare}
          className={`p-2.5 rounded-xl transition-all active:scale-95 border ${
            isLight ? 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700 shadow-sm' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
          }`}
          title="Copy Public Link"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* 🚀 DELETE BUTTON (Destructive Red) */}
        <button 
          onClick={triggerCanvasDelete}
          className={`p-2.5 rounded-xl transition-all active:scale-95 border ${
            isLight ? 'bg-red-50 border-red-100 hover:bg-red-100 text-red-600 shadow-sm' : 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-400'
          }`}
          title="Purge Node"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}