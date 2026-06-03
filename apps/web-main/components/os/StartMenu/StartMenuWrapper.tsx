import React, { useEffect, useRef, useState } from 'react';
import { Search, Power, Settings as SettingsIcon } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { useOSStore } from '@/store/useOSStore';
import PinnedApps from './apps/PinnedApps';
import RecentFiles from './recents/RecentFiles';

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
      // 🚀 YAHAN UPDATE KIYA HAI: w-[420px] ko w-[600px] kar diya taaki 4 column UI mast set ho!
      className="absolute z-[9999] bottom-24 left-1/2 -translate-x-1/2 w-[600px] bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
    >
      
      {/* 🔍 SEARCH BAR */}
      <div className="p-6 pb-2">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-white/40 group-focus-within:text-[#52d9ff] transition-colors" />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search apps, files, or web..." 
            className="w-full bg-black/40 border border-white/10 rounded-full py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-[#52d9ff]/50 focus:bg-white/5 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* 🧩 MODULES AREA */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar min-h-[300px]">
        {/* Pass states to PinnedApps */}
        <PinnedApps 
          searchQuery={searchQuery} 
          showAllApps={showAllApps} 
          setShowAllApps={setShowAllApps} 
          onClose={onClose} 
        />
        
        {/* 🪄 Hide Recents if searching or viewing "All Apps" */}
        {!searchQuery && !showAllApps && <RecentFiles />}
      </div>

      {/* 👤 BOTTOM USER BAR */}
      <div className="bg-black/40 border-t border-white/5 p-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8d6bff] to-[#52d9ff] p-[2px]">
            <img 
              src={profile?.avatarUrl && profile.avatarUrl !== '/avatar-3d.png' ? profile.avatarUrl : '/images/default-male.png'} 
              alt="User" 
              className="w-full h-full rounded-full object-cover bg-black"
            />
          </div>
          <span className="text-sm font-bold text-white/90">{profile?.name || 'Hyper User'}</span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => { openApp('settings', 'Settings'); onClose(); }}
            className="p-2.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <SettingsIcon size={18} />
          </button>
          <button className="p-2.5 rounded-full hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors">
            <Power size={18} />
          </button>
        </div>
      </div>
      
    </div>
  );
}