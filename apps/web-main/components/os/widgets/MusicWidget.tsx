'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Heart, Maximize2, Disc } from 'lucide-react';

interface MusicWidgetProps {
  variant: 'small' | 'medium' | 'large';
  track: any;
  isPlaying: boolean;
  togglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const MusicWidget = ({ variant, track, isPlaying, togglePlay, onNext, onPrev }: MusicWidgetProps) => {

  // Variant configs
  const variants = {
    small: { width: 320, height: 60, borderRadius: "9999px" },
    medium: { width: 320, height: 400, borderRadius: "2rem" },
    large: { width: 450, height: 500, borderRadius: "2.5rem" }
  };

  return (
    <motion.div
      animate={variants[variant]}
      className="bg-[#050505] border border-[#1a1a24] shadow-2xl overflow-hidden flex flex-col relative"
    >
      {/* 🌌 Ambient Glow behind everything */}
      <div className={`absolute inset-0 bg-gradient-to-br ${track.color || 'from-indigo-500 to-purple-500'} opacity-10 blur-[60px]`} />

      {/* 🔴 SMALL (PILL) VARIANT: Based on _ (45).jpeg */}
      {variant === 'small' && (
        <div className="flex items-center justify-between px-4 h-full w-full">
          <div className="flex items-center gap-3">
            <img src={track.coverUrl} className="w-10 h-10 rounded-full object-cover" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white truncate max-w-[100px]">{track.title}</span>
              <span className="text-[10px] text-gray-500">{track.artist}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={togglePlay} className="p-2 text-white hover:text-[#52d9ff]">
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            </button>
            <button onClick={onNext} className="text-white/60"><SkipForward size={18} /></button>
          </div>
        </div>
      )}

      {/* 🖼️ MEDIUM/LARGE VARIANT: Based on Music play interface cover.jpeg */}
      {(variant === 'medium' || variant === 'large') && (
        <div className="flex flex-col h-full p-6 z-10">
          <div className="flex-1 flex flex-col items-center justify-center">
            <motion.img 
              key={track.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              src={track.coverUrl} 
              className={`rounded-2xl shadow-2xl ${variant === 'large' ? 'w-64 h-64' : 'w-48 h-48'}`}
            />
            <div className="mt-6 text-center w-full">
              <h2 className="text-xl font-black text-white truncate">{track.title}</h2>
              <p className="text-sm text-[#52d9ff] font-medium">{track.artist}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {variant === 'large' && (
              <div className="w-full h-1.5 bg-[#1a1a24] rounded-full overflow-hidden">
                <div className="h-full bg-white/20 w-[40%]" />
              </div>
            )}
            
            <div className="flex items-center justify-center gap-8">
              <button onClick={onPrev} className="text-gray-400 hover:text-white"><SkipBack size={24} /></button>
              <button 
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
              </button>
              <button onClick={onNext} className="text-gray-400 hover:text-white"><SkipForward size={24} /></button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};