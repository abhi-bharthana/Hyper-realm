'use client';

import React, { useRef, useState } from 'react';
import { Palette, Image as ImageIcon, HardDrive, Sparkles, CheckCircle2, UploadCloud, Loader2, Sliders, SunMoon } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore'; 

const STATIC_WALLPAPERS = [
  { id: 'wall-1', name: 'Cosmic Dust', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2048&auto=format&fit=crop' },
  { id: 'wall-2', name: 'Neon City', url: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?q=80&w=2048&auto=format&fit=crop' },
  { id: 'wall-3', name: 'Abstract Liquid', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2048&auto=format&fit=crop' },
  { id: 'wall-4', name: 'Dark Mountains', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2048&auto=format&fit=crop' },
];

export default function AppearanceModule() {
  const { preferences, updatePreferences } = useUserStore();
  
  const currentWallpaper = preferences?.wallpaper || 'default';
  const wallpaperBlur = preferences?.wallpaperBlur ?? 2; 
  const wallpaperDim = preferences?.wallpaperDim ?? 30;
  
  // 🚀 Fetch dynamic toggle state
  const isDynamicWallpaper = preferences?.dynamicWallpaper ?? false;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const setWallpaper = (url: string) => {
    if (updatePreferences) updatePreferences({ wallpaper: url });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }

        canvas.width = width; canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
          try {
            setWallpaper(compressedBase64);
          } catch (error) {
            alert("Image is still too large. Try another one.");
          }
        }
        setIsCompressing(false); 
      };
      img.onerror = () => { setIsCompressing(false); alert("Error loading image."); }
    };
  };

  return (
    <div className="text-white h-full space-y-10 pb-24 w-full">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6 px-2">
        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
          <Palette size={28} className="text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]" />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Appearance</h2>
          <p className="text-sm text-gray-400 font-medium mt-1">Personalize your workspace background and visual theme.</p>
        </div>
      </div>

      {/* STATIC GALLERY */}
      <div className="space-y-4 px-2">
        <h3 className="text-[10px] font-bold tracking-widest uppercase text-gray-500 flex items-center gap-2 mt-8">
          <ImageIcon size={14} /> Static Gallery
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STATIC_WALLPAPERS.map((wall) => {
            const isActive = currentWallpaper === wall.url;
            return (
              <div 
                key={wall.id} onClick={() => setWallpaper(wall.url)}
                className={`group relative h-36 rounded-[1.5rem] border-2 cursor-pointer transition-all duration-300 overflow-hidden shadow-lg ${isActive ? 'border-[#8d6bff] scale-[1.02] shadow-[#8d6bff]/20' : 'border-white/10 hover:border-white/30'}`}
              >
                <img src={wall.url} alt={wall.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4"><p className="font-bold text-white tracking-wide">{wall.name}</p></div>
                {isActive && <div className="absolute top-3 right-3 bg-[#8d6bff] text-black p-1 rounded-full shadow-lg"><CheckCircle2 size={16} fill="currentColor" className="text-white" /></div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* HYPER DRIVE */}
      <div className="space-y-4 px-2">
        <h3 className="text-[10px] font-bold tracking-widest uppercase text-gray-500 flex items-center gap-2 mt-8">
          <HardDrive size={14} /> Hyper Drive
        </h3>
        <div className="flex items-center justify-between p-5 bg-[#0d0d12]/60 backdrop-blur-2xl rounded-[2rem] border border-white/5 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-600/20 shadow-inner border border-white/5"><UploadCloud size={24} className="text-blue-400" /></div>
            <div>
              <p className="font-bold text-lg text-white tracking-wide">Custom Wallpaper</p>
              <p className="text-xs text-gray-400 font-medium">Select an image from your local drive</p>
            </div>
          </div>
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          <button 
            onClick={() => fileInputRef.current?.click()} disabled={isCompressing}
            className={`px-6 py-2.5 rounded-full transition-all font-bold text-sm border shadow-lg flex items-center gap-2 ${isCompressing ? 'bg-blue-500/50 text-white/50 border-transparent cursor-not-allowed' : 'bg-white/10 hover:bg-blue-500 hover:text-white border-white/10 hover:border-blue-400'}`}
          >
            {isCompressing ? <><Loader2 size={16} className="animate-spin" /> Processing</> : 'Browse'}
          </button>
        </div>
      </div>

      {/* ==========================================
          🎛️ WALLPAPER EFFECTS
          ========================================== */}
      <div className="space-y-4 px-2">
        <h3 className="text-[10px] font-bold tracking-widest uppercase text-gray-500 flex items-center gap-2 mt-8">
          <Sliders size={14} /> Wallpaper Effects
        </h3>
        
        <div className="p-6 bg-[#0d0d12]/60 backdrop-blur-2xl rounded-[2rem] border border-white/5 shadow-xl space-y-6">
          
          {/* 🚀 Dynamic Time Engine Toggle */}
          <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.05] transition-colors shadow-inner">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-[#8d6bff] to-[#52d9ff] rounded-xl text-white shadow-[0_0_15px_rgba(141,107,255,0.4)]">
                <SunMoon size={20} />
              </div>
              <div>
                <h3 className="text-white font-bold tracking-wide">Dynamic Time Engine</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Syncs wallpaper filters with time of day</p>
              </div>
            </div>
            
            <button
              onClick={() => updatePreferences({ dynamicWallpaper: !isDynamicWallpaper })}
              className={`relative w-12 h-6 rounded-full transition-colors flex items-center px-1 ${isDynamicWallpaper ? 'bg-[#52d9ff]' : 'bg-white/10 border border-white/20'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isDynamicWallpaper ? 'translate-x-6 shadow-md' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="h-px bg-white/5 w-full my-4" />

          {/* Blur Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-white tracking-wide">Glass Blur Radius</label>
              <span className="text-xs text-[#52d9ff] font-bold bg-[#52d9ff]/10 px-2 py-1 rounded-md">{wallpaperBlur}px</span>
            </div>
            <input 
              type="range" min="0" max="20" step="1"
              value={wallpaperBlur}
              onChange={(e) => updatePreferences({ wallpaperBlur: parseInt(e.target.value) })}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#52d9ff] hover:bg-white/20 transition-all"
            />
            <p className="text-[10px] text-gray-500">Increase blur to make desktop icons and widgets more readable.</p>
          </div>

          {/* Dimmer Slider */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-white tracking-wide">Dark Overlay (Dim)</label>
              <span className="text-xs text-[#8d6bff] font-bold bg-[#8d6bff]/10 px-2 py-1 rounded-md">{wallpaperDim}%</span>
            </div>
            <input 
              type="range" min="0" max="100" step="5"
              value={wallpaperDim}
              onChange={(e) => updatePreferences({ wallpaperDim: parseInt(e.target.value) })}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#8d6bff] hover:bg-white/20 transition-all"
            />
            <p className="text-[10px] text-gray-500">Darken the wallpaper to reduce eye strain in dark environments.</p>
          </div>

        </div>
      </div>

    </div>
  );
}