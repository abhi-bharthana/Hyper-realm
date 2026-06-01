'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PreviewHeader } from './PreviewHeader';
import { Play, Pause, Volume2, VolumeX, Info, Download, Music, HardDrive, Calendar, FileAudio } from 'lucide-react';

interface AudioPreviewProps {
  url: string;
  fileName: string;
  file?: any; 
  onClose: () => void;
}

export function AudioPreview({ url, fileName, file, onClose }: AudioPreviewProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  const [showInfo, setShowInfo] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ==========================================
  // 🚀 IDLE TIMER ENGINE (Auto-Hide UI)
  // ==========================================
  useEffect(() => {
    const resetIdle = () => {
      setIsIdle(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (!showInfo) {
        timeoutRef.current = setTimeout(() => setIsIdle(true), 2500);
      }
    };

    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('touchstart', resetIdle);
    resetIdle(); 

    return () => {
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('touchstart', resetIdle);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [showInfo]);

  // ==========================================
  // 🎵 AUDIO ENGINE LOGIC
  // ==========================================
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => setDuration(audio.duration);
    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const onAudioEnd = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', onAudioEnd);

    // Auto-play on load
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', onAudioEnd);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleTimeDrag = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Number(e.target.value);
    setCurrentTime(audio.currentTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const vol = Number(e.target.value);
    audio.volume = vol;
    setVolume(vol);
    if (vol === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
    if (isMuted && volume === 0) {
      setVolume(0.5);
      audio.volume = 0.5;
    }
  };

  // TIME FORMATTER (00:00)
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // BYTES FORMATTER
  const formatBytes = (bytes: number = 0, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024, dm = decimals < 0 ? 0 : decimals, sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const fileDate = file?.last_modified ? new Date(file.last_modified).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : 'Unknown Date';

  return (
    <>
      <audio ref={audioRef} src={url} preload="metadata" className="hidden" />

      {/* 🚀 AUTO-HIDE HEADER */}
      <div className={`fixed top-0 left-0 w-full z-[100] pointer-events-none transition-opacity duration-700 ${isIdle ? 'opacity-0' : 'opacity-100'}`}>
         <div className="pointer-events-auto">
             <PreviewHeader fileName={fileName} onClose={onClose} />
         </div>
      </div>
      
      <div className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-8 select-none overflow-hidden bg-black/40">
        
        {/* 🚀 THE VISUAL CENTERPIECE (Spinning Disc) */}
        <div className="relative flex items-center justify-center mb-12">
            
            {/* Pulsing Background Glow (Only when playing) */}
            <motion.div 
                animate={{ 
                    scale: isPlaying ? [1, 1.2, 1] : 1, 
                    opacity: isPlaying ? [0.2, 0.4, 0.2] : 0 
                }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute inset-0 bg-primary blur-3xl rounded-full w-64 h-64 opacity-20"
            />

            {/* The Glass Disc */}
            <motion.div 
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                className="relative z-10 w-64 h-64 rounded-full bg-gradient-to-tr from-black/80 to-white/5 border-4 border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.6)] flex items-center justify-center backdrop-blur-md overflow-hidden ring-1 ring-white/5"
            >
                {/* Vinyl Grooves Effect */}
                <div className="absolute inset-2 border border-white/5 rounded-full" />
                <div className="absolute inset-6 border border-white/5 rounded-full" />
                <div className="absolute inset-12 border border-white/5 rounded-full" />
                
                {/* Center Core */}
                <div className="w-20 h-20 bg-black rounded-full border border-white/20 flex items-center justify-center shadow-inner z-20">
                    <Music className="w-8 h-8 text-primary opacity-80" />
                </div>
            </motion.div>
        </div>

        {/* 🚀 TRACK INFO */}
        <div className="text-center z-20 mb-10 max-w-md w-full px-4">
            <h2 className="text-white text-xl md:text-2xl font-bold truncate tracking-wide drop-shadow-md">
                {fileName.replace(/\.[^/.]+$/, "")}
            </h2>
            <p className="text-white/40 text-sm font-mono tracking-widest uppercase mt-2 truncate">
                Hyper-Audio Stream
            </p>
        </div>

        {/* 🚀 GLASSMORPHIC CONTROL CENTER */}
        <div className="relative z-50 w-full max-w-2xl bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            
            {/* Timeline Scrubber */}
            <div className="flex items-center gap-4 w-full mb-6">
                <span className="text-xs font-mono text-white/50 w-10 text-right">{formatTime(currentTime)}</span>
                <input 
                    type="range" 
                    min="0" 
                    max={duration || 0} 
                    value={currentTime} 
                    onChange={handleTimeDrag}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary hover:h-2 transition-all"
                />
                <span className="text-xs font-mono text-white/50 w-10">{formatTime(duration)}</span>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between px-2">
                
                {/* Volume Control */}
                <div className="flex items-center gap-3 w-1/3">
                    <button onClick={toggleMute} className="text-white/50 hover:text-white transition active:scale-90">
                        {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        value={isMuted ? 0 : volume} 
                        onChange={handleVolumeChange}
                        className="w-20 hidden md:block h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-white hover:accent-primary transition-all"
                    />
                </div>

                {/* Play / Pause Giant Button */}
                <div className="flex items-center justify-center w-1/3">
                    <button 
                        onClick={togglePlayPause} 
                        className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:bg-primary hover:text-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
                    >
                        {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
                    </button>
                </div>

                {/* Right Actions */}
                <div className="flex items-center justify-end gap-4 w-1/3">
                    <button 
                        onClick={() => setShowInfo(!showInfo)} 
                        className={`p-2.5 rounded-full transition active:scale-90 ${showInfo ? 'text-primary bg-primary/20' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
                        title="Track Info"
                    >
                        <Info className="w-5 h-5" />
                    </button>
                </div>

            </div>
        </div>

        {/* 🚀 EXIF / METADATA PANEL (Apple VisionOS Style) */}
        <AnimatePresence>
            {showInfo && (
                <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="absolute top-24 right-6 md:right-10 z-[60] w-72 bg-black/70 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
                >
                    <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border-b border-white/10 pb-3">Audio Intelligence</h3>
                    
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-3 items-start">
                            <div className="p-2 rounded-xl bg-white/5 border border-white/5"><FileAudio className="w-4 h-4 text-emerald-400" /></div>
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
                        <Download className="w-4 h-4" /> Download Track
                    </a>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
      
      {/* 🚀 Custom CSS to style the Range Input (Timeline) nicely */}
      <style dangerouslySetInnerHTML={{__html: `
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(255,255,255,0.5);
        }
      `}} />
    </>
  );
}