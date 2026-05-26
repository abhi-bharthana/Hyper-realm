"use client";

import { useState, useRef, useEffect } from "react";
import { useThemeStore } from "@/store/useThemeStore";
import { Music, Play, Pause, X, Disc3 } from "lucide-react";

export function MagicPill() {
  const { theme, setTheme, isMagicPillVisible } = useThemeStore();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Dragging & Position State
  const [position, setPosition] = useState({ x: 0, y: 0 }); 
  const [isMounted, setIsMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const dragInfo = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0, isMoving: false });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 🎯 CRITICAL SYSTEM THEME SYNC HOOK
  // Jaise hi useThemeStore badlega, pure global HTML frame class map ko force overwrite karega
  useEffect(() => {
    if (theme === 'light-verdant') {
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, [theme]);

  // --- BOUNDARY AUTO-ADJUST LOGIC ---
  const getClampedPosition = (x: number, y: number, expanded: boolean) => {
    if (typeof window === 'undefined') return { x, y };
    
    const width = expanded ? 300 : 56;  
    const height = expanded ? 80 : 56;  
    const margin = 24; 

    const maxX = window.innerWidth - width - margin;
    const maxY = window.innerHeight - height - margin;

    return {
      x: Math.max(margin, Math.min(maxX, x)),
      y: Math.max(margin, Math.min(maxY, y))
    };
  };

  // Initial Position Deployment
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Screen edge margin constraints calculation
      const initialX = window.innerWidth - 80;
      const initialY = window.innerHeight - 100;
      setPosition(getClampedPosition(initialX, initialY, false));
      setIsMounted(true);
    }
  }, []);

  // Recalculate borders on window expand toggle state bounds
  useEffect(() => {
    if (isMounted) {
      setPosition((prev) => getClampedPosition(prev.x, prev.y, isExpanded));
    }
  }, [isExpanded, isMounted]);

  if (!isMagicPillVisible || !isMounted) return null;

  // --- INTERACTION LOGIC (Tap, Hold, Drag) ---
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (isExpanded) return; 
    
    e.currentTarget.setPointerCapture(e.pointerId);
    
    dragInfo.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
      isMoving: false
    };

    timerRef.current = setTimeout(() => {
      if (!dragInfo.current.isMoving) {
        setIsExpanded(true);
      }
    }, 400);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isExpanded || !e.currentTarget.hasPointerCapture(e.pointerId)) return;

    const moveX = e.clientX - dragInfo.current.startX;
    const moveY = e.clientY - dragInfo.current.startY;
    
    if (Math.abs(moveX) > 3 || Math.abs(moveY) > 3) {
      dragInfo.current.isMoving = true;
      setIsDragging(true); 
      if (timerRef.current) clearTimeout(timerRef.current); 
      
      setPosition({
        x: dragInfo.current.initialX + moveX,
        y: dragInfo.current.initialY + moveY
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    
    // 🎯 FLOATING MAGIC PILL TAP EXECUTION: Theme Toggle Action Trigger!
    if (!dragInfo.current.isMoving && !isExpanded) {
      setTheme(theme === 'light-verdant' ? 'dark-green' : 'light-verdant');
    } else if (dragInfo.current.isMoving) {
      setPosition((prev) => getClampedPosition(prev.x, prev.y, isExpanded));
    }

    setIsDragging(false);
    dragInfo.current.isMoving = false;
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      isPlaying ? audioRef.current.pause() : audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const isLight = theme === 'light-verdant';

  return (
    <>
      <audio ref={audioRef} src="/sounds/ambient-hyper-realm.mp3" loop className="hidden" />

      <div 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          touchAction: "none",
          transition: isDragging ? 'none' : 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)' 
        }}
        className={`fixed z-[100] overflow-hidden shadow-2xl
          ${isExpanded 
            ? "w-[300px] h-20 rounded-[2rem] bg-black/90 backdrop-blur-2xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)]" 
            : `w-14 h-14 rounded-full border border-white/20 cursor-grab active:cursor-grabbing hover:scale-105 ${isLight ? 'bg-black text-white shadow-xl' : 'bg-white/10 backdrop-blur-xl shadow-[0_0_20px_rgba(163,230,53,0.15)]'}`
          }
        `}
      >
        
        {/* --- State 1: Collapsed View (Orb/Icon) --- */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-400 
          ${isExpanded ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'}`}
        >
          <div className="relative">
            {isPlaying && <div className="absolute inset-0 bg-lime-400 rounded-full blur animate-ping opacity-30"></div>}
            <Disc3 className={`w-6 h-6 ${isPlaying ? 'animate-spin-slow' : ''} text-lime-400`} />
          </div>
        </div>

        {/* --- State 2: Expanded View (Music Player) --- */}
        <div className={`absolute inset-0 w-[300px] h-20 px-5 flex items-center justify-between transition-all duration-[600ms] 
          ${isExpanded ? 'opacity-100 translate-y-0 delay-100' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-full bg-gradient-to-tr from-lime-300 to-green-600 flex items-center justify-center shadow-[0_0_15px_rgba(163,230,53,0.3)] ${isPlaying ? 'animate-spin-slow' : ''}`}>
              <Music className="w-5 h-5 text-black" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-white text-[15px] font-bold leading-snug tracking-wide">Hyper-Realm</span>
              <span className="text-lime-400 text-xs font-medium opacity-80 uppercase tracking-wider">Ambient</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }} className="w-8 h-8 rounded-full bg-transparent hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-95">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </>
  );
}