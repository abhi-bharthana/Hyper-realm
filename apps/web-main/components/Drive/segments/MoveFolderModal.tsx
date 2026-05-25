"use client";

import { Folder, X, ArrowRightLeft } from "lucide-react";

interface StorageFolder {
  name: string;
}

interface MoveFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  directories: StorageFolder[];
  currentFolder: string;
  onConfirmMove: (targetFolder: string) => Promise<void>;
  isLight: boolean;
}

export function MoveFolderModal({ isOpen, onClose, directories, currentFolder, onConfirmMove, isLight }: MoveFolderModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
      <div className={`w-full max-w-md border p-6 rounded-[2.5rem] flex flex-col gap-4 shadow-2xl ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-950 border-white/10 text-white'
      }`}>
        
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <h4 className="text-xs font-black uppercase tracking-wider italic flex items-center gap-2">
            <ArrowRightLeft className="w-3.5 h-3.5 text-primary" /> Relocate Object Asset Shard
          </h4>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg transition opacity-60 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className={`text-[9px] font-mono uppercase tracking-wide opacity-50 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
          Select destination partition zone node structure:
        </p>

        {/* Directory Navigation Selector Stack */}
        <div className="flex flex-col gap-1.5 max-h-[250px] overflow-y-auto custom-scrollbar my-2">
          
          {/* Option 1: Root Folder standard navigation anchor */}
          {currentFolder !== "" && (
            <button
              onClick={() => onConfirmMove("")}
              className={`w-full p-3 border rounded-xl flex items-center gap-3 transition-all text-left text-xs font-mono font-bold uppercase ${
                isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-200' : 'bg-zinc-900/40 border-white/5 hover:bg-white/5'
              }`}
            >
              <Folder className="w-3.5 h-3.5 text-primary" />
              <span>/root (Move Out to Base)</span>
            </button>
          )}

          {/* Child directories dynamic map render options */}
          {directories.length === 0 ? (
            <div className="p-6 text-center text-[10px] font-mono opacity-40 uppercase tracking-widest border border-dashed border-white/5 rounded-xl">
              No Sub-Nodes allocated in this segment
            </div>
          ) : (
            directories.map((dir, i) => (
              <button
                key={i}
                onClick={() => onConfirmMove(dir.name)}
                className={`w-full p-3 border rounded-xl flex items-center gap-3 transition-all text-left text-xs ${
                  isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 font-semibold' : 'bg-zinc-900/40 border-white/5 hover:bg-white/5'
                }`}
              >
                <Folder className="w-3.5 h-3.5 opacity-60" />
                <span className="truncate">{dir.name}</span>
              </button>
            ))
          )}
        </div>

        <div className="flex gap-2 justify-end text-[10px] font-mono uppercase tracking-widest mt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 opacity-50 hover:opacity-100">Cancel</button>
        </div>
      </div>
    </div>
  );
}