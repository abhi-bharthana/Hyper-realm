"use client";

import React from "react";
// 🎯 Mapped all precise feature icons from lucide-react
import { File, Eye, Trash2, FileDown, ArrowRightLeft, Copy, Edit3, Info } from "lucide-react";

interface StorageFile {
  id: string;
  file_name: string;
  object_name: string;
  file_size: number;
  created_at: string;
}

interface FileRowProps {
  file: StorageFile;
  onPreview: (file: StorageFile) => void;
  onDelete: (objectKey: string) => void;
  onMoveClick: (file: StorageFile) => void;
  onCopyClick: (file: StorageFile) => void;       // 🎯 ADDED
  onRenameClick: (file: StorageFile) => void;     // 🎯 ADDED
  onDetailsClick: (file: StorageFile) => void;    // 🎯 ADDED
  gatewayUrl: string;
  primaryColor?: string;
  isLight: boolean;
}

// 🎯 OPTIMIZATION LOCK: Fully extended matrix cache with new interactive parameters
export const FileRow = React.memo(function FileRow({ 
  file, 
  onPreview, 
  onDelete, 
  onMoveClick,
  onCopyClick,
  onRenameClick,
  onDetailsClick,
  gatewayUrl, 
  primaryColor, 
  isLight 
}: FileRowProps) {
  return (
    <div className={`p-4 border rounded-[1.8rem] flex justify-between items-center transition-all duration-200 transform-gpu content-visibility-auto ${
      isLight ? 'bg-slate-50/40 border-slate-200/60 hover:bg-slate-100/80 text-slate-900' : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.02] text-white'
    }`}>
      {/* Asset Meta Info Block */}
      <div className="flex items-center gap-3 overflow-hidden">
        <div className={`p-2.5 border rounded-xl flex items-center justify-center ${isLight ? 'bg-white border-slate-200' : 'bg-zinc-900 border-white/5'}`}>
          <File className="w-3.5 h-3.5" style={{ color: primaryColor }} />
        </div>
        <div className="overflow-hidden">
          <h4 className="font-bold text-xs uppercase italic tracking-wide truncate max-w-[150px] sm:max-w-xs">{file.file_name}</h4>
          <p className={`text-[8px] font-mono uppercase tracking-widest mt-0.5 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
            {(file.file_size / (1024 * 1024)).toFixed(2)} MB • {new Date(file.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* 🛠️ HYPER CONTROL ACTIONS BUTTON CONSOLE */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Preview Stream Button */}
        <button onClick={() => onPreview(file)} className={`p-2 border rounded-xl transition-all active:scale-95 ${isLight ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'}`} title="Preview Shard"><Eye className="w-3.5 h-3.5" /></button>
        
        {/* 🎯 View Details / Diagnostic Side-Panel Trigger */}
        <button onClick={() => onDetailsClick(file)} className={`p-2 border rounded-xl transition-all active:scale-95 ${isLight ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'}`} title="Asset Diagnostic Details"><Info className="w-3.5 h-3.5" /></button>
        
        {/* Relocate Node / Move Button */}
        <button onClick={() => onMoveClick(file)} className={`p-2 border rounded-xl transition-all active:scale-95 flex items-center justify-center ${isLight ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'}`} title="Move Node Path"><ArrowRightLeft className="w-3.5 h-3.5" /></button>
        
        {/* 🎯 Create Duplicate Replica / Copy Button */}
        <button onClick={() => { if(confirm("Create asset duplicate shard?")) onCopyClick(file); }} className={`p-2 border rounded-xl transition-all active:scale-95 flex items-center justify-center ${isLight ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'}`} title="Copy Asset Replica"><Copy className="w-3.5 h-3.5" /></button>
        
        {/* 🎯 Node Alias Mutation / Rename Button */}
        <button onClick={() => onRenameClick(file)} className={`p-2 border rounded-xl transition-all active:scale-95 flex items-center justify-center ${isLight ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'}`} title="Rename Shard Object"><Edit3 className="w-3.5 h-3.5" /></button>
        
        {/* Native Download Anchor Node */}
        <a href={`${gatewayUrl}/${file.object_name}`} download={file.file_name} className={`p-2 border rounded-xl transition-all active:scale-95 flex items-center justify-center ${isLight ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'}`} title="Download Payload"><FileDown className="w-3.5 h-3.5" /></a>
        
        {/* Hard Termination / Delete Button */}
        <button onClick={() => onDelete(file.object_name)} className={`p-2 rounded-xl transition-all active:scale-95 ${isLight ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-red-950/20 text-red-400 hover:bg-red-900/30'}`} title="Purge Node Reference"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // 🎯 STRICT OPTIMIZED RENDER EVALUATION: Map equality bounds across all conditional execution triggers
  return prevProps.file.id === nextProps.file.id && 
         prevProps.file.file_name === nextProps.file.file_name && 
         prevProps.file.file_size === nextProps.file.file_size &&
         prevProps.isLight === nextProps.isLight &&
         prevProps.onMoveClick === nextProps.onMoveClick &&
         prevProps.onCopyClick === nextProps.onCopyClick &&
         prevProps.onRenameClick === nextProps.onRenameClick &&
         prevProps.onDetailsClick === nextProps.onDetailsClick;
});