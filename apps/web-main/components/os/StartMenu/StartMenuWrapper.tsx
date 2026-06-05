'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search, Power, Settings as SettingsIcon } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { useOSStore } from '@/store/useOSStore';
import PinnedApps from './apps/PinnedApps';
// 🚀 IMPORT NAYA RECOMMENDED APPS MODULE
import RecommendedApps from './recents/RecommendedApps';

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StartMenuWrapper({ isOpen, onClose }: StartMenuProps) {
  const { profile } = useUserStore();
  const { openApp } = useOSStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // 🚀 SEARCH & ALL APPS STATE
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllApps, setShowAllApps] = useState(false);

  // Click outside to close functionality
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Reset menu when closed
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setShowAllApps(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      ref={menuRef}
      // 💎 UPGRADED: Added a subtle inner glow & premium 3D shadow for that Glassmorphism feel
      className="absolute z-[9999] bottom-24 left-1/2 -translate-x-1/2 w-[600px] bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
    >
      {/* 🌌 Subtle Ambient Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#52d9ff]/10 rounded-full blur-[80px] pointer-events-none" />
      
      {/* 🔍 SEARCH BAR */}
      <div className="p-7 pb-2 relative z-10">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search size={18} className="text-white/40 group-focus-within:text-[#52d9ff] transition-colors" />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search apps, files, or web..." 
            className="w-full bg-black/30 border border-white/10 rounded-full py-4 pl-12 pr-6 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#52d9ff]/50 focus:bg-white/10 transition-all shadow-inner group-focus-within:shadow-[0_0_20px_rgba(82,217,255,0.15)]"
          />
        </div>
      </div>

      {/* 🧩 MODULES AREA */}
      <div className="flex-1 p-7 overflow-y-auto custom-scrollbar min-h-[350px] relative z-10">
        {/* Pass states to PinnedApps */}
        <PinnedApps 
          searchQuery={searchQuery} 
          showAllApps={showAllApps} 
          setShowAllApps={setShowAllApps} 
          onClose={onClose} 
        />
        
        {/* 🪄 RECOMMENDED APPS (Hides if searching or viewing "All Apps") */}
        {!searchQuery && !showAllApps && <RecommendedApps onClose={onClose} />}
      </div>

      {/* 👤 BOTTOM USER BAR (Pill Tray Style) */}
      <div className="bg-white/[0.02] border-t border-white/10 p-5 px-7 flex items-center justify-between relative z-10 backdrop-blur-md">
        
        {/* User Profile */}
        <div className="flex items-center gap-3.5 group cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8d6bff] to-[#52d9ff] p-[2px] shadow-lg group-hover:scale-105 transition-transform">
            <img 
              src={profile?.avatarUrl && profile.avatarUrl !== '/avatar-3d.png' ? profile.avatarUrl : '/images/default-male.png'} 
              alt="User" 
              className="w-full h-full rounded-full object-cover bg-black border-2 border-black"
            />
          </div>
          <div className="flex flex-col">
             <span className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">{profile?.name || 'Hyper User'}</span>
             <span className="text-[10px] text-[#52d9ff] font-bold tracking-widest">ONLINE</span>
          </div>
        </div>

        {/* Floating Utility Tray */}
        <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-full border border-white/5 shadow-inner">
          <button 
            onClick={() => { openApp('settings', 'Settings'); onClose(); }}
            className="p-2.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title="Settings"
          >
            <SettingsIcon size={18} />
          </button>
          <button 
            className="p-2.5 rounded-full hover:bg-red-500/20 text-white/70 hover:text-red-400 transition-colors"
            title="Power"
          >
            <Power size={18} />
          </button>
        </div>

      </div>
      
    </div>
  );
}