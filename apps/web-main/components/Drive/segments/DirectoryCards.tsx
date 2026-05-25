"use client";

import React from "react";
import { Folder, Edit2, ArrowRightLeft, Trash2 } from "lucide-react";

interface StorageFolder {
  name: string;
}

interface DirectoryCardsProps {
  directories: StorageFolder[];
  onNavigate: (name: string) => void;
  onDirRename: (name: string) => void;
  onDirMove: (name: string) => void;
  onDirDelete: (name: string) => void;
  primaryColor?: string;
  isLight: boolean;
}

export const DirectoryCards = React.memo(function DirectoryCards({ 
  directories, onNavigate, onDirRename, onDirMove, onDirDelete, primaryColor, isLight 
}: DirectoryCardsProps) {
  if (directories.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6 w-full">
      {directories.map((dir, i) => (
        <div 
          key={i}
          className={`p-4 border rounded-[2rem] flex items-center justify-between transition-all duration-200 group transform-gpu ${
            isLight ? 'bg-slate-50/50 border-slate-200 hover:bg-slate-100' : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.02]'
          }`}
        >
          {/* Clickable Area for Navigation */}
          <div onClick={() => onNavigate(dir.name)} className="flex items-center gap-3 cursor-pointer overflow-hidden flex-1">
            <div className={`p-2.5 border rounded-xl ${isLight ? 'bg-white border-slate-200' : 'bg-zinc-950 border-white/5'}`}>
              <Folder className="w-4 h-4" style={{ color: primaryColor }} />
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-xs uppercase tracking-wide truncate group-hover:underline">{dir.name}</h4>
              <p className="text-[8px] font-mono uppercase text-zinc-500 tracking-widest mt-0.5">Partition Node</p>
            </div>
          </div>

          {/* Directory Actions Overlay Menu Toolbar */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
            <button onClick={(e) => { e.stopPropagation(); onDirRename(dir.name); }} className={`p-1.5 rounded-lg border ${isLight ? 'bg-white border-slate-200 hover:bg-slate-50' : 'bg-zinc-900 border-white/5 hover:bg-white/5'}`} title="Rename Folder"><Edit2 className="w-3 h-3 text-zinc-400 hover:text-white" /></button>
            <button onClick={(e) => { e.stopPropagation(); onDirMove(dir.name); }} className={`p-1.5 rounded-lg border ${isLight ? 'bg-white border-slate-200 hover:bg-slate-50' : 'bg-zinc-900 border-white/5 hover:bg-white/5'}`} title="Move Folder"><ArrowRightLeft className="w-3 h-3 text-zinc-400 hover:text-white" /></button>
            <button onClick={(e) => { e.stopPropagation(); onDirDelete(dir.name); }} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20" title="Delete Folder Tree"><Trash2 className="w-3 h-3 text-red-400" /></button>
          </div>
        </div>
      ))}
    </div>
  );
}, (prev, next) => prev.directories.length === next.directories.length && prev.isLight === next.isLight);