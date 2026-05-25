"use client";

import { X, Calendar, HardDrive, Tag, Plus } from "lucide-react";
import { useState } from "react";

interface DetailsPanelProps {
  file: any;
  onClose: () => void;
  isLight: boolean;
  onAddTag: (fileName: string, tag: string) => void;
  fileTags: Record<string, string[]>;
}

export function DetailsPanel({ file, onClose, isLight, onAddTag, fileTags }: DetailsPanelProps) {
  const [newTag, setNewTag] = useState("");
  if (!file) return null;

  const tags = fileTags[file.file_name] || [];

  const handleTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim()) {
      onAddTag(file.file_name, newTag.trim().toUpperCase());
      setNewTag("");
    }
  };

  return (
    <div className={`w-full lg:w-80 border rounded-[2.5rem] p-6 flex flex-col gap-6 shrink-0 transition-all duration-300 ${
      isLight ? 'bg-white border-slate-200/90 shadow-md' : 'bg-zinc-900/40 border-white/5 backdrop-blur-2xl'
    }`}>
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <h4 className="text-[10px] font-mono font-black uppercase tracking-widest opacity-60">Asset Diagnostics</h4>
        <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg transition"><X className="w-3.5 h-3.5" /></button>
      </div>

      <div className="overflow-hidden">
        <h3 className="font-bold text-sm uppercase italic tracking-wide truncate">{file.file_name}</h3>
        <p className="text-[7px] font-mono text-zinc-500 uppercase tracking-wider mt-1 truncate">{file.object_name}</p>
      </div>

      {/* METADATA DIAGNOSTICS TREE */}
      <div className="flex flex-col gap-3 font-mono text-[10px] uppercase tracking-wide">
        <div className={`p-3 border rounded-xl flex items-center justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'}`}>
          <span className="opacity-40 flex items-center gap-1.5"><HardDrive className="w-3 h-3" /> Size</span>
          <span className="font-bold">{(file.file_size / (1024 * 1024)).toFixed(2)} MB</span>
        </div>
        <div className={`p-3 border rounded-xl flex items-center justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'}`}>
          <span className="opacity-40 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Committed</span>
          <span className="font-bold">{new Date(file.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* 🏷️ TAGS MANAGEMENT SHARDS */}
      <div className="flex flex-col gap-3">
        <h4 className="text-[9px] font-mono font-black uppercase tracking-wider text-zinc-500">Node Tags Allocation</h4>
        <div className="flex flex-wrap gap-1.5">
          {tags.length === 0 ? (
            <span className="text-[8px] font-mono uppercase opacity-30 italic">No Tags Hooked</span>
          ) : (
            tags.map((t, idx) => (
              <span key={idx} className="px-2 py-1 bg-primary/10 border border-primary/20 text-primary font-mono text-[8px] rounded-md uppercase font-bold tracking-wider">
                {t}
              </span>
            ))
          )}
        </div>

        {/* Input Add Tag Form */}
        <form onSubmit={handleTagSubmit} className="flex gap-2 mt-2">
          <input 
            type="text" 
            placeholder="ADD NEW TAG..." 
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className={`px-3 py-1.5 border rounded-xl font-mono text-[9px] focus:outline-none w-full ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-black/20 border-white/5 text-white'
            }`}
          />
          <button type="submit" className="p-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-xl text-primary transition">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
}