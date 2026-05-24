"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/store/useThemeStore";
import { Grid, List, Search } from "lucide-react";

import { StorageStats } from "./segments/StorageStats";
import { FileListTable } from "./segments/FileListTable";
import { UploadZone } from "./segments/UploadZone"; 

export function DriveDashboard() {
  const { theme } = useThemeStore();
  const isLight = theme === 'light-verdant';
  
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
    <div className="w-full min-h-screen px-4 md:px-10 pb-16 flex flex-col justify-start bg-transparent">
      
      {/* 🚀 DRIVE OPERATIONS BAR */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3">
            Hyper <span className="text-primary" style={{ color: theme?.primary }}>Drive</span>
          </h1>
          <p className={`text-[10px] font-mono uppercase tracking-widest ${isLight ? 'text-slate-400 font-bold' : 'text-zinc-500'}`}>
            Distributed Cloud Storage Node Engine
          </p>
        </div>
      </div>

      {/* 📊 CORE WORKSPACE PIPELINE GRID */}
     
      <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* LEFT COLUMN: Storage Upload Zone + Analytics Metrics */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <UploadZone 
            isLight={isLight} 
            onUploadSuccess={handleUploadSuccess} 
          />
          
          <StorageStats 
            isLight={isLight} 
            customUsedBytes={usedStorageBytes} 
          />
        </div>

        {/* RIGHT COLUMN: Directory Browsing Console */}
  
        <div className={`lg:col-span-3 border rounded-[2.5rem] p-6 sm:p-8 flex flex-col min-h-[650px] transition-all duration-500 w-full ${
          isLight ? 'bg-white border-slate-200/80 shadow-md' : 'bg-white/[0.01] border-white/5 backdrop-blur-2xl'
        }`}>
          
          {/* Grid View & Filter Control Bar */}
          <div className={`flex justify-between items-center pb-4 border-b mb-6 shrink-0 ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
            
            {/* Embedded Search Box Input */}
            <div className={`flex items-center gap-3 px-4 py-2 rounded-full border w-full max-w-xs transition-all ${
              isLight ? 'bg-slate-100 border-slate-200 focus-within:border-slate-400 text-slate-900' : 'bg-black/25 border-white/5 focus-within:border-white/20 text-white'
            }`}>
              <Search className="w-4 h-4 opacity-40" />
              <input 
                type="text" 
                placeholder="Query files..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`bg-transparent focus:outline-none text-xs w-full placeholder:opacity-40 ${isLight ? 'text-slate-900 font-semibold' : 'text-white'}`}
              />
            </div>

            {/* Layout Toggles */}
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'opacity-40'}`}
                style={viewMode === 'grid' ? { color: theme?.primary, backgroundColor: `${theme?.primary}1a` } : {}}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'opacity-40'}`}
                style={viewMode === 'list' ? { color: theme?.primary, backgroundColor: `${theme?.primary}1a` } : {}}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dynamic Directories Allocation Display */}
          <div className="w-full flex-1 flex flex-col justify-start">
            <FileListTable isLight={isLight} viewMode={viewMode} searchQuery={searchQuery} />
          </div>

        </div>
      </div>

    </div>
  );
}