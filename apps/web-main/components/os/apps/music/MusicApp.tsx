'use client';

import React, { useEffect } from 'react';
import { AudioEngine } from './components/AudioEngine';
import { TrackList } from './components/TrackList';
import { NowPlaying } from './components/NowPlaying';
import { PlayerControls } from './components/PlayerControls';
import { useMusicStore } from '@/store/useMusicStore';
import { Disc, Library, Heart, Clock, Search, Bell } from 'lucide-react';

export const MusicApp = () => {
  const { loadTracksFromCloud, activeTab, setActiveTab } = useMusicStore();

  useEffect(() => {
    loadTracksFromCloud(""); 
  }, [loadTracksFromCloud]);

  return (
    <div className="w-full h-full flex flex-col bg-[#050508] text-white rounded-[1.2rem] overflow-hidden border border-white/5 shadow-2xl relative">
      <AudioEngine />

      <div className="flex flex-1 overflow-hidden h-full">
        
        {/* 📚 LEFT SIDEBAR: Premium Dark Navigation */}
        <div className="w-[260px] border-r border-white/5 flex flex-col bg-white/[0.01] z-10 shrink-0">
          <div className="p-8 pb-6">
            <h2 className="font-black text-2xl tracking-tighter text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8d6bff] to-[#52d9ff] flex items-center justify-center shadow-[0_0_15px_rgba(141,107,255,0.4)]">
                <Disc className="text-white animate-[spin_4s_linear_infinite]" size={16} />
              </div>
              HYPER
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-8 mt-4">
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 px-4">Menu</p>
              <nav className="flex flex-col gap-1">
                <NavItem icon={<Library size={18} />} label="Discover" isActive={activeTab === 'queue'} onClick={() => setActiveTab('queue')} />
                <NavItem icon={<Heart size={18} />} label="Favorites" isActive={activeTab === 'favorites'} onClick={() => setActiveTab('favorites')} />
                <NavItem icon={<Clock size={18} />} label="Recent Plays" isActive={activeTab === 'recent'} onClick={() => setActiveTab('recent')} />
              </nav>
            </div>

            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 px-4">Playlists</p>
              <div className="px-4 text-xs text-white/30 italic">No playlists yet...</div>
            </div>
          </div>
        </div>

        {/* 🎛️ MAIN DASHBOARD AREA */}
        <div className="flex-1 relative flex flex-col h-full bg-[#0a0a0f] overflow-hidden">
          
          {/* Dashboard Header */}
          <div className="h-20 shrink-0 px-8 flex items-center justify-between border-b border-white/5 z-10 bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full w-80 focus-within:border-[#8d6bff]/50 transition-colors">
              <Search size={16} className="text-white/40" />
              <input 
                type="text" 
                placeholder="Search tracks, artists..." 
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-white/30"
              />
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-white/40 hover:text-white transition-colors"><Bell size={18} /></button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#52d9ff] to-[#8d6bff] border-[2px] border-[#0a0a0f] cursor-pointer shadow-md" />
            </div>
          </div>

          {/* Scrollable Content (Banner + List) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pb-32">
            
            {/* Cinematic Hero Banner */}
            <div className="p-8">
              <NowPlaying />
            </div>

            {/* Track List Section */}
            <div className="px-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold tracking-tight">
                  {activeTab === 'queue' ? 'Trending Tracks' : activeTab === 'favorites' ? 'Your Favorites' : 'Listening History'}
                </h3>
              </div>
              <TrackList />
            </div>

          </div>
        </div>
      </div>

      {/* 🛸 FLOATING BOTTOM PLAYER (Glassmorphic Pill) */}
      <div className="absolute bottom-6 left-[280px] right-8 h-20 bg-white/5 backdrop-blur-[40px] border border-white/10 rounded-2xl flex items-center px-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50">
         <PlayerControls />
      </div>

    </div>
  );
};

const NavItem = ({ icon, label, isActive, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium
      ${isActive 
        ? 'bg-[#8d6bff]/10 text-white shadow-[inset_2px_0_0_#8d6bff]' 
        : 'text-white/50 hover:text-white hover:bg-white/5'
      }`}
  >
    <span className={isActive ? 'text-[#8d6bff]' : ''}>{icon}</span>
    {label}
  </button>
);