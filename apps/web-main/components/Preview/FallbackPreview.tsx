'use client';

import { FileIcon, DownloadCloud } from 'lucide-react';
import { PreviewHeader } from './PreviewHeader';

interface FallbackPreviewProps {
  fileName: string;
  onClose: () => void;
}

export function FallbackPreview({ fileName, onClose }: FallbackPreviewProps) {
  return (
    <>
      {/* Apna Glassmorphic Pill Header */}
      <PreviewHeader fileName={fileName} onClose={onClose} />
      
      {/* 📦 Fallback Card */}
      <div className="relative w-full h-full flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-5 bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-[2.5rem] shadow-2xl max-w-md text-center">
          
          <div className="p-6 bg-white/10 rounded-full border border-white/20 shadow-inner">
            <FileIcon className="w-16 h-16 text-zinc-400" />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-white tracking-wide">Preview Not Available</h3>
            <p className="text-xs font-mono text-zinc-400 mt-3 leading-relaxed">
              The neural interface cannot render <span className="text-primary font-black uppercase tracking-wider">{fileName.split('.').pop()}</span> nodes directly.
            </p>
          </div>

          <button className="mt-4 flex items-center gap-2 px-6 py-3 bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary font-mono text-xs uppercase font-bold tracking-widest rounded-full transition-all active:scale-95">
            <DownloadCloud className="w-4 h-4" />
            Download Shard
          </button>
          
        </div>
      </div>
    </>
  );
}