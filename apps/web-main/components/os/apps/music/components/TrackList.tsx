'use client';

import React from 'react';
import { useMusicStore } from '@/store/useMusicStore';
import { Play, Heart, MoreHorizontal } from 'lucide-react';

export const TrackList = () => {
  const { queue, currentTrack, playTrack, activeTab, favorites, recentPlays, toggleFavorite, isPlaying } = useMusicStore();

  let displayTracks = queue;
  if (activeTab === 'favorites') displayTracks = queue.filter(t => favorites.includes(t.id));
  else if (activeTab === 'recent') displayTracks = recentPlays;

  if (displayTracks.length === 0) {
    return <div className="text-white/30 text-sm mt-8">No tracks found in this section.</div>;
  }

  return (
    <div className="w-full flex flex-col">
      {/* Table Header */}
      <div className="flex items-center text-xs font-bold text-white/30 uppercase tracking-widest px-4 pb-3 border-b border-white/5 mb-2">
        <div className="w-8 text-center">#</div>
        <div className="flex-1">Title</div>
        <div className="w-48 hidden md:block">Album</div>
        <div className="w-24 text-right pr-4">Options</div>
      </div>

      {/* Tracks */}
      <div className="flex flex-col gap-1">
        {displayTracks.map((track, index) => {
          const isActive = currentTrack?.id === track.id;
          const isFav = favorites.includes(track.id);

          return (
            <div
              key={track.id + index}
              onClick={() => playTrack(track)}
              className={`flex items-center px-4 py-2.5 rounded-xl cursor-pointer group transition-all duration-200
                ${isActive ? 'bg-white/10' : 'hover:bg-white/[0.03]'}`}
            >
              {/* Number / Equalizer */}
              <div className="w-8 flex justify-center items-center text-sm font-medium text-white/40">
                {isActive && isPlaying ? (
                  <div className="flex gap-[2px] items-end h-3">
                    <div className="w-[3px] bg-[#8d6bff] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-[3px] bg-[#52d9ff] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-[3px] bg-[#8d6bff] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                ) : (
                  <span className="group-hover:hidden">{index + 1}</span>
                )}
                {!isActive && <Play size={14} fill="currentColor" className="hidden group-hover:block text-white" />}
              </div>

              {/* Title & Art */}
              <div className="flex-1 flex items-center gap-4 min-w-0">
                <img src={track.coverUrl} alt="Cover" className="w-10 h-10 rounded-md object-cover shadow-sm" />
                <div className="min-w-0">
                  <p className={`text-sm font-bold truncate ${isActive ? 'text-[#52d9ff]' : 'text-white'}`}>{track.title}</p>
                  <p className="text-xs text-white/50 truncate mt-0.5">{track.artist}</p>
                </div>
              </div>

              {/* Fake Album for Aesthetics */}
              <div className="w-48 hidden md:block text-sm text-white/40 truncate">
                Hyper Collection
              </div>

              {/* Actions */}
              <div className="w-24 flex items-center justify-end gap-3 pr-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(track.id); }}
                  className={`transition-all active:scale-90 ${isFav ? 'text-[#ff5f56] opacity-100' : 'text-white/20 opacity-0 group-hover:opacity-100 hover:text-white'}`}
                >
                  <Heart size={16} fill={isFav ? "currentColor" : "none"} />
                </button>
                <button className="text-white/20 opacity-0 group-hover:opacity-100 hover:text-white transition-all">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};