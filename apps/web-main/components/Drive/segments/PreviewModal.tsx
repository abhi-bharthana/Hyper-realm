"use client";

import { File, Maximize2, X } from "lucide-react";

interface StorageFile {
  id: string;
  file_name: string;
  object_name: string;
  file_size: number;
  created_at: string;
}

interface PreviewModalProps {
  file: StorageFile | null;
  codeContent: string;
  loadingCode: boolean;
  onClose: () => void;
  gateway: string;
  primaryColor?: string;
}

export function PreviewModal({ file, codeContent, loadingCode, onClose, gateway, primaryColor }: PreviewModalProps) {
  if (!file) return null;

  const ext = file.file_name.split('.').pop()?.toLowerCase() || "";
  const fileUrl = `${gateway}/${file.object_name}`;

  // 🎯 FIXED: Direct Full View Preview standard without forcing immediate download rejection loops.
  // This utilizes native browser viewport capabilities for clean rendering over direct URL routing.
  const handleFullViewportView = () => {
    const previewUrl = `${gateway}/${file.object_name}`;
    const newWindow = window.open();
    if (newWindow) {
      // Disconnecting the window backreference standard prevents cross-origin data leakage crash risk
      newWindow.opener = null; 
      newWindow.location.href = previewUrl;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl bg-black border border-white/10 rounded-[2.5rem] flex flex-col h-full max-h-[85vh] overflow-hidden shadow-2xl relative">
        
        {/* Header Block Section */}
 
        <div className="w-full p-5 border-b border-white/5 flex justify-between items-center bg-zinc-950/80 backdrop-blur-md">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-white/5 border border-white/5 rounded-lg">
              <File className="w-3.5 h-3.5 text-primary" style={{ color: primaryColor }} />
            </div>
            <div className="overflow-hidden">
              <h3 className="text-xs font-black uppercase tracking-wide italic truncate pr-4 text-white">{file.file_name}</h3>
              <p className="text-[8px] font-mono opacity-40 uppercase tracking-widest mt-0.5 text-zinc-400">Ceph Archive Node Interface Buffer</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {}
            <button 
              onClick={handleFullViewportView}
              className="p-2 hover:bg-white/5 rounded-xl text-zinc-400 hover:text-white transition"
              title="Open pure full viewport preview window"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={onClose} 
              className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-xl text-zinc-400 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Embedded Content View Body */}
        <div className="flex-1 bg-black/40 p-6 flex items-center justify-center overflow-auto custom-scrollbar">
          {(() => {
            if (["png", "jpg", "jpeg", "gif", "svg", "webp", "ico"].includes(ext)) {
              return <img src={fileUrl} alt={file.file_name} className="max-w-full max-h-[60vh] object-contain rounded-2xl border border-white/5 shadow-lg shadow-black/50" />;
            }
            if (["mp4", "webm", "mkv", "mov", "ogv"].includes(ext)) {
              return <video src={fileUrl} controls autoPlay className="w-full max-w-3xl max-h-[60vh] rounded-2xl bg-black border border-white/5 shadow-2xl" />;
            }
            if (["mp3", "wav"].includes(ext)) {
              return (
                <div className="p-8 bg-zinc-900 border border-white/5 rounded-3xl w-full max-w-md text-center flex flex-col gap-4">
                  <p className="text-[10px] font-mono uppercase opacity-50 tracking-widest text-zinc-400">Audio Stream monitor Active</p>
                  <audio src={fileUrl} controls autoPlay className="w-full" />
                </div>
              );
            }
            if (ext === "pdf") {
              return <iframe src={fileUrl} className="w-full h-full min-h-[55vh] rounded-2xl border border-white/5 bg-zinc-900" />;
            }
            if (["json", "xml", "html", "css", "js", "ts", "tsx", "go", "py", "yaml", "yml", "md", "sh", "bash", "txt"].includes(ext)) {
              if (loadingCode) return <div className="text-[10px] font-mono opacity-50 animate-pulse tracking-widest text-zinc-400">STREAMING SOURCE LINES...</div>;
              return (
                <div className="w-full h-full max-h-[58vh] bg-zinc-950/80 border border-white/5 p-5 rounded-2xl overflow-auto text-left font-mono text-[11px] leading-relaxed text-zinc-300 custom-scrollbar select-text selection:bg-white/10">
                  <pre className="whitespace-pre-wrap"><code>{codeContent}</code></pre>
                </div>
              );
            }
            return (
              <div className="text-center flex flex-col items-center gap-3 max-w-xs p-6 border border-white/5 bg-white/[0.01] rounded-3xl">
                <File className="w-6 h-6 opacity-30 text-white" />
                <p className="text-[10px] font-mono opacity-40 uppercase tracking-widest text-zinc-400">Inline preview allocation unavailable for this payload extension.</p>
                <a href={fileUrl} download={file.file_name} className="px-4 py-2 bg-white text-black font-black text-[10px] font-mono rounded-xl mt-2 hover:scale-105 transition">Download Node</a>
              </div>
            );
          })()}
        </div>

      </div>
    </div>
  );
}