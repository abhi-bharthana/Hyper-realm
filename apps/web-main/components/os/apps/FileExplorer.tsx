'use client';

import React, { useState } from 'react';
import { 
  Folder, FileText, Image as ImageIcon, Video, Music, 
  HardDrive, Cloud, Trash2, Search, ChevronRight, MoreVertical 
} from 'lucide-react';

// Abhi ke liye Fake Data (Baad mein ye tere Go backend Storage-API se aayega)
const mockItems = [
  { id: '1', name: 'Hyper-Realm Projects', type: 'folder', size: '--', date: 'Oct 24', color: 'text-blue-400' },
  { id: '2', name: 'Neural Canvas Assets', type: 'folder', size: '--', date: 'Oct 25', color: 'text-purple-400' },
  { id: '3', name: 'Architecture_v2.pdf', type: 'file', icon: FileText, size: '2.4 MB', date: 'Today', color: 'text-red-400' },
  { id: '4', name: 'Ambient_Boot.mp3', type: 'file', icon: Music, size: '5.1 MB', date: 'Yesterday', color: 'text-yellow-400' },
  { id: '5', name: 'God_Level_UI.png', type: 'file', icon: ImageIcon, size: '1.2 MB', date: 'Oct 20', color: 'text-green-400' }
];

export const FileExplorer = () => {
  const [currentPath, setCurrentPath] = useState(['My Drive']);

  // 5GB Quota Math (Demo: 1.2 GB used)
  const totalStorageGB = 5.0;
  const usedStorageGB = 1.2;
  const progressPercent = (usedStorageGB / totalStorageGB) * 100;

  return (
    <div className="flex h-full w-full bg-black/40 text-white overflow-hidden backdrop-blur-2xl">
      
      {/* ⬅️ SIDEBAR */}
      <div className="w-64 border-r border-white/5 bg-black/20 flex flex-col">
        <div className="p-4 font-bold text-lg tracking-wide flex items-center gap-2">
          <Cloud className="text-[#52d9ff]" size={20} />
          <span>VFS Cloud</span>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          <div className="px-3 py-2 rounded-lg bg-white/10 text-white flex items-center gap-3 cursor-pointer">
            <HardDrive size={16} className="text-[#8d6bff]" /> My Drive
          </div>
          <div className="px-3 py-2 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3 cursor-pointer">
            <Folder size={16} /> Shared with me
          </div>
          <div className="px-3 py-2 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3 cursor-pointer">
            <Trash2 size={16} /> Trash
          </div>
        </div>

        {/* 📊 5GB STORAGE QUOTA INDICATOR */}
        <div className="p-4 border-t border-white/5">
          <div className="text-xs text-white/60 mb-2 flex justify-between">
            <span>Storage</span>
            <span>{usedStorageGB} GB / {totalStorageGB} GB</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#8d6bff] to-[#52d9ff] rounded-full shadow-[0_0_10px_rgba(141,107,255,0.8)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ➡️ MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-transparent to-white/[0.02]">
        
        {/* Top Header & Breadcrumbs */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-black/10">
          <div className="flex items-center gap-2 text-sm text-white/80">
            {currentPath.map((path, idx) => (
              <React.Fragment key={idx}>
                <span className="hover:text-white cursor-pointer transition-colors">{path}</span>
                {idx < currentPath.length - 1 && <ChevronRight size={14} className="text-white/40" />}
              </React.Fragment>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder="Search drive..." 
              className="bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-all w-48 focus:w-64"
            />
          </div>
        </div>

        {/* Files Grid View */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            
            {mockItems.map((item) => (
              <div 
                key={item.id} 
                className="group relative p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer flex flex-col items-center gap-3"
              >
                {/* 3D hover scale effect */}
                <div className="transform group-hover:scale-110 transition-transform duration-300">
                  {item.type === 'folder' ? (
                    <Folder size={48} className={item.color} fill="currentColor" fillOpacity={0.2} strokeWidth={1} />
                  ) : (
                    // @ts-ignore
                    <item.icon size={48} className={item.color} strokeWidth={1} />
                  )}
                </div>
                
                <div className="text-center">
                  <p className="text-sm font-medium text-white/90 truncate w-28">{item.name}</p>
                  <p className="text-xs text-white/40 mt-0.5">{item.type === 'folder' ? 'Folder' : item.size}</p>
                </div>

                <button className="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all">
                  <MoreVertical size={14} className="text-white/60" />
                </button>
              </div>
            ))}

          </div>
        </div>

      </div>
    </div>
  );
};