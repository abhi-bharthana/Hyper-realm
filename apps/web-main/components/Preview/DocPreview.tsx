'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import mammoth from 'mammoth';
import { PreviewHeader } from './PreviewHeader';
import { Info, Download, Maximize, Minimize, Loader2, FileText, HardDrive, Calendar, Moon, Sun } from 'lucide-react';

interface DocPreviewProps {
  url: string;
  fileName: string;
  file?: any;
  onClose: () => void;
}

export function DocPreview({ url, fileName, file, onClose }: DocPreviewProps) {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // 🚀 Naya State: Dark Mode / Light Mode reading ke liye
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
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
  // 📝 DOCX PARSING
  // ==========================================
  useEffect(() => {
    const fetchAndConvert = async () => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setContent(result.value);
      } catch (err) {
        setContent('<div class="error-msg">Error loading document. The file might be corrupted.</div>');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndConvert();
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
      {/* 🚀 CUSTOM TYPOGRAPHY & SCROLLBAR (Editorial Look) */}
      <style dangerouslySetInnerHTML={{__html: `
        .hyper-doc-content {
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          line-height: 1.8;
          font-size: 1.05rem;
        }
        .hyper-doc-content p { margin-bottom: 1.5em; }
        .hyper-doc-content h1 { font-size: 2.5rem; font-weight: 900; margin-bottom: 1rem; letter-spacing: -0.02em; }
        .hyper-doc-content h2 { font-size: 1.75rem; font-weight: 800; margin-top: 2rem; margin-bottom: 1rem; letter-spacing: -0.01em; }
        .hyper-doc-content h3 { font-size: 1.25rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.75rem; }
        .hyper-doc-content ul, .hyper-doc-content ol { margin-bottom: 1.5em; padding-left: 1.5em; }
        .hyper-doc-content li { margin-bottom: 0.5em; }
        .hyper-doc-content table { width: 100%; border-collapse: collapse; margin-bottom: 1.5em; }
        .hyper-doc-content td, .hyper-doc-content th { border: 1px solid #555; padding: 0.75rem; }
        .error-msg { color: #ef4444; font-weight: bold; text-align: center; padding: 2rem; }
        
        /* Premium Invisible Scrollbar */
        .hyper-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .hyper-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .hyper-scrollbar::-webkit-scrollbar-thumb { background: rgba(150, 150, 150, 0.3); border-radius: 10px; }
        .hyper-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(150, 150, 150, 0.5); }
      `}} />

      <div className={`fixed top-0 left-0 w-full z-[100] pointer-events-none transition-opacity duration-700 ${isIdle ? 'opacity-0' : 'opacity-100'}`}>
         <div className="pointer-events-auto">
             {!isFullscreen && <PreviewHeader fileName={fileName} onClose={onClose} />}
         </div>
      </div>
      
      <div className={`relative w-full h-full flex items-center justify-center transition-colors duration-500 select-none outline-none ${isFullscreen ? 'bg-black p-0' : 'p-4 md:p-8'}`}>
        
        {/* 🚀 OUTER GLASS FRAME */}
        <div 
          ref={containerRef}
          className={`relative flex items-center justify-center overflow-hidden transition-all duration-700 ${
            isFullscreen 
              ? 'w-full h-full rounded-none bg-black/60' 
              : 'w-full h-full max-w-6xl rounded-[2.5rem] bg-black/40 backdrop-blur-3xl shadow-[0_0_120px_rgba(0,0,0,0.5)] ring-1 ring-white/10'
          }`}
          style={!isFullscreen ? { marginTop: '30px', maxHeight: 'calc(100vh - 120px)' } : {}}
        >
          
          {isLoading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center flex-col gap-4 bg-black/50 backdrop-blur-md">
               <div className="relative flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
               </div>
               <span className="text-xs font-mono uppercase tracking-[0.2em] text-white/50">Parsing Document...</span>
            </div>
          ) : (
            // 🚀 INNER PAPER (The actual document sheet)
            <div className="w-full h-full p-4 md:p-8 flex justify-center">
                <div 
                    className={`w-full max-w-4xl h-full rounded-2xl shadow-2xl overflow-y-auto hyper-scrollbar transition-colors duration-500 p-8 md:p-16 ${
                        theme === 'light' 
                        ? 'bg-[#fdfdfd] text-[#1a1a1a] ring-1 ring-black/5' 
                        : 'bg-[#121212] text-white/90 ring-1 ring-white/10'
                    }`}
                >
                    <div 
                        className="hyper-doc-content w-full"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>
            </div>
          )}
        </div>

        {/* 🚀 THE FLOATING TOOLBAR */}
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-black/60 backdrop-blur-2xl px-3 py-2 rounded-[2rem] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.7)] transition-all duration-700 ${
            isIdle ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0 hover:bg-black/80 hover:border-white/20 hover:scale-105'
        }`}>
            {/* Theme Toggle Button */}
            <button 
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
                className="p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition active:scale-90" 
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <div className="w-px h-5 bg-white/10 mx-1"></div>

            <button onClick={toggleFullScreen} className="p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition active:scale-90" title="Toggle Fullscreen">
                {isFullscreen ? <Minimize className="w-4 h-4 text-primary" /> : <Maximize className="w-4 h-4" />}
            </button>

            <div className="w-px h-5 bg-white/10 mx-1"></div>
            
            <button 
                onClick={() => setShowInfo(!showInfo)} 
                className={`p-2.5 rounded-full transition active:scale-90 ${showInfo ? 'text-primary bg-primary/20' : 'text-white/70 hover:text-white hover:bg-white/10'}`} 
                title="Document Metadata"
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
                    <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border-b border-white/10 pb-3">Doc Intelligence</h3>
                    
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-3 items-start">
                            <div className="p-2 rounded-xl bg-white/5 border border-white/5"><FileText className="w-4 h-4 text-emerald-400" /></div>
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
                        <Download className="w-4 h-4" /> Download Original
                    </a>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </>
  );
}