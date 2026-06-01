'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { PreviewHeader } from './PreviewHeader';
import { Info, Download, Maximize, Minimize, Loader2, FileCode2, HardDrive, Calendar, Copy, Check } from 'lucide-react';

interface CodePreviewProps {
  url: string;
  fileName: string;
  file?: any;
  onClose: () => void;
}

export function CodePreview({ url, fileName, file, onClose }: CodePreviewProps) {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
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
  // 💻 CODE PARSING & LANGUAGE DETECTION
  // ==========================================
  useEffect(() => {
    const fetchCode = async () => {
      try {
        const response = await fetch(url);
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setContent('// Error loading file content.\n// Please check your network or file permissions.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCode();
  }, [url]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const formatBytes = (bytes: number = 0) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fileDate = file?.last_modified ? new Date(file.last_modified).toLocaleDateString() : 'N/A';

  // 🚀 Detect Language from Extension
  const getLanguage = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    const langMap: Record<string, string> = {
        js: 'javascript', ts: 'typescript', jsx: 'javascript', tsx: 'typescript',
        py: 'python', go: 'go', rs: 'rust', c: 'c', cpp: 'cpp', cs: 'csharp',
        java: 'java', json: 'json', md: 'markdown', css: 'css', html: 'html',
        sh: 'bash', env: 'bash', yaml: 'yaml', yml: 'yaml', xml: 'xml', sql: 'sql'
    };
    return langMap[ext] || 'text';
  };

  const language = getLanguage(fileName);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .hyper-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .hyper-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
        .hyper-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
        .hyper-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.4); }
      `}} />

      <div className={`fixed top-0 left-0 w-full z-[100] pointer-events-none transition-opacity duration-700 ${isIdle ? 'opacity-0' : 'opacity-100'}`}>
         <div className="pointer-events-auto">
             {!isFullscreen && <PreviewHeader fileName={fileName} onClose={onClose} />}
         </div>
      </div>
      
      <div className={`relative w-full h-full flex items-center justify-center transition-colors duration-500 select-none ${isFullscreen ? 'bg-[#1e1e1e] p-0' : 'p-4 md:p-8'}`}>
        
        {/* 🚀 OUTER MAC-STYLE TERMINAL FRAME */}
        <div 
          ref={containerRef}
          className={`relative flex flex-col overflow-hidden transition-all duration-700 ${
            isFullscreen 
              ? 'w-full h-full rounded-none bg-[#1e1e1e]' 
              : 'w-full h-full max-w-6xl rounded-[1.5rem] bg-[#1e1e1e] shadow-[0_30px_100px_rgba(0,0,0,0.8)] ring-1 ring-white/20'
          }`}
          style={!isFullscreen ? { marginTop: '30px', maxHeight: 'calc(100vh - 120px)' } : {}}
        >
          
          {/* Mac-Style Window Header */}
          <div className="w-full bg-[#2d2d2d] flex items-center px-4 py-3 select-none border-b border-white/5">
              <div className="flex gap-2 mr-4">
                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              </div>
              <div className="flex-1 text-center text-white/50 text-xs font-mono tracking-widest">{fileName}</div>
              <div className="text-white/30 text-[10px] font-mono uppercase px-2 py-1 bg-black/30 rounded">{language}</div>
          </div>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center flex-col gap-4 bg-[#1e1e1e]">
               <div className="relative flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
               </div>
               <span className="text-xs font-mono uppercase tracking-[0.2em] text-white/50">Compiling Source...</span>
            </div>
          ) : (
            // 🚀 THE CODE RENDERER
            <div className="flex-1 w-full overflow-hidden relative">
                <SyntaxHighlighter 
                    language={language}
                    style={vscDarkPlus}
                    showLineNumbers={true}
                    customStyle={{
                        margin: 0,
                        padding: '1.5rem',
                        height: '100%',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        background: 'transparent',
                        fontFamily: '"Fira Code", "JetBrains Mono", Consolas, monospace',
                    }}
                    lineNumberStyle={{ minWidth: '3em', paddingRight: '1em', color: '#6e7681', textAlign: 'right' }}
                    className="hyper-scrollbar"
                >
                    {content}
                </SyntaxHighlighter>
            </div>
          )}
        </div>

        {/* 🚀 THE FLOATING TOOLBAR */}
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-black/60 backdrop-blur-2xl px-3 py-2 rounded-[2rem] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.7)] transition-all duration-700 ${
            isIdle ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0 hover:bg-black/80 hover:border-white/20 hover:scale-105'
        }`}>
            {/* COPY CODE BUTTON */}
            <button 
                onClick={handleCopy} 
                className={`p-2.5 rounded-full transition active:scale-90 ${isCopied ? 'text-emerald-400 bg-emerald-400/20' : 'text-white/70 hover:text-white hover:bg-white/10'}`} 
                title="Copy Code"
            >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>

            <div className="w-px h-5 bg-white/10 mx-1"></div>

            <button onClick={toggleFullScreen} className="p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition active:scale-90" title="Toggle Fullscreen">
                {isFullscreen ? <Minimize className="w-4 h-4 text-blue-400" /> : <Maximize className="w-4 h-4" />}
            </button>

            <div className="w-px h-5 bg-white/10 mx-1"></div>
            
            <button 
                onClick={() => setShowInfo(!showInfo)} 
                className={`p-2.5 rounded-full transition active:scale-90 ${showInfo ? 'text-blue-400 bg-blue-400/20' : 'text-white/70 hover:text-white hover:bg-white/10'}`} 
                title="File Metadata"
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
                    <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border-b border-white/10 pb-3">File Intelligence</h3>
                    
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-3 items-start">
                            <div className="p-2 rounded-xl bg-white/5 border border-white/5"><FileCode2 className="w-4 h-4 text-blue-400" /></div>
                            <div className="overflow-hidden w-full">
                                <p className="text-white/50 text-[9px] uppercase tracking-widest font-mono">Filename</p>
                                <p className="text-white/90 text-xs font-medium truncate" title={fileName}>{fileName}</p>
                            </div>
                        </div>

                        <div className="flex gap-3 items-start">
                            <div className="p-2 rounded-xl bg-white/5 border border-white/5"><HardDrive className="w-4 h-4 text-purple-400" /></div>
                            <div>
                                <p className="text-white/50 text-[9px] uppercase tracking-widest font-mono">File Size</p>
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
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </>
  );
}