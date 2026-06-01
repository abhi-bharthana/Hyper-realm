'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three'; // 🚀 Core Three engine mapping
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, Html, Environment } from '@react-three/drei';
import { PreviewHeader } from './PreviewHeader';
import { Info, Download, Maximize, Minimize, Loader2, Box, HardDrive, Calendar, MousePointer2 } from 'lucide-react';

interface ThreeDPreviewProps {
  url: string;
  fileName: string;
  file?: any;
  onClose: () => void;
}

// 🧊 CORE 3D MODEL COMPONENT (Auto-Caching & Parsing)
function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

// 👻 3D GHOST LOADER (Renders inside the 3D Canvas)
function CanvasLoader() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-md p-6 rounded-3xl border border-white/10 w-48">
         <div className="relative flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full"></div>
         </div>
         <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-100/70 text-center">Rendering Mesh...</span>
      </div>
    </Html>
  );
}

export function ThreeDPreview({ url, fileName, file, onClose }: ThreeDPreviewProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // 👑 ULTRA-CLEAN CONSOLE FILTER HOOK
  // ==========================================
  useEffect(() => {
    const originalWarn = console.warn;
    console.warn = (...args) => {
      // Mutes ThreeJS deprecation spams instantly
      if (args[0] && typeof args[0] === 'string' && (args[0].includes('THREE.') || args[0].includes('PCFSoftShadowMap'))) return;
      originalWarn(...args);
    };
    return () => { console.warn = originalWarn; };
  }, []);

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
    window.addEventListener('wheel', resetIdle); 
    resetIdle();
    return () => { 
        window.removeEventListener('mousemove', resetIdle); 
        window.removeEventListener('touchstart', resetIdle);
        window.removeEventListener('wheel', resetIdle);
        clearTimeout(timeoutRef.current!); 
    };
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

  const formatBytes = (bytes: number = 0) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fileDate = file?.last_modified ? new Date(file.last_modified).toLocaleDateString() : 'N/A';

  return (
    <>
      <div className={`fixed top-0 left-0 w-full z-[100] pointer-events-none transition-opacity duration-700 ${isIdle ? 'opacity-0' : 'opacity-100'}`}>
         <div className="pointer-events-auto">
             {!isFullscreen && <PreviewHeader fileName={fileName} onClose={onClose} />}
         </div>
      </div>
      
      <div className={`relative w-full h-full flex items-center justify-center transition-colors duration-500 select-none outline-none ${isFullscreen ? 'bg-[#030712] p-0' : 'p-4 md:p-8'}`}>
        
        {/* 🚀 THE HOLOGRAM FRAME */}
        <div 
          ref={containerRef}
          className={`relative flex items-center justify-center overflow-hidden transition-all duration-700 ${
            isFullscreen 
              ? 'w-full h-full rounded-none bg-gradient-to-b from-[#030712] to-[#0a0f1c]' 
              : 'w-full h-full max-w-6xl rounded-[2.5rem] bg-gradient-to-b from-[#030712] to-[#0a0f1c] shadow-[0_0_120px_rgba(34,211,238,0.15)] ring-1 ring-cyan-500/20 cursor-grab active:cursor-grabbing'
          }`}
          style={!isFullscreen ? { marginTop: '30px', maxHeight: 'calc(100vh - 120px)' } : {}}
        >
          
          {/* 🚀 THE GPU ACCELERATED 3D CANVAS */}
          <Canvas 
            shadows={{ type: THREE.PCFShadowMap }} 
            dpr={[1, 2]} 
            camera={{ fov: 45 }}
            gl={{ preserveDrawingBuffer: true, antialias: true }}
            className="w-full h-full outline-none"
          >
            <Suspense fallback={<CanvasLoader />}>
                <Stage environment="city" intensity={0.6} shadows={false}>
                    <Model url={url} />
                </Stage>
            </Suspense>

            <OrbitControls 
                autoRotate 
                autoRotateSpeed={1.5} 
                enableDamping={true} 
                dampingFactor={0.05} 
                makeDefault 
            />
            
            <Environment preset="studio" />
          </Canvas>

          {/* User Hint overlay */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 pointer-events-none opacity-50 flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
              <MousePointer2 className="w-3 h-3 text-cyan-400" />
              <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-100">Drag to Rotate • Scroll to Zoom</span>
          </div>

        </div>

        {/* 🚀 THE FLOATING TOOLBAR */}
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-black/60 backdrop-blur-2xl px-3 py-2 rounded-[2rem] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.7)] transition-all duration-700 ${
            isIdle ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0 hover:bg-black/80 hover:border-white/20 hover:scale-105'
        }`}>
            <button onClick={toggleFullScreen} className="p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition active:scale-90" title="Toggle Fullscreen">
                {isFullscreen ? <Minimize className="w-4 h-4 text-cyan-400" /> : <Maximize className="w-4 h-4" />}
            </button>

            <div className="w-px h-5 bg-white/10 mx-1"></div>
            
            <button 
                onClick={() => setShowInfo(!showInfo)} 
                className={`p-2.5 rounded-full transition active:scale-90 ${showInfo ? 'text-cyan-400 bg-cyan-400/20' : 'text-white/70 hover:text-white hover:bg-white/10'}`} 
                title="Model Metadata"
            >
                <Info className="w-4 h-4" />
            </button>
        </div>

        {/* 🚀 METADATA PANEL */}
        <AnimatePresence>
            {showInfo && (
                <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className={`absolute right-6 md:right-10 z-[60] w-72 bg-black/70 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] ${
                      isFullscreen ? 'top-10' : 'top-24'
                    }`}
                >
                    <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border-b border-white/10 pb-3">Mesh Intelligence</h3>
                    
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-3 items-start">
                            <div className="p-2 rounded-xl bg-white/5 border border-white/5"><Box className="w-4 h-4 text-cyan-400" /></div>
                            <div className="overflow-hidden w-full">
                                <p className="text-white/50 text-[9px] uppercase tracking-widest font-mono">Filename</p>
                                <p className="text-white/90 text-xs font-medium truncate" title={fileName}>{fileName}</p>
                            </div>
                        </div>

                        <div className="flex gap-3 items-start">
                            <div className="p-2 rounded-xl bg-white/5 border border-white/5"><HardDrive className="w-4 h-4 text-blue-400" /></div>
                            <div>
                                <p className="text-white/50 text-[9px] uppercase tracking-widest font-mono">Model Size</p>
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
                        <Download className="w-4 h-4" /> Download 3D Asset
                    </a>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </>
  );
}