'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Search, Bell } from 'lucide-react';

// 1️⃣ Prop types define kiye
interface TopBarProps {
  onFileClick?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onFileClick }) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    updateClock();
    const timerId = setInterval(updateClock, 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="absolute top-0 w-full h-7 z-[100] flex justify-between items-center px-4 backdrop-blur-md bg-black/20 border-b border-white/5 text-white/90 text-xs font-medium select-none pointer-events-auto">
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
          <span className="text-[#8d6bff]">⚡</span>
          <span className="font-bold tracking-wide">HYPER</span>
        </div>
        
        <div className="hidden md:flex gap-3 text-white/70">
          {/* 🎯 2️⃣ YAHA CLICK EVENT ATTACH KAR DIYA */}
          <span 
            onClick={onFileClick} 
            className="cursor-pointer hover:text-white hover:text-white/100 transition-colors active:scale-95"
          >
            File
          </span>
          <span className="cursor-pointer hover:text-white transition-colors">Edit</span>
          <span className="cursor-pointer hover:text-white transition-colors">View</span>
          <span className="cursor-pointer hover:text-white transition-colors">Go</span>
          <span className="cursor-pointer hover:text-white transition-colors">Help</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 text-white/70 mr-2">
          <Search size={14} className="cursor-pointer hover:text-white transition-colors" />
          <Wifi size={14} className="cursor-pointer hover:text-white transition-colors" />
          <BatteryMedium size={15} className="cursor-pointer hover:text-white transition-colors" />
          <Bell size={14} className="cursor-pointer hover:text-white transition-colors" />
        </div>

        <div className="cursor-pointer hover:text-white transition-colors tracking-wide">
          {time}
        </div>
      </div>
      
    </div>
  );
};