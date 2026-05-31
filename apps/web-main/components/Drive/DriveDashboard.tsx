"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/store/useThemeStore";
import { Grid, List, Search } from "lucide-react";

// Components 
import { StorageStats } from "./segments/StorageStats";
import { FileListTable } from "./segments/FileListTable";
import { UploadZone } from "./segments/UploadZone"; 
import { NotesStorageCard } from "./segments/NotesStorageCard"; // 🚀 NAYA IMPORT

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
    <div className={`relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pt-4 pb-12 px-6 md:px-12 transition-colors duration-500 flex flex-col items-center bg-transparent`}>
      
      <div className="w-full max-w-[96vw] flex flex-col gap-5">
        
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 px-2 mt-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3">
              Hyper <span className="text-primary" style={{ color: theme?.primary }}>Drive</span>
            </h1>
            <p className={`text-[10px] font-mono uppercase tracking-widest ${isLight ? 'text-slate-400 font-bold' : 'text-zinc-500'}`}>
              Distributed Cloud Storage Node Engine
            </p>
          </div>
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* 🚀 LEFT COLUMN: Storage Analytics Panel */}
          <div className="lg:col-span-1 flex flex-col gap-5 w-full sticky top-24">
            <UploadZone 
              isLight={isLight} 
              onUploadSuccess={handleUploadSuccess} 
            />
            
            {/* Ceph Storage Engine Stats */}
            <StorageStats 
              isLight={isLight} 
              customUsedBytes={usedStorageBytes} 
            />

            {/* 🚀 NAYA: Postgres Canvas Notes Storage Stats */}
            <NotesStorageCard isLight={isLight} />
          </div>

          {/* RIGHT COLUMN: Directory Browsing Console */}
          <div className={`lg:col-span-3 border rounded-[2.5rem] p-6 sm:p-8 flex flex-col min-h-[720px] w-full transition-all duration-500 ${
            isLight ? 'bg-white border-slate-200/90 shadow-md shadow-slate-100/50' : 'bg-white/[0.01] border-white/5 backdrop-blur-2xl'
          }`}>
            
            <div className={`flex justify-between items-center pb-4 border-b mb-6 shrink-0 ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
              
              <div className={`flex items-center gap-3 px-4 py-2 rounded-full border w-full max-w-sm transition-all ${
                isLight ? 'bg-slate-50 border-slate-200 focus-within:border-slate-400/80 text-slate-900' : 'bg-black/25 border-white/5 focus-within:border-white/20 text-white'
              }`}>
                <Search className="w-4 h-4 opacity-40" />
                <input 
                  type="text" 
                  placeholder="Query files by namespace stream..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`bg-transparent focus:outline-none text-xs w-full placeholder:opacity-40 ${isLight ? 'text-slate-900 font-semibold' : 'text-white'}`}
                />
              </div>

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

            <div className="w-full flex-1 flex flex-col justify-start">
              <FileListTable isLight={isLight} viewMode={viewMode} searchQuery={searchQuery} />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}