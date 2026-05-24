"use client";

import { Folder } from "lucide-react";

interface StorageFolder {
  name: string;
  node_count: number;
  total_size: number;
}

interface DirectoryCardsProps {
  directories: StorageFolder[];
  onNavigate: (name: string) => void;
  primaryColor?: string;
  isLight: boolean;
}

export function DirectoryCards({ directories, onNavigate, primaryColor, isLight }: DirectoryCardsProps) {
  if (directories.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
      {directories.map((dir, i) => (
        <div 
          key={i} 
          onClick={() => onNavigate(dir.name)} 
          className={`p-4 border rounded-[1.8rem] transition-all duration-200 cursor-pointer group flex flex-col gap-3 ${
            isLight ? 'bg-slate-50/50 border-slate-200/60 hover:bg-slate-100 text-slate-800' : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03] text-white'
          }`}
        >
          <div className={`p-2.5 border w-max rounded-xl ${isLight ? 'bg-white border-slate-200' : 'bg-zinc-950 border-white/5'}`}>
            <Folder className="w-3.5 h-3.5" style={{ color: primaryColor }} />
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-xs uppercase tracking-wide group-hover:underline truncate">{dir.name}</h4>
            <p className={`text-[8px] font-mono uppercase tracking-widest mt-0.5 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>Partition Folder</p>
          </div>
        </div>
      ))}
    </div>
  );
}