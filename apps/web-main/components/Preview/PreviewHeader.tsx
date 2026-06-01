'use client';

import { useEffect } from 'react';
import { X, Download, Share2, Info } from 'lucide-react';

interface PreviewHeaderProps {
  fileName: string;
  onClose: () => void;
  rightControls?: React.ReactNode; // Custom controls for specific files
}

export function PreviewHeader({ fileName, onClose, rightControls }: PreviewHeaderProps) {
  
  // 🚀 Esc Key Controller
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <>
      {/* 🟢 Top Navigation - Pill Shaped Glassmorphism (Dead Center) */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-black/60 border border-white/10 backdrop-blur-2xl rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.5)] z-50 pointer-events-auto transition-transform duration-300">
        
        <div className="flex items-center gap-2 mr-2 md:mr-4 border-r border-white/10 pr-4">
          <Info className="w-4 h-4 text-white/50" />
          <span className="text-sm font-medium text-white/90 max-w-[150px] md:max-w-xs truncate">
            {fileName}
          </span>
        </div>

        {/* Dynamic Controls based on file type */}
        {rightControls && (
          <div className="flex items-center gap-3">
            {rightControls}
          </div>
        )}

        <div className="flex items-center gap-2 ml-2 md:ml-4 pl-4 border-l border-white/10">
          <button className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-95" title="Download Asset">
            <Download className="w-5 h-5" />
          </button>
          <button className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-95" title="Share Asset">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ❌ Global Close Button (Top Right Anchor) */}
      <button 
        onClick={onClose}
        title="Close (Esc)"
        className="absolute top-6 right-6 md:right-10 p-3 bg-black/60 border border-white/10 backdrop-blur-2xl rounded-full text-white/70 hover:text-white hover:bg-red-500/80 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all duration-300 active:scale-90 z-50 pointer-events-auto shadow-[0_10px_30px_rgba(0,0,0,0.5)] group"
      >
        <X className="w-5 h-5 group-hover:text-white transition-colors" />
      </button>
    </>
  );
}