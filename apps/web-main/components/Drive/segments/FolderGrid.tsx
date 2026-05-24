"use client";

import { useState } from "react";
import { Folder, MoreVertical, Trash2, Edit3, ExternalLink } from "lucide-react";

interface FolderGridProps {
  isLight: boolean;
}

// 🎯 MOCK DIRECTORY ARRAYS MATRIX (Future backend schema match target)
const INITIAL_FOLDERS = [
  { id: "dir-1", name: "System Binaries", fileCount: 42, size: "1.2 GB" },
  { id: "dir-2", name: "Neural Weights Data", fileCount: 8, size: "8.4 GB" },
  { id: "dir-3", name: "Notemate Production Packages", fileCount: 156, size: "340 MB" },
  { id: "dir-4", name: "User Encrypted Proxies", fileCount: 3, size: "12 KB" },
];

export function FolderGrid({ isLight }: FolderGridProps) {
  const [folders, setFolders] = useState(INITIAL_FOLDERS);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const deleteFolder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFolders(folders.filter(f => f.id !== id));
    setActiveMenuId(null);
  };

  return (
    <div className="w-full">
      <h3 className={`text-[10px] font-black uppercase tracking-[0.25em] mb-4 ${
        isLight ? 'text-slate-400' : 'text-zinc-500'
      }`}>
        Directories Allocation Map
      </h3>

      {/* GRID COMPONENT SYSTEM */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={`p-5 rounded-[2rem] border relative group cursor-pointer select-none transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98] ${
              isLight 
                ? 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/80 shadow-sm hover:shadow-md' 
                : 'bg-white/[0.02] hover:bg-white/[0.04] border-white/5 hover:border-white/10'
            }`}
          >
            
            {/* Folder Header Icon and Context Dropdown Trigger */}
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Folder className="w-5 h-5 text-primary" />
              </div>
              
              <button 
                onClick={(e) => toggleMenu(folder.id, e)}
                className={`p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity ${
                  isLight ? 'hover:bg-slate-200' : 'hover:bg-white/5'
                }`}
              >
                <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              {/* FLOATING DROPDOWN ACTION RING */}
              {activeMenuId === folder.id && (
                <div className={`absolute right-4 top-14 w-40 rounded-2xl border p-1.5 z-30 shadow-xl animate-in fade-in zoom-in-95 duration-150 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-zinc-950 border-white/10'
                }`}>
                  <button className={`w-full p-2 text-left rounded-xl text-[10px] font-bold uppercase tracking-wide flex items-center gap-2 ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/5'}`}>
                    <ExternalLink className="w-3 h-3 text-primary" /> Open Link
                  </button>
                  <button className={`w-full p-2 text-left rounded-xl text-[10px] font-bold uppercase tracking-wide flex items-center gap-2 ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/5'}`}>
                    <Edit3 className="w-3 h-3" /> Rename Node
                  </button>
                  <div className={`h-px my-1 ${isLight ? 'bg-slate-100' : 'bg-white/5'}`} />
                  <button 
                    onClick={(e) => deleteFolder(folder.id, e)}
                    className="w-full p-2 text-left rounded-xl text-[10px] font-black uppercase tracking-wide flex items-center gap-2 text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3 h-3" /> Purge Directory
                  </button>
                </div>
              )}
            </div>

            {/* Folder Metadata Metadata Layout Context */}
            <div className="overflow-hidden">
              <h4 className="font-black text-xs uppercase tracking-tight truncate mb-1">
                {folder.name}
              </h4>
              <div className={`flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider ${
                isLight ? 'text-slate-400' : 'text-zinc-500'
              }`}>
                <span>{folder.fileCount} Nodes</span>
                <span>•</span>
                <span>{folder.size}</span>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}