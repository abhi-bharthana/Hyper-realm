'use client';

import React, { useEffect, useRef } from 'react';
import { useUserStore } from '@/store/useUserStore';

// 🚀 STAGES (Mapped to a 24-hour cycle)
// p = 0.00 (Midnight), p = 0.50 (Noon), p = 1.00 (Next Midnight)
const STAGES = [
  { p: 0.00, brightness: 0.28, contrast: 1.10, saturate: 0.72, sepia: 0, hue: 35, overlay: [5, 12, 50, 0.22] },   // 12:00 AM
  { p: 0.20, brightness: 0.34, contrast: 1.08, saturate: 0.78, sepia: 0, hue: 25, overlay: [8, 15, 55, 0.18] },   // 4:48 AM
  { p: 0.25, brightness: 0.50, contrast: 1.00, saturate: 0.92, sepia: 0.10, hue: 10, overlay: [20, 15, 10, 0.08] }, // 6:00 AM
  { p: 0.35, brightness: 1.00, contrast: 1.00, saturate: 1.00, sepia: 0.03, hue: 0, overlay: [0, 0, 0, 0] },      // 8:24 AM
  { p: 0.50, brightness: 1.12, contrast: 1.12, saturate: 1.12, sepia: 0, hue: 0, overlay: [0, 0, 0, 0] },         // 12:00 PM
  { p: 0.70, brightness: 0.96, contrast: 1.05, saturate: 1.22, sepia: 0.18, hue: -8, overlay: [40, 20, 0, 0.04] },  // 4:48 PM
  { p: 0.75, brightness: 0.74, contrast: 1.00, saturate: 1.35, sepia: 0.35, hue: -15, overlay: [70, 25, 0, 0.08] },  // 6:00 PM
  { p: 0.82, brightness: 0.55, contrast: 1.05, saturate: 0.95, sepia: 0, hue: 18, overlay: [15, 25, 70, 0.12] },   // 7:40 PM
  { p: 0.90, brightness: 0.42, contrast: 1.08, saturate: 0.82, sepia: 0, hue: 28, overlay: [10, 20, 80, 0.18] },   // 9:36 PM
  { p: 1.00, brightness: 0.28, contrast: 1.10, saturate: 0.72, sepia: 0, hue: 35, overlay: [5, 12, 50, 0.22] }    // 12:00 AM (Loops Back)
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const WallpaperEngine = () => {
  const { preferences } = useUserStore();
  
  const wallpaper = preferences?.wallpaper || 'default'; 
  const wallpaperBlur = preferences?.wallpaperBlur ?? 2;
  const wallpaperDim = preferences?.wallpaperDim ?? 30;
  const isDynamicWallpaper = preferences?.dynamicWallpaper ?? false;

  // 🚀 DIRECT DOM REFS FOR 280Hz SMOOTHNESS (NO REACT LAG)
  const imageRef = useRef<HTMLImageElement>(null);
  const atmosphereRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDynamicWallpaper || wallpaper === 'default') {
      if (imageRef.current) imageRef.current.style.filter = 'brightness(1) contrast(1) saturate(1) sepia(0) hue-rotate(0deg)';
      if (atmosphereRef.current) atmosphereRef.current.style.backgroundColor = 'transparent';
      return;
    }

    let reqId: number;

    const animate = () => {
      // ==========================================
      // ⏱️ TIME ENGINE (Framerate Independent)
      // ==========================================
      // True = Fast demo cycle (loops every ~20s)
      // False = Real life OS time synced perfectly to current hour/minute!
      const DEMO_MODE = false; 

      let cycle = 0;
      if (DEMO_MODE) {
        // Runs perfectly smooth on 60Hz or 280Hz because it's based on absolute elapsed milliseconds
        cycle = (performance.now() * 0.00005) % 1; 
      } else {
        const now = new Date();
        // Calculates exact percentage of the day passed (0.000 to 0.999)
        const msSinceMidnight = now.getHours() * 3600000 + now.getMinutes() * 60000 + now.getSeconds() * 1000 + now.getMilliseconds();
        cycle = msSinceMidnight / 86400000;
      }

      // ==========================================
      // 🧮 LERP MATH
      // ==========================================
      let current = STAGES[0];
      let next = STAGES[1];

      for (let i = 0; i < STAGES.length - 1; i++) {
        if (cycle >= STAGES[i].p && cycle <= STAGES[i + 1].p) {
          current = STAGES[i];
          next = STAGES[i + 1];
          break;
        }
      }

      const local = (cycle - current.p) / (next.p - current.p);
      const smooth = local * local * (3 - 2 * local); // Smoothstep for buttery transition

      // Interpolate all filter values
      const brightness = lerp(current.brightness, next.brightness, smooth);
      const contrast = lerp(current.contrast, next.contrast, smooth);
      const saturate = lerp(current.saturate, next.saturate, smooth);
      const sepia = lerp(current.sepia, next.sepia, smooth);
      const hue = lerp(current.hue, next.hue, smooth);

      const r = lerp(current.overlay[0], next.overlay[0], smooth);
      const g = lerp(current.overlay[1], next.overlay[1], smooth);
      const b = lerp(current.overlay[2], next.overlay[2], smooth);
      const a = lerp(current.overlay[3], next.overlay[3], smooth);

      // ==========================================
      // ⚡ FAST DOM MUTATION
      // ==========================================
      if (imageRef.current) {
        // transform-gpu and scale 1.02 pushed here for performance!
        imageRef.current.style.transform = 'translateZ(0) scale(1.02)'; 
        imageRef.current.style.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturate}) sepia(${sepia}) hue-rotate(${hue}deg)`;
      }

      if (atmosphereRef.current) {
        atmosphereRef.current.style.backgroundColor = `rgba(${r},${g},${b},${a})`;
      }

      // Unlocks max refresh rate (runs 280 times a sec on your display)
      reqId = requestAnimationFrame(animate); 
    };

    reqId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(reqId);
  }, [isDynamicWallpaper, wallpaper]);

  // 🎨 FALLBACK THEME
  if (wallpaper === 'default') {
    return (
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-[#030305] to-[#12121a]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8d6bff]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#52d9ff]/10 rounded-full blur-[120px]" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0 pointer-events-none bg-black overflow-hidden">
      {/* 🖼️ DYNAMIC WALLPAPER LAYER */}
      <img 
        ref={imageRef}
        src={wallpaper} 
        alt="Desktop Wallpaper" 
        className="absolute inset-0 w-full h-full object-cover will-change-[filter,transform] transform-gpu transition-opacity duration-1000 ease-out" 
      />
      
      {/* 🌫️ ATMOSPHERE OVERLAY (Colors the sky nicely) */}
      <div 
        ref={atmosphereRef}
        className="absolute inset-0 mix-blend-multiply transition-opacity duration-1000"
      />

      {/* 🕶️ USER PREFERENCE OVERLAY (Dim & Blur) */}
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