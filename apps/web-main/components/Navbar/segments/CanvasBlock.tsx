"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CloudUpload, Share2, Trash2, Edit2, ChevronLeft, EyeOff, Eye,
  Type, Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
  PenTool, Eraser, Palette, Undo2, Redo2, Sliders
} from "lucide-react";
import { useThemeStore } from "@/store/useThemeStore";

export interface CanvasBlockProps {
  title: string;
  setTitle: (val: string) => void;
  saveStatus: string;
  isLight: boolean;
  editor?: any;
  activeMenu?: 'main' | 'text' | 'draw' | 'shapes';
  setActiveMenu?: (menu: any) => void;
  drawTool?: 'pen' | 'eraser' | 'none';
  setDrawTool?: (tool: any) => void;
  brushSize?: number;
  setBrushSize?: (size: number) => void;
  activeColor?: string;
  setActiveColor?: (color: string) => void;
  canvasOverlayRef?: React.RefObject<any>;
}

export function CanvasBlock({ 
  title, setTitle, saveStatus, isLight,
  editor, activeMenu = 'text', setActiveMenu, drawTool, setDrawTool,
  brushSize = 4, setBrushSize, activeColor = '#22d3ee', setActiveColor, canvasOverlayRef
}: CanvasBlockProps) {
  
  const router = useRouter();
  const { triggerCanvasSave, triggerCanvasShare, triggerCanvasDelete } = useThemeStore();
  
  const [viewMode, setViewMode] = useState<'document' | 'tools'>('document');
  const [isHidden, setIsHidden] = useState(false);

  const handleUndo = () => {
    if (activeMenu === 'draw' || activeMenu === 'shapes') canvasOverlayRef?.current?.undo();
    else editor?.chain().focus().undo().run();
  };

  const handleRedo = () => {
    if (activeMenu === 'draw' || activeMenu === 'shapes') canvasOverlayRef?.current?.redo();
    else editor?.chain().focus().redo().run();
  };

  const glassBg = isLight
    ? 'bg-white/80 border-slate-200/50 shadow-[0_15px_40px_rgba(0,0,0,0.08)] backdrop-blur-3xl backdrop-saturate-150 text-slate-800'
    : 'bg-[#18181b]/95 border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.6)] backdrop-blur-3xl backdrop-saturate-150 text-white';

  const btnHover = isLight
    ? 'hover:bg-slate-100 active:bg-slate-200 text-slate-600 active:scale-95'
    : 'hover:bg-white/10 active:bg-white/20 text-white/80 active:scale-95';

  const activeBtn = isLight ? 'bg-black text-white shadow-md' : 'bg-white text-black shadow-md';
  const divider = isLight ? 'bg-slate-200/80' : 'bg-white/10';

  return (
    <>
      <AnimatePresence>
        {!isHidden && (
          <motion.div
            layout // 🚀 1. Sirf layout rakha hai, layoutId hata diya gaya hai!
            initial={{ y: -100, opacity: 0, x: "-50%" }}
            animate={{ y: 0, opacity: 1, x: "-50%" }}
            exit={{ y: -100, opacity: 0, x: "-50%", scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30, mass: 1 }}
            className={`fixed top-4 md:top-6 left-1/2 flex items-center p-1.5 gap-2 rounded-[2.5rem] border z-[100] w-max max-w-[95vw] shadow-2xl whitespace-nowrap ${glassBg}`}
          >
            
            {/* 🟢 BASE CONTROLS */}
            <motion.div layout className="flex items-center gap-1.5 shrink-0">
              <button onClick={() => router.push('/canvas')} className={`p-2.5 rounded-full transition-all ${btnHover}`} title="Back">
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className={`flex items-center p-1 rounded-full ${isLight ? 'bg-slate-100/70' : 'bg-black/40'}`}>
                <button onClick={() => setViewMode('document')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'document' ? activeBtn : 'text-slate-500 hover:text-current'}`}>Document</button>
                <button onClick={() => { setViewMode('tools'); setActiveMenu?.('text'); }} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'tools' ? activeBtn : 'text-slate-500 hover:text-current'}`}>Tools</button>
              </div>
              
              <div className={`h-6 w-[1px] mx-1 shrink-0 ${divider}`} />
            </motion.div>

            {/* 🟢 DYNAMIC MORPHING SECTION */}
            <motion.div layout className="flex items-center shrink-0">
              {/* 🚀 2. THE MASTER FIX: mode="wait" ensures old UI deletes BEFORE new UI loads. No double width! */}
              <AnimatePresence mode="wait">
                
                {/* 📝 DOCUMENT MODE */}
                {viewMode === 'document' ? (
                  <motion.div 
                    key="doc-mode" 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.95 }} 
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1.5"
                  >
                    <div className="relative flex items-center group min-w-[150px] max-w-[200px] md:max-w-[250px]">
                      <input 
                        type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                        className={`bg-transparent border-none outline-none font-black text-base text-center w-full truncate placeholder:opacity-30 tracking-tight transition-all px-2 py-1 rounded-lg ${isLight ? 'text-slate-900 hover:bg-slate-100 focus:bg-slate-100' : 'text-white hover:bg-white/5 focus:bg-white/5'}`}
                        placeholder="Untitled Node"
                      />
                      <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-30 absolute right-1 pointer-events-none" />
                    </div>

                    <div className={`h-6 w-[1px] mx-1 shrink-0 ${divider}`} />
                    
                    <span className={`hidden md:inline px-2 text-[10px] font-mono tracking-widest uppercase transition-all duration-300 ${saveStatus === 'Saving...' ? 'text-cyan-500 font-bold animate-pulse' : 'opacity-40'}`}>
                      {saveStatus}
                    </span>
                    <button onClick={triggerCanvasSave} className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-2 font-bold text-xs uppercase ${isLight ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-md' : 'bg-white text-black hover:bg-slate-200 shadow-lg'}`}>
                      <CloudUpload className="w-4 h-4" /><span className="hidden md:inline">Save</span>
                    </button>
                    <button onClick={triggerCanvasShare} className={`p-2.5 rounded-full transition-all ${btnHover}`} title="Share"><Share2 className="w-4 h-4 opacity-80" /></button>
                    <button onClick={triggerCanvasDelete} className={`p-2.5 rounded-full transition-all ${isLight ? 'hover:bg-red-50 text-red-500' : 'hover:bg-red-500/20 text-red-400'}`}><Trash2 className="w-4 h-4 opacity-80" /></button>
                  </motion.div>
                ) : (
                  
                  /* 🛠️ TOOLS MODE */
                  <motion.div 
                    key="tools-mode" 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.95 }} 
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1.5"
                  >
                    <button onClick={() => setActiveMenu?.('text')} className={`p-2.5 rounded-full transition-all ${activeMenu === 'text' ? activeBtn : btnHover}`} title="Text Engine"><Type className="w-4 h-4" /></button>
                    <button onClick={() => { setActiveMenu?.('draw'); setDrawTool?.('pen'); }} className={`p-2.5 rounded-full transition-all ${activeMenu === 'draw' && drawTool === 'pen' ? activeBtn : btnHover}`} title="Neural Pen"><PenTool className="w-4 h-4" /></button>
                    <button onClick={() => { setActiveMenu?.('draw'); setDrawTool?.('eraser'); }} className={`p-2.5 rounded-full transition-all ${activeMenu === 'draw' && drawTool === 'eraser' ? activeBtn : btnHover}`} title="Eraser"><Eraser className="w-4 h-4" /></button>
                    
                    <div className={`h-6 w-[1px] mx-1 shrink-0 ${divider}`} />

                    {activeMenu === 'text' && (
                      <div className="flex items-center gap-1">
                        <button onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2.5 rounded-full font-bold text-xs ${editor?.isActive('heading', { level: 1 }) ? activeBtn : btnHover}`}>H1</button>
                        <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2.5 rounded-full font-bold text-xs ${editor?.isActive('heading', { level: 2 }) ? activeBtn : btnHover}`}>H2</button>
                        <div className={`h-4 w-[1px] mx-1 shrink-0 ${divider}`} />
                        <button onClick={() => editor?.chain().focus().toggleBold().run()} className={`p-2.5 rounded-full ${editor?.isActive('bold') ? activeBtn : btnHover}`}><Bold className="w-4 h-4" /></button>
                        <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={`p-2.5 rounded-full ${editor?.isActive('italic') ? activeBtn : btnHover}`}><Italic className="w-4 h-4" /></button>
                        <button onClick={() => editor?.chain().focus().toggleCode().run()} className={`p-2.5 rounded-full ${editor?.isActive('code') ? activeBtn : btnHover}`}><Code className="w-4 h-4" /></button>
                      </div>
                    )}

                    {activeMenu === 'draw' && (
                      <div className="flex items-center gap-2">
                        <div className="hidden md:flex items-center gap-2 px-2">
                           <Sliders className={`w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-white/40'}`} />
                           <input type="range" min="1" max="25" value={brushSize} onChange={(e) => setBrushSize?.(Number(e.target.value))} className="w-16 h-1.5 bg-black/10 dark:bg-white/20 rounded-full appearance-none accent-blue-500 cursor-pointer" />
                        </div>
                        <div className={`hidden md:block h-5 w-[1px] mx-1 shrink-0 ${divider}`} />
                        <div className="flex items-center gap-1.5 px-1">
                          {['#22d3ee', '#10b981', '#f59e0b', '#ef4444', isLight ? '#0f172a' : '#ffffff'].map((color) => (
                            <button key={color} onClick={() => setActiveColor?.(color)} className="w-5 h-5 rounded-full border transition-transform hover:scale-110 active:scale-90" style={{ backgroundColor: color, borderColor: activeColor === color ? (isLight ? '#000' : '#fff') : 'transparent' }} />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className={`h-6 w-[1px] mx-1 shrink-0 ${divider}`} />
                    
                    <button onClick={handleUndo} className={`p-2.5 rounded-full transition-all ${btnHover}`} title="Undo"><Undo2 className="w-4 h-4" /></button>
                    <button onClick={handleRedo} className={`p-2.5 rounded-full transition-all ${btnHover}`} title="Redo"><Redo2 className="w-4 h-4" /></button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* 🟢 ZEN MODE HIDE BUTTON */}
            <motion.div layout className={`h-6 w-[1px] mx-1 shrink-0 ${divider}`} />
            <motion.button layout onClick={() => setIsHidden(true)} className={`p-2.5 rounded-full transition-all shrink-0 ${btnHover}`} title="Zen Mode"><EyeOff className="w-4 h-4 opacity-80" /></motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isHidden && (
          <motion.div initial={{ opacity: 0, scale: 0.5, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5, y: -20 }} className="fixed top-6 right-6 z-[100] pointer-events-none">
            <button onClick={() => setIsHidden(false)} className={`p-3 rounded-full shadow-2xl border transition-all hover:scale-110 active:scale-95 pointer-events-auto ${glassBg}`} title="Show Dock">
              <Eye className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}