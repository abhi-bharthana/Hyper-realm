'use client';

import { motion } from "framer-motion";
import { NeuralEditor } from "./NeuralEditor";
import { NeuralCanvasOverlay, CanvasOverlayRef } from "./NeuralCanvasOverlay";

interface NeuralCanvasWorkspaceProps {
  isLoading: boolean;
  aspectRatio: string;
  isLight: boolean;
  activePageId: string;
  activePageContent: string;
  activeMenu: 'main' | 'text' | 'draw' | 'shapes';
  drawTool: 'pen' | 'eraser' | 'none';
  brushSize: number;
  activeColor: string;
  setPagesContent: (content: string) => void;
  setEditorInstance: (editor: any) => void;
  canvasOverlayRef: React.RefObject<CanvasOverlayRef>; 
}

export function NeuralCanvasWorkspace({
  isLoading, aspectRatio, isLight, activePageId, activePageContent,
  activeMenu, drawTool, brushSize, activeColor, setPagesContent, setEditorInstance, canvasOverlayRef
}: NeuralCanvasWorkspaceProps) {
  
  // 🍏 Apple-Grade Paper Styling
  const paperStyle = isLight 
    ? 'bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.03)]' 
    : 'bg-[#0c0c0c] shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.05)]';

  return (
    // 🚀 Exact padding calculated to perfectly balance the 64-width (256px) left sidebar!
    <div className="flex-1 w-full h-full overflow-auto z-10 pt-32 pb-40 flex flex-col items-center justify-start pl-4 md:pl-[280px] pr-4 md:pr-8 custom-scrollbar">
      
      {/* 👑 MAGIC PAPER SHEET (Now morphs smoothly using Framer Motion) */}
      <motion.div 
        layout // Smooth shape-shifting for Aspect Ratio changes!
        transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
        className={`relative flex flex-col flex-shrink-0 group transition-colors duration-700 ease-in-out
          ${paperStyle}
          ${aspectRatio === 'A4' ? 'w-[794px] min-h-[1123px] rounded-2xl' : ''}
          ${aspectRatio === '16:9' ? 'w-full max-w-[1280px] aspect-video rounded-3xl' : ''}
          ${aspectRatio === 'infinite' ? 'w-full max-w-[1600px] min-h-[calc(100vh-160px)] rounded-[2.5rem] border-dashed border-2 border-primary/20 hover:border-primary/40' : ''}
        `}
      >
        {/* Subtle inner glow for dark mode realism */}
        {!isLight && (
          <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0_0_40px_rgba(255,255,255,0.015)] transition-opacity group-hover:shadow-[inset_0_0_40px_rgba(255,255,255,0.03)]" />
        )}

        <div className="flex-1 w-full h-full relative z-10 p-4 md:p-10">
          
          {/* 🖌️ THE SEAMLESS INK VECTOR LAYER */}
          <NeuralCanvasOverlay 
            ref={canvasOverlayRef}
            isActive={activeMenu === 'draw'}
            tool={drawTool}
            color={activeColor}
            brushSize={brushSize}
          />

          {isLoading ? (
            // Premium Loading State
            <div className="flex-1 flex flex-col items-center justify-center h-full opacity-60 font-mono text-center pt-32 animate-in fade-in duration-500">
               <div className="relative flex items-center justify-center w-12 h-12 mb-6">
                 <div className="absolute w-full h-full rounded-full border-[3px] border-primary/20 border-t-primary animate-spin shadow-[0_0_20px_rgba(var(--primary),0.4)]" />
                 <div className="absolute w-8 h-8 rounded-full border-[3px] border-primary/10 border-b-primary animate-spin-reverse" />
               </div>
               <p className="text-xs uppercase tracking-[0.3em] font-black text-primary/80">Syncing Nodes...</p>
            </div>
          ) : (
            // 📝 TIPTAP TEXT ENGINE LAYER
            // pointer-events control ensures ink and text never fight for the mouse!
            <div className={`w-full h-full transition-opacity duration-300 ${activeMenu === 'draw' ? 'pointer-events-none select-none opacity-90' : 'pointer-events-auto opacity-100'}`}>
              <NeuralEditor 
                key={activePageId} 
                initialContent={activePageContent} 
                onChange={setPagesContent} 
                isLight={isLight} 
                onEditorReady={setEditorInstance} 
              />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}