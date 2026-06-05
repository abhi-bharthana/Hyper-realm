'use client';

import React, { useState, useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';

export const WallpaperEngine = () => {
  const { preferences } = useUserStore();
  
  const wallpaper = preferences?.wallpaper || 'default'; 
  const wallpaperBlur = preferences?.wallpaperBlur ?? 2;
  const wallpaperDim = preferences?.wallpaperDim ?? 30;
  const isDynamicWallpaper = preferences?.dynamicWallpaper ?? false;

  const [timeFilter, setTimeFilter] = useState('');

  useEffect(() => {
    if (!isDynamicWallpaper) {
      setTimeFilter(''); 
      return;
    }

    const updateWallpaperVibe = () => {
      const hour = new Date().getHours();
      let activeFilter = '';

      if (hour >= 0 && hour < 6) {
        activeFilter = 'brightness(0.6) contrast(1.2) saturate(0.8) sepia(0.2) hue-rotate(180deg)';
      } else if (hour >= 6 && hour < 9) {
        activeFilter = 'brightness(0.9) contrast(1.05) saturate(1.2) sepia(0.3) hue-rotate(-15deg)';
      } else if (hour >= 9 && hour < 17) {
        activeFilter = 'brightness(1) contrast(1) saturate(1) sepia(0) hue-rotate(0deg)';
      } else if (hour >= 17 && hour < 20) {
        activeFilter = 'brightness(0.8) contrast(1.15) saturate(1.4) sepia(0.4) hue-rotate(-20deg)';
      } else {
        activeFilter = 'brightness(0.65) contrast(1.1) saturate(0.85) sepia(0.1) hue-rotate(10deg)';
      }
      
      setTimeFilter(activeFilter);
    };

    updateWallpaperVibe(); 
    
    const interval = setInterval(updateWallpaperVibe, 60000); 
    return () => clearInterval(interval);
  }, [isDynamicWallpaper]);

  if (wallpaper === 'default') {
    return (
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-[#030305] to-[#12121a]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8d6bff]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#52d9ff]/10 rounded-full blur-[120px]" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0 pointer-events-none bg-black">
      <img 
        src={wallpaper} 
        alt="Desktop Wallpaper" 
        className="w-full h-full object-cover transition-all duration-[3000ms] ease-out" 
        style={{ 
          filter: timeFilter,
          transform: timeFilter ? 'scale(1.02)' : 'scale(1)', 
        }}
      />
      
      <div 
        className="absolute inset-0 transition-all duration-300 ease-out" 
        style={{ 
          backgroundColor: `rgba(0, 0, 0, ${wallpaperDim / 100})`, 
          backdropFilter: `blur(${wallpaperBlur}px)`,              
          WebkitBackdropFilter: `blur(${wallpaperBlur}px)`         
        }} 
      /> 
    </div>
  );
};