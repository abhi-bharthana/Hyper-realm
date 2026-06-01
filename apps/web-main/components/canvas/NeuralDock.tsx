'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Type, Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
  PenTool, Eraser, Palette, Circle, Square, ChevronLeft, Undo2, Redo2,
  Sliders, MousePointer2
} from 'lucide-react';
import { CanvasOverlayRef } from './NeuralCanvasOverlay'; // 🚀 LIFTED REF FOR UNDO/REDO

interface NeuralDockProps {
  editor: any; 
  isLight: boolean;
  activeMenu: 'main' | 'text' | 'draw' | 'shapes';
  setActiveMenu: (menu: any) => void;
  drawTool: 'pen' | 'eraser' | 'none';
  setDrawTool: (tool: any) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  activeColor: string;
  setActiveColor: (color: string) => void;
  canvasOverlayRef: React.RefObject<CanvasOverlayRef>; // 🚀 THE PIPELINE
}

type SubMenu = 'none' | 'heading' | 'brush' | 'color';

export function NeuralDock({ 
  editor, isLight, activeMenu, setActiveMenu, drawTool, setDrawTool, 
  brushSize, setBrushSize, activeColor, setActiveColor, canvasOverlayRef 
}: NeuralDockProps) {
  
  const [subMenu, setSubMenu] = useState<SubMenu>('none');

  if (!editor) return null;

  const goBackToMain = () => {
    setActiveMenu('main');
    setDrawTool('none');
    setSubMenu('none');
  };

  // 👑 SMART CONTEXT-AWARE UNDO/REDO ENGINE
  const handleUndo = () => {
    if (activeMenu === 'draw' || activeMenu === 'shapes') canvasOverlayRef.current?.undo();
    else editor?.chain().focus().undo().run();
  };

  const handleRedo = () => {
    if (activeMenu === 'draw' || activeMenu === 'shapes') canvasOverlayRef.current?.redo();
    else editor?.chain().focus().redo().run();
  };

  // 🍏 APPLE-STYLE GLASSMORPHISM THEMEING
  const popoverBg = isLight 
    ? 'bg-white/80 border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)] text-slate-800 backdrop-blur-3xl' 
    : 'bg-[#1c1c1e]/80 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] text-white backdrop-blur-3xl';

  const dockBg = isLight
    ? 'bg-white/70 border-white/50 shadow-[0_8px_40px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.6)] text-slate-800 backdrop-blur-3xl'
    : 'bg-[#2c2c2e]/70 border-white/10 shadow-[0_10px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] text-white backdrop-blur-3xl';

  const btnHover = isLight
    ? 'hover:bg-black/5 text-slate-700 active:bg-black/10 active:scale-95'
    : 'hover:bg-white/10 text-white/90 active:bg-white/20 active:scale-95';

  const activeBtnBg = isLight ? 'bg-black text-white shadow-md' : 'bg-white text-black shadow-lg';
  const divider = isLight ? 'bg-black/10' : 'bg-white/15';

  // Apple like spring animations
  const springConfig = { type: "spring", stiffness: 500, damping: 30, mass: 1 };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[90] flex flex-col items-center gap-3 pointer-events-auto">
      
      {/* 🚀 LEVEL-3 EXPANSION POPUPS (Floating Pill) */}
      <AnimatePresence>
        {subMenu !== 'none' && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={springConfig}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-[1.25rem] border ${popoverBg}`}
          >
            {subMenu === 'heading' && (
              <>
                <button onClick={() => { editor.chain().focus().toggleHeading({ level: 1 }).run(); setSubMenu('none'); }} className={`p-2 rounded-xl transition-all ${editor.isActive('heading', { level: 1 }) ? activeBtnBg : btnHover}`}><Heading1 className="w-4 h-4" /></button>
                <button onClick={() => { editor.chain().focus().toggleHeading({ level: 2 }).run(); setSubMenu('none'); }} className={`p-2 rounded-xl transition-all ${editor.isActive('heading', { level: 2 }) ? activeBtnBg : btnHover}`}><Heading2 className="w-4 h-4" /></button>
                <button onClick={() => { editor.chain().focus().toggleHeading({ level: 3 }).run(); setSubMenu('none'); }} className={`p-2 rounded-xl transition-all ${editor.isActive('heading', { level: 3 }) ? activeBtnBg : btnHover}`}><Heading3 className="w-4 h-4" /></button>
              </>
            )}

            {subMenu === 'brush' && (
              <div className="flex items-center gap-3 px-3 py-1">
                <Sliders className={`w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-white/40'}`} />
                <input type="range" min="1" max="25" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-28 h-1.5 bg-black/10 dark:bg-white/20 rounded-full appearance-none accent-blue-500 cursor-pointer" />
                <span className="text-[10px] font-mono w-4 font-bold opacity-70">{brushSize}</span>
              </div>
            )}

            {subMenu === 'color' && (
              <div className="flex items-center gap-2 px-1">
                {['#22d3ee', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', isLight ? '#0f172a' : '#ffffff'].map((color) => (
                  <button key={color} onClick={() => { setActiveColor(color); setSubMenu('none'); }} className="w-6 h-6 rounded-full border transition-transform hover:scale-110 active:scale-95 relative" style={{ backgroundColor: color, borderColor: activeColor === color ? (isLight ? '#000' : '#fff') : 'rgba(0,0,0,0.1)' }}>
                    {activeColor === color && <span className={`absolute inset-1 rounded-full ${isLight ? 'bg-white/40' : 'bg-black/30'}`} />}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 👑 THE MASTER MORPHING DOCK (Apple PencilKit Style) */}
      <motion.div layout transition={springConfig} className={`flex items-center p-1.5 rounded-[2rem] border ${dockBg}`}>
        
        {/* DYNAMIC LEFT MENU SECTION */}
        <div className="flex items-center">
          <AnimatePresence mode="wait">
            
            {activeMenu === 'main' && (
              <motion.div key="main" className="flex items-center gap-1 px-1" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}>
                <button onClick={() => setActiveMenu('text')} className={`p-3 rounded-2xl transition-all ${btnHover}`} title="Text Mode"><Type className="w-5 h-5 text-blue-500" /></button>
                <button onClick={() => { setActiveMenu('draw'); setDrawTool('pen'); }} className={`p-3 rounded-2xl transition-all ${btnHover}`} title="Markup"><PenTool className="w-5 h-5 text-emerald-500" /></button>
                <button onClick={() => setActiveMenu('shapes')} className={`p-3 rounded-2xl transition-all ${btnHover}`} title="Geometry"><Circle className="w-5 h-5 text-purple-500" /></button>
              </motion.div>
            )}

            {activeMenu === 'text' && (
              <motion.div key="text" className="flex items-center gap-1 px-1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <button onClick={goBackToMain} className={`p-2.5 rounded-2xl transition-all ${btnHover}`}><ChevronLeft className="w-5 h-5" /></button>
                <div className={`w-[1px] h-6 ${divider} mx-1`} />
                <button onClick={() => setSubMenu(subMenu === 'heading' ? 'none' : 'heading')} className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${subMenu === 'heading' ? activeBtnBg : btnHover}`}>Aa</button>
                <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2.5 rounded-2xl transition-all ${editor.isActive('bold') ? activeBtnBg : btnHover}`}><Bold className="w-4 h-4" /></button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2.5 rounded-2xl transition-all ${editor.isActive('italic') ? activeBtnBg : btnHover}`}><Italic className="w-4 h-4" /></button>
                <button onClick={() => editor.chain().focus().toggleCode().run()} className={`p-2.5 rounded-2xl transition-all ${editor.isActive('code') ? activeBtnBg : btnHover}`}><Code className="w-4 h-4" /></button>
              </motion.div>
            )}

            {activeMenu === 'draw' && (
              <motion.div key="draw" className="flex items-center gap-1 px-1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <button onClick={goBackToMain} className={`p-2.5 rounded-2xl transition-all ${btnHover}`} title="Exit Markup"><MousePointer2 className="w-4 h-4" /></button>
                <div className={`w-[1px] h-6 ${divider} mx-1`} />
                
                {/* Pen & Eraser Toggle like Apple Pencil */}
                <button onClick={() => setDrawTool('pen')} className={`p-2.5 rounded-2xl transition-all ${drawTool === 'pen' ? activeBtnBg : btnHover}`}><PenTool className={`w-4 h-4 ${drawTool === 'pen' ? '' : 'text-emerald-500'}`} /></button>
                <button onClick={() => setDrawTool('eraser')} className={`p-2.5 rounded-2xl transition-all ${drawTool === 'eraser' ? activeBtnBg : btnHover}`}><Eraser className={`w-4 h-4 ${drawTool === 'eraser' ? '' : 'text-pink-500'}`} /></button>
                
                <div className={`w-[1px] h-6 ${divider} mx-1`} />
                <button onClick={() => setSubMenu(subMenu === 'brush' ? 'none' : 'brush')} className={`p-2.5 rounded-2xl transition-all ${subMenu === 'brush' ? activeBtnBg : btnHover}`}><Sliders className="w-4 h-4" /></button>
                <button onClick={() => setSubMenu(subMenu === 'color' ? 'none' : 'color')} className={`p-2.5 rounded-2xl transition-all flex items-center justify-center ${btnHover}`}><Palette className="w-4 h-4 mr-1.5 opacity-50" /><div className="w-3.5 h-3.5 rounded-full shadow-sm border border-black/20" style={{ backgroundColor: activeColor }} /></button>
              </motion.div>
            )}

            {activeMenu === 'shapes' && (
              <motion.div key="shapes" className="flex items-center gap-1 px-1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <button onClick={goBackToMain} className={`p-2.5 rounded-2xl transition-all ${btnHover}`}><ChevronLeft className="w-5 h-5" /></button>
                <div className={`w-[1px] h-6 ${divider} mx-1`} />
                <button className={`p-2.5 rounded-2xl ${btnHover}`}><Square className="w-4 h-4" /></button>
                <button className={`p-2.5 rounded-2xl ${btnHover}`}><Circle className="w-4 h-4" /></button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 🚀 PERSISTENT UNDO/REDO SECTION (Always accessible) */}
        <div className="flex items-center pl-2 ml-1 border-l border-black/10 dark:border-white/10">
          <button onClick={handleUndo} className={`p-2.5 rounded-2xl transition-all ${btnHover}`} title="Undo"><Undo2 className="w-4 h-4 opacity-70" /></button>
          <button onClick={handleRedo} className={`p-2.5 rounded-2xl transition-all ${btnHover}`} title="Redo"><Redo2 className="w-4 h-4 opacity-70" /></button>
        </div>

      </motion.div>
    </div>
  );
}