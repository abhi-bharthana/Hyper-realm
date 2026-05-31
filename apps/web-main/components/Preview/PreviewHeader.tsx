'use client';
import { X, Download, Share2, Info } from 'lucide-react';

interface PreviewHeaderProps {
  fileName: string;
  onClose: () => void;
  rightControls?: React.ReactNode; // Custom controls for specific files (like zoom for images)
}

export function PreviewHeader({ fileName, onClose, rightControls }: PreviewHeaderProps) {
  return (
    <>
      {/* 🟢 Top Navigation - Pill Shaped Glassmorphism */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-white/10 border border-white/20 backdrop-blur-lg rounded-full shadow-2xl z-50">
        
        <div className="flex items-center gap-2 mr-4 border-r border-white/20 pr-4">
          <Info className="w-4 h-4 text-gray-300" />
          <span className="text-sm font-medium text-white max-w-[150px] truncate">
            {fileName}
          </span>
        </div>

        {/* Dynamic Controls based on file type */}
        {rightControls && (
          <div className="flex items-center gap-3">
            {rightControls}
          </div>
        )}

        <div className="flex items-center gap-2 ml-4 pl-4 border-l border-white/20">
          <button className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <Download className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ❌ Global Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-3 bg-white/10 border border-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all z-50"
      >
        <X className="w-6 h-6" />
      </button>
    </>
  );
}