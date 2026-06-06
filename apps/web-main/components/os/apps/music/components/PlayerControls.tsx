'use client';

import React from 'react';
import { useMusicStore } from '@/store/useMusicStore';
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat } from 'lucide-react';

// ⏱️ Helper to format seconds to MM:SS
const formatTime = (time: number) => {
  if (isNaN(time) || time === 0) return "0:00";
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const PlayerControls = () => {
  const { 
    isPlaying, togglePlay, 
    progress, setProgressFromUI, currentTime, duration, 
    volume, setVolume, currentTrack,
    nextTrack, prevTrack // 👈 New queue functions from store
  } = useMusicStore();

  // ⏩ Direct DOM manipulation for instant seek without lag
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    setProgressFromUI(newProgress);
    
    const audioElement = document.getElementById('hyper-audio-element') as HTMLAudioElement;
    if (audioElement && duration > 0) {
      audioElement.currentTime = (newProgress / 100) * duration;
    }
  };

  return (
    <div className="w-full flex items-center justify-between gap-6 px-4">
      
      {/* LEFT: Mini Info */}
      <div className="w-1/4 hidden md:flex items-center gap-3"></div>

      {/* CENTER: Core Controls & Progress */}
      <div className="flex-1 max-w-2xl flex flex-col items-center gap-3">
        {/* Buttons */}
        <div className="flex items-center gap-6">
          <button className="text-white/40 hover:text-white transition-colors"><Shuffle size={18} /></button>
          
          {/* 🚀 Tied to prevTrack */}
          <button onClick={prevTrack} className="text-white/70 hover:text-white transition-colors">
            <SkipBack size={24} fill="currentColor" />
          </button>
          
          <button 
            onClick={togglePlay}
            disabled={!currentTrack && useMusicStore.getState().queue.length === 0}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
          </button>
          
          {/* 🚀 Tied to nextTrack */}
          <button onClick={nextTrack} className="text-white/70 hover:text-white transition-colors">
            <SkipForward size={24} fill="currentColor" />
          </button>
          
          <button className="text-white/40 hover:text-white transition-colors"><Repeat size={18} /></button>
        </div>

        {/* Progress Bar */}
        <div className="w-full flex items-center gap-3 text-xs text-white/50 font-medium">
          {/* 🚀 Real Time Output */}
          <span className="w-8 text-right">{formatTime(currentTime)}</span>
          
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden group cursor-pointer relative">
            <div 
              className="h-full bg-gradient-to-r from-[#8d6bff] to-[#52d9ff] relative" 
              style={{ width: `${progress}%` }}
            >
               <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-opacity" />
            </div>
            {/* 🚀 Added Seek Handler */}
            <input 
              type="range" min="0" max="100" value={progress} 
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          
          {/* 🚀 Real Duration Output */}
          <span className="w-8">{formatTime(duration)}</span> 
        </div>
      </div>

      {/* RIGHT: Volume Control */}
      <div className="w-1/4 flex justify-end items-center gap-3 text-white/70">
        <Volume2 size={18} />
        <div className="w-24 h-1.5 bg-white/10 rounded-full relative group">
          <div className="h-full bg-white/70 group-hover:bg-[#52d9ff] rounded-full transition-colors" style={{ width: `${volume * 100}%` }} />
          <input 
             type="range" min="0" max="1" step="0.01" value={volume} 
             onChange={(e) => setVolume(Number(e.target.value))}
             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

    </div>
  );
};