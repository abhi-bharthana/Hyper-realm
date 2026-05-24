"use client";

import { ArrowLeft, FolderPlus } from "lucide-react";

interface NavigationHeaderProps {
  currentFolder: string;
  onNavigateBack: () => void;
  onCreateFolderClick: () => void;
  primaryColor?: string;
  isLight: boolean;
}

export function NavigationHeader({ currentFolder, onNavigateBack, onCreateFolderClick, primaryColor, isLight }: NavigationHeaderProps) {
  return (
    <div className="w-full flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-white/5 mb-5">
      <div className="flex items-center gap-3 overflow-hidden">
        {currentFolder && (
          <button 
            onClick={onNavigateBack} 
            className={`p-2 border rounded-xl transition-all active:scale-95 ${
              isLight ? 'bg-white border-slate-200 hover:bg-slate-100 text-slate-800' : 'bg-zinc-900 border-white/5 hover:bg-white/10 text-white'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        )}
        <h3 className={`text-[10px] font-mono uppercase tracking-widest truncate ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
          Namespace: <span className={`font-black italic ${isLight ? 'text-slate-900' : 'text-white'}`}>/root{currentFolder ? `/${currentFolder}` : ""}</span>
        </h3>
      </div>

      <button 
        onClick={onCreateFolderClick} 
        className={`px-4 py-2 border rounded-xl transition-all active:scale-95 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest ${
          isLight ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800 shadow-sm' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
        }`}
      >
        <FolderPlus className="w-3.5 h-3.5" style={{ color: primaryColor }} /> Create Directory
      </button>
    </div>
  );
}