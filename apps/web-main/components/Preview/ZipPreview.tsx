'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import JSZip from 'jszip';
import { PreviewHeader } from './PreviewHeader';
import { Info, Download, Maximize, Minimize, Loader2, Archive, Folder, File as FileIcon, HardDrive, Calendar } from 'lucide-react';

interface ZipPreviewProps {
  url: string;
  fileName: string;
  file?: any;
  onClose: () => void;
}

interface ZipEntry {
  name: string;
  dir: boolean;
  size: number;
  date: Date;
  path: string;
}

export function ZipPreview({ url, fileName, file, onClose }: ZipPreviewProps) {
  const [entries, setEntries] = useState<ZipEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // 🚀 IDLE TIMER & FULLSCREEN
  // ==========================================
  useEffect(() => {
    const resetIdle = () => {
      setIsIdle(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (!showInfo) timeoutRef.current = setTimeout(() => setIsIdle(true), 2500);
    };
    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('touchstart', resetIdle);
    resetIdle();
    return () => { window.removeEventListener('mousemove', resetIdle); clearTimeout(timeoutRef.current!); };
  }, [showInfo]);

  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFs);
    return () => document.removeEventListener('fullscreenchange', handleFs);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.parentElement?.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  // ==========================================
  // 📦 X-RAY ZIP PARSING (JSZip)
  // ==========================================
  useEffect(() => {
    const fetchAndParseZip = async () => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        
        const zip = new JSZip();
        const contents = await zip.loadAsync(arrayBuffer);
        
        const fileList: ZipEntry[] = [];
        contents.forEach((relativePath, zipEntry) => {
          // Uncompressed size is trickier in browser JSZip, but we can get it from internal data if available, 
          // or just show it as a structural tree. We'll capture basic metadata.
          fileList.push({
            name: zipEntry.name,
            dir: zipEntry.dir,
            // @ts-ignore - internal property hack for uncompressed size
            size: zipEntry._data?.uncompressedSize || 0, 
            date: zipEntry.date,
            path: relativePath
          });
        });
        
        // Sort: Folders first, then alphabetically
        fileList.sort((a, b) => {
            if (a.dir === b.dir) return a.name.localeCompare(b.name);
            return a.dir ? -1 : 1;
        });

        setEntries(fileList);
      } catch (err) {
        console.error("ZIP Parse Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndParseZip();
  }, [url]);

  const formatBytes = (bytes: number = 0) => {
    if (bytes === 0) return '--';
    const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fileDate = file?.last_modified ? new Date(file.last_modified).toLocaleDateString() : 'N/A';

  return (
    <>
      {/* 🚀 CUSTOM SCROLLBAR */}
      <style dangerouslySetInnerHTML={{__html: `
        .hyper-zip-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .hyper-zip-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .hyper-zip-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .hyper-zip-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(192, 132, 252, 0.5); }
      `}} />

      <div className={`fixed top-0 left-0 w-full z-[100] pointer-events-none transition-opacity duration-700 ${isIdle ? 'opacity-0' : 'opacity-100'}`}>
         <div className="pointer-events-auto">
             {!isFullscreen && <PreviewHeader fileName={fileName} onClose={onClose} />}
         </div>
      </div>
      
      <div className={`relative w-full h-full flex items-center justify-center transition-colors duration-500 select-none outline-none ${isFullscreen ? 'bg-[#090514] p-0' : 'p-4 md:p-8'}`}>
        
        {/* 🚀 OUTER ARCHIVE FRAME (Deep Purple Theme) */}
        <div 
          ref={containerRef}
          className={`relative flex flex-col overflow-hidden transition-all duration-700 ${
            isFullscreen 
              ? 'w-full h-full rounded-none bg-[#090514]' 
              : 'w-full h-full max-w-4xl rounded-[2rem] bg-[#090514] shadow-[0_0_120px_rgba(147,51,234,0.15)] ring-1 ring-purple-500/20'
          }`}
          style={!isFullscreen ? { marginTop: '30px', maxHeight: 'calc(100vh - 120px)' } : {}}
        >
          
          {/* Header Bar */}
          <div className="w-full bg-[#130b29] flex items-center justify-between px-6 py-4 select-none border-b border-purple-500/20">
              <div className="flex items-center gap-3">
                  <Archive className="w-5 h-5 text-purple-400" />
                  <span className="text-white/90 text-sm font-bold tracking-wide">{fileName}</span>
              </div>
              <div className="text-purple-400/60 text-[10px] font-mono uppercase bg-purple-400/10 px-2 py-1 rounded border border-purple-500/20">
                Package X-Ray
              </div>
          </div>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center flex-col gap-4 bg-[#090514]">
               <div className="relative flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                  <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full"></div>
               </div>
               <span className="text-xs font-mono uppercase tracking-[0.2em] text-white/50">Scanning Archive...</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-white/40 font-mono text-sm">
                Package is empty or corrupted.
            </div>
          ) : (
            // 🚀 THE FILE TREE RENDERER
            <div className="flex-1 w-full overflow-y-auto hyper-zip-scrollbar p-2 md:p-6 relative">
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
                    {entries.map((entry, idx) => {
                        // Calculate indentation based on slashes in path for a fake "tree" look
                        const depth = (entry.name.match(/\//g) || []).length - (entry.dir ? 1 : 0);
                        const paddingLeft = Math.max(1, depth * 2) + 'rem';
                        const displayName = entry.name.split('/').filter(Boolean).pop(); // Get actual file/folder name

                        return (
                            <div 
                                key={idx} 
                                className="flex items-center justify-between px-6 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group"
                                style={{ paddingLeft }}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    {entry.dir ? (
                                        <Folder className="w-4 h-4 text-purple-400 flex-shrink-0 fill-purple-400/20" />
                                    ) : (
                                        <FileIcon className="w-4 h-4 text-white/40 flex-shrink-0" />
                                    )}
                                    <span className={`text-sm truncate ${entry.dir ? 'text-white font-medium' : 'text-white/70 font-mono'}`}>
                                        {displayName}
                                    </span>
                                </div>
                                {!entry.dir && (
                                    <span className="text-[10px] font-mono text-white/30 group-hover:text-purple-300/60 transition-colors ml-4 whitespace-nowrap">
                                        {formatBytes(entry.size)}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
          )}
        </div>

        {/* 🚀 THE FLOATING TOOLBAR */}
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-black/60 backdrop-blur-2xl px-3 py-2 rounded-[2rem] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.7)] transition-all duration-700 ${
            isIdle ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0 hover:bg-black/80 hover:border-white/20 hover:scale-105'
        }`}>
            <button onClick={toggleFullScreen} className="p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition active:scale-90" title="Toggle Fullscreen">
                {isFullscreen ? <Minimize className="w-4 h-4 text-purple-400" /> : <Maximize className="w-4 h-4" />}
            </button>

            <div className="w-px h-5 bg-white/10 mx-1"></div>
            
            <button 
                onClick={() => setShowInfo(!showInfo)} 
                className={`p-2.5 rounded-full transition active:scale-90 ${showInfo ? 'text-purple-400 bg-purple-400/20' : 'text-white/70 hover:text-white hover:bg-white/10'}`} 
                title="Archive Metadata"
            >
                <Info className="w-4 h-4" />
            </button>
        </div>

        {/* 🚀 METADATA PANEL */}
        <AnimatePresence>
            {showInfo && !isLoading && (
                <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className={`absolute right-6 md:right-10 z-[60] w-72 bg-black/70 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] ${
                      isFullscreen ? 'top-10' : 'top-24'
                    }`}
                >
                    <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border-b border-white/10 pb-3">Package Intelligence</h3>
                    
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-3 items-start">
                            <div className="p-2 rounded-xl bg-white/5 border border-white/5"><Archive className="w-4 h-4 text-purple-400" /></div>
                            <div className="overflow-hidden w-full">
                                <p className="text-white/50 text-[9px] uppercase tracking-widest font-mono">Filename</p>
                                <p className="text-white/90 text-xs font-medium truncate" title={fileName}>{fileName}</p>
                            </div>
                        </div>

                        <div className="flex gap-3 items-start">
                            <div className="p-2 rounded-xl bg-white/5 border border-white/5"><HardDrive className="w-4 h-4 text-blue-400" /></div>
                            <div>
                                <p className="text-white/50 text-[9px] uppercase tracking-widest font-mono">Package Size</p>
                                <p className="text-white/90 text-xs font-medium">{formatBytes(file?.size)}</p>
                            </div>
                        </div>

                        <div className="flex gap-3 items-start">
                            <div className="p-2 rounded-xl bg-white/5 border border-white/5"><Calendar className="w-4 h-4 text-emerald-400" /></div>
                            <div>
                                <p className="text-white/50 text-[9px] uppercase tracking-widest font-mono">Ingested On</p>
                                <p className="text-white/90 text-xs font-medium">{fileDate}</p>
                            </div>
                        </div>
                    </div>

                    <a 
                        href={url} 
                        download={fileName} 
                        target="_blank"
                        className="mt-6 w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold py-3 rounded-xl transition-all active:scale-95"
                    >
                        <Download className="w-4 h-4" /> Download Package
                    </a>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </>
  );
}