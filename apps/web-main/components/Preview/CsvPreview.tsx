'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import { PreviewHeader } from './PreviewHeader';
import { Info, Download, Maximize, Minimize, Loader2, Table2, HardDrive, Calendar } from 'lucide-react';

interface CsvPreviewProps {
  url: string;
  fileName: string;
  file?: any;
  onClose: () => void;
}

export function CsvPreview({ url, fileName, file, onClose }: CsvPreviewProps) {
  const [data, setData] = useState<string[][]>([]);
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
  // 📊 CSV PARSING (PAPA PARSE)
  // ==========================================
  useEffect(() => {
    const fetchAndParseCSV = async () => {
      try {
        const response = await fetch(url);
        const csvText = await response.text();
        
        // Parsing CSV (Previewing max 500 rows to keep browser ultra-fast)
        Papa.parse(csvText, {
          preview: 500, // Safe limit for previews
          skipEmptyLines: true,
          complete: (results) => {
            setData(results.data as string[][]);
            setIsLoading(false);
          },
          error: () => {
            setData([['Error parsing CSV file data.']]);
            setIsLoading(false);
          }
        });
      } catch (err) {
        setData([['Error loading network resource.']]);
        setIsLoading(false);
      }
    };
    fetchAndParseCSV();
  }, [url]);

  const formatBytes = (bytes: number = 0) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fileDate = file?.last_modified ? new Date(file.last_modified).toLocaleDateString() : 'N/A';

  return (
    <>
      {/* 🚀 CUSTOM SCROLLBAR FOR TABLE */}
      <style dangerouslySetInnerHTML={{__html: `
        .hyper-table-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .hyper-table-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); border-radius: 10px; }
        .hyper-table-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
        .hyper-table-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.4); }
      `}} />

      <div className={`fixed top-0 left-0 w-full z-[100] pointer-events-none transition-opacity duration-700 ${isIdle ? 'opacity-0' : 'opacity-100'}`}>
         <div className="pointer-events-auto">
             {!isFullscreen && <PreviewHeader fileName={fileName} onClose={onClose} />}
         </div>
      </div>
      
      <div className={`relative w-full h-full flex items-center justify-center transition-colors duration-500 select-none outline-none ${isFullscreen ? 'bg-[#0f172a] p-0' : 'p-4 md:p-8'}`}>
        
        {/* 🚀 OUTER MATRIX FRAME */}
        <div 
          ref={containerRef}
          className={`relative flex flex-col overflow-hidden transition-all duration-700 ${
            isFullscreen 
              ? 'w-full h-full rounded-none bg-[#0f172a]' 
              : 'w-full h-full max-w-6xl rounded-[1.5rem] bg-[#0f172a] shadow-[0_30px_100px_rgba(0,0,0,0.8)] ring-1 ring-white/10'
          }`}
          style={!isFullscreen ? { marginTop: '30px', maxHeight: 'calc(100vh - 120px)' } : {}}
        >
          
          {/* Header Bar */}
          <div className="w-full bg-[#1e293b] flex items-center justify-between px-6 py-4 select-none border-b border-white/5">
              <div className="flex items-center gap-3">
                  <Table2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-white/90 text-sm font-bold tracking-wide">{fileName}</span>
              </div>
              <div className="text-emerald-400/50 text-[10px] font-mono uppercase bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">
                Data Matrix (Top 500 Rows)
              </div>
          </div>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center flex-col gap-4 bg-[#0f172a]">
               <div className="relative flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                  <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full"></div>
               </div>
               <span className="text-xs font-mono uppercase tracking-[0.2em] text-white/50">Structuring Data...</span>
            </div>
          ) : (
            // 🚀 THE GLASSMORPHIC TABLE
            <div className="flex-1 w-full overflow-auto hyper-table-scrollbar relative">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead className="sticky top-0 z-20 bg-[#1e293b]/90 backdrop-blur-md shadow-md border-b border-white/10">
                        <tr>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-white/40 border-r border-white/5 w-16 text-center">#</th>
                            {data[0]?.map((header, i) => (
                                <th key={i} className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-emerald-400 border-r border-white/5 last:border-0">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {data.slice(1).map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-3 text-xs font-mono text-white/20 text-center border-r border-white/5 group-hover:text-white/50 transition-colors">
                                    {rowIndex + 1}
                                </td>
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className="px-6 py-3 text-sm text-white/70 font-medium border-r border-white/5 last:border-0">
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          )}
        </div>

        {/* 🚀 THE FLOATING TOOLBAR */}
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-black/60 backdrop-blur-2xl px-3 py-2 rounded-[2rem] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.7)] transition-all duration-700 ${
            isIdle ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0 hover:bg-black/80 hover:border-white/20 hover:scale-105'
        }`}>
            <button onClick={toggleFullScreen} className="p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition active:scale-90" title="Toggle Fullscreen">
                {isFullscreen ? <Minimize className="w-4 h-4 text-emerald-400" /> : <Maximize className="w-4 h-4" />}
            </button>

            <div className="w-px h-5 bg-white/10 mx-1"></div>
            
            <button 
                onClick={() => setShowInfo(!showInfo)} 
                className={`p-2.5 rounded-full transition active:scale-90 ${showInfo ? 'text-emerald-400 bg-emerald-400/20' : 'text-white/70 hover:text-white hover:bg-white/10'}`} 
                title="Data Metadata"
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
                    <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border-b border-white/10 pb-3">Dataset Intelligence</h3>
                    
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-3 items-start">
                            <div className="p-2 rounded-xl bg-white/5 border border-white/5"><Table2 className="w-4 h-4 text-emerald-400" /></div>
                            <div className="overflow-hidden w-full">
                                <p className="text-white/50 text-[9px] uppercase tracking-widest font-mono">Filename</p>
                                <p className="text-white/90 text-xs font-medium truncate" title={fileName}>{fileName}</p>
                            </div>
                        </div>

                        <div className="flex gap-3 items-start">
                            <div className="p-2 rounded-xl bg-white/5 border border-white/5"><HardDrive className="w-4 h-4 text-blue-400" /></div>
                            <div>
                                <p className="text-white/50 text-[9px] uppercase tracking-widest font-mono">File Size</p>
                                <p className="text-white/90 text-xs font-medium">{formatBytes(file?.size)}</p>
                            </div>
                        </div>

                        <div className="flex gap-3 items-start">
                            <div className="p-2 rounded-xl bg-white/5 border border-white/5"><Calendar className="w-4 h-4 text-purple-400" /></div>
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
                        <Download className="w-4 h-4" /> Download Dataset
                    </a>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </>
  );
}