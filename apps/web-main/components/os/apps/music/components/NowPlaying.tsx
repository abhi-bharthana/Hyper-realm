'use client';

import React from 'react';
import { useMusicStore } from '@/store/useMusicStore';
import { Play } from 'lucide-react';

export const NowPlaying = () => {
  const { currentTrack, isPlaying, togglePlay } = useMusicStore();

  if (!currentTrack) {
    return (
      <div className="w-full h-64 rounded-3xl border border-dashed border-white/10 flex items-center justify-center opacity-50 bg-white/[0.02]">
        <p className="text-sm font-mono tracking-widest uppercase">Select a track to start</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-72 rounded-3xl overflow-hidden group shadow-2xl flex items-end p-8">
      
      {/* Dynamic Blurred Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 scale-110 blur-xl transition-all duration-1000 -z-10"
        style={{ backgroundImage: `url(${currentTrack.coverUrl})` }}
      />
      
      {/* Dark Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent -z-10" />

      {/* Hero Content */}
      <div className="w-full flex items-end justify-between gap-6 z-10">
        <div className="flex items-end gap-6">
          <img 
            src={currentTrack.coverUrl} 
            alt={currentTrack.title} 
            className="w-40 h-40 object-cover rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="pb-2">
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold tracking-widest uppercase text-[#52d9ff] border border-white/5 mb-4 inline-block">
              Now Playing
            </span>
            <h2 className="text-5xl font-black text-white tracking-tight leading-none drop-shadow-lg mb-2">
              {currentTrack.title}
            </h2>
            <p className="text-lg text-white/60 font-medium tracking-wide">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* Big Play Button on the Right */}
        <button 
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-[#8d6bff] text-white flex items-center justify-center hover:scale-110 hover:shadow-[0_0_30px_rgba(141,107,255,0.6)] transition-all duration-300 active:scale-95 shadow-lg mb-2"
        >
          {isPlaying ? (
            <div className="flex gap-1.5 h-6">
              <div className="w-1.5 h-full bg-white rounded-full" />
              <div className="w-1.5 h-full bg-white rounded-full" />
            </div>
          ) : (
            <Play size={32} fill="currentColor" className="ml-1" />
          )}
        </button>
      </div>

    </div>
  );
};