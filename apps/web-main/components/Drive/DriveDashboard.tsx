"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/store/useThemeStore";
import { Grid, List, Search } from "lucide-react";

// Components 
import { StorageStats } from "./segments/StorageStats";
import { FileListTable } from "./segments/FileListTable";
import { UploadZone } from "./segments/UploadZone"; 
import { NotesStorageCard } from "./segments/NotesStorageCard";

export function DriveDashboard() {
  const { theme } = useThemeStore();
  const isLight = theme === 'light-verdant' || theme === 'light';
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState("");
  const [usedStorageBytes, setUsedStorageBytes] = useState<number>(0);

  useEffect(() => {
    const handleMetricsSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.used_storage_bytes === "number") {
        setUsedStorageBytes(customEvent.detail.used_storage_bytes);
      }
    };

    window.addEventListener("sync-storage-metrics", handleMetricsSync);
    return () => window.removeEventListener("sync-storage-metrics", handleMetricsSync);
  }, []);

  const handleUploadSuccess = (newUsageBytes: number) => {
    setUsedStorageBytes(newUsageBytes); 
  };

  return (
    // 👑 HYBRID LOCK WRAPPER
    <div className={`
      relative lg:fixed lg:top-[80px] left-0 right-0 lg:bottom-0 
      w-full min-h-[calc(100vh-80px)] lg:min-h-0 
      overflow-y-auto lg:overflow-hidden 
      px-4 sm:px-6 md:px-12 
      pt-4 pb-24 lg:pb-6 
      transition-colors duration-500 flex flex-col items-center bg-transparent lg:z-40
    `}>
      
      {/* CUSTOM SCROLLBAR FOR PANELS */}
      <style dangerouslySetInnerHTML={{__html: `
        .hyper-panel-scrollbar::-webkit-scrollbar { width: 4px; }
        .hyper-panel-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .hyper-panel-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .hyper-panel-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); }
      `}} />

      <div className="w-full h-full max-w-[100vw] lg:max-w-[96vw] flex flex-col gap-4 lg:gap-5 overflow-visible lg:overflow-hidden">
        
        {/* 👑 TITLE HEADER */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 px-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3">
              Hyper <span className="text-primary" style={{ color: theme?.primary }}>Drive</span>
            </h1>
            <p className={`text-[9px] sm:text-[10px] font-mono uppercase tracking-widest ${isLight ? 'text-slate-400 font-bold' : 'text-zinc-500'}`}>
              Distributed Cloud Storage Node Engine
            </p>
          </div>
        </div>

        {/* 🚀 NAYA MASTER STROKE: Mobile-only Upload Zone (Sabse upar chamkega mobile pr) */}
        <div className="block lg:hidden w-full shrink-0 px-2">
          <UploadZone 
            isLight={isLight} 
            onUploadSuccess={handleUploadSuccess} 
          />
        </div>

        {/* 👑 CORE GRID SYSTEM */}
        <div className="w-full h-auto lg:h-full flex flex-col lg:grid lg:grid-cols-4 gap-6 lg:gap-8 items-start overflow-visible lg:overflow-hidden pb-4">
          
          {/* 🚀 LEFT COLUMN: Analytics & Stats (Mobile par order-last hokar sabse neeche chala jayega) */}
          <div className="lg:col-span-1 flex flex-col gap-4 lg:gap-5 w-full h-auto lg:h-full overflow-visible lg:overflow-y-auto hyper-panel-scrollbar pr-0 lg:pr-2 lg:pb-10 order-last lg:order-none">
            
            {/* Desktop-only Upload Zone (Mobile par hidden rahega taaki double upload box na dikhe) */}
            <div className="hidden lg:block">
              <UploadZone 
                isLight={isLight} 
                onUploadSuccess={handleUploadSuccess} 
              />
            </div>

            <StorageStats 
              isLight={isLight} 
              customUsedBytes={usedStorageBytes} 
            />
            <NotesStorageCard isLight={isLight} />
          </div>

          {/* 🚀 RIGHT COLUMN: Directory Browsing Console (Mobile par order-first hokar Upload ke theek niche aayega) */}
          <div className={`lg:col-span-3 
            h-[75vh] lg:h-full 
            border rounded-3xl lg:rounded-[2.5rem] 
            p-4 sm:p-6 lg:p-8 
            flex flex-col w-full transition-all duration-500 overflow-hidden order-first lg:order-none
            ${isLight ? 'bg-white border-slate-200/90 shadow-md shadow-slate-100/50' : 'bg-white/[0.01] border-white/5 backdrop-blur-2xl'}
          `}>
            
            {/* Search & View Mode Header */}
            <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b mb-4 lg:mb-6 shrink-0 ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
              
              <div className={`flex items-center gap-3 px-4 py-2 rounded-full border w-full sm:max-w-sm transition-all ${
                isLight ? 'bg-slate-50 border-slate-200 focus-within:border-slate-400/80 text-slate-900' : 'bg-black/25 border-white/5 focus-within:border-white/20 text-white'
              }`}>
                <Search className="w-4 h-4 opacity-40 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Query files by namespace stream..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`bg-transparent focus:outline-none text-xs w-full placeholder:opacity-40 ${isLight ? 'text-slate-900 font-semibold' : 'text-white'}`}
                />
              </div>

              <div className="flex items-center justify-end w-full sm:w-auto gap-1.5">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-xl transition-all active:scale-90 ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'opacity-40'}`}
                  style={viewMode === 'grid' ? { color: theme?.primary, backgroundColor: `${theme?.primary}1a` } : {}}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-xl transition-all active:scale-90 ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'opacity-40'}`}
                  style={viewMode === 'list' ? { color: theme?.primary, backgroundColor: `${theme?.primary}1a` } : {}}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Locked FileListTable Explorer */}
            <div className="w-full flex-1 flex flex-col justify-start overflow-hidden relative">
              <FileListTable isLight={isLight} viewMode={viewMode} searchQuery={searchQuery} />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}