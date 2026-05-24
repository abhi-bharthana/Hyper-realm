"use client";

import { File, Eye, Trash2, FileDown } from "lucide-react";

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
  gatewayUrl: string;
  primaryColor?: string;
  isLight: boolean;
}

export function FileRow({ file, onPreview, onDelete, gatewayUrl, primaryColor, isLight }: FileRowProps) {
  return (
    <div className={`p-4 border rounded-[1.8rem] flex justify-between items-center transition-all duration-200 group ${
      isLight ? 'bg-slate-50/40 border-slate-200/60 hover:bg-slate-100/80 text-slate-900' : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.02] text-white'
    }`}>
      <div className="flex items-center gap-3 overflow-hidden">
        <div className={`p-2.5 border rounded-xl flex items-center justify-center ${isLight ? 'bg-white border-slate-200' : 'bg-zinc-900 border-white/5'}`}>
          <File className="w-3.5 h-3.5" style={{ color: primaryColor }} />
        </div>
        <div className="overflow-hidden">
          <h4 className="font-bold text-xs uppercase italic tracking-wide truncate">{file.file_name}</h4>
          <p className={`text-[8px] font-mono uppercase tracking-widest mt-0.5 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
            Size: {(file.file_size / (1024 * 1024)).toFixed(2)} MB • {new Date(file.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button 
          onClick={() => onPreview(file)} 
          className={`p-2 border rounded-xl transition flex items-center justify-center ${isLight ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'}`}
          title="Preview File"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
        {/* 🎯 FIXED: Changed to distinct explicit FileDown icon handler matrix */}
        <a 
          href={`${gatewayUrl}/${file.object_name}`} 
          download={file.file_name} 
          className={`p-2 border rounded-xl transition flex items-center justify-center ${isLight ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'}`}
          title="Download Node"
        >
          <FileDown className="w-3.5 h-3.5" />
        </a>
        <button 
          onClick={() => onDelete(file.object_name)} 
          className={`p-2 rounded-xl transition flex items-center justify-center ${isLight ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-red-950/20 text-red-400 hover:bg-red-900/30'}`}
          title="Delete Node"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}