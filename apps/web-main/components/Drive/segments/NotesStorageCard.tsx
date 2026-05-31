"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, API_URLS } from "@/lib/api";
import { useThemeStore } from "@/store/useThemeStore";
import { FileText, Activity } from "lucide-react";

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export function NotesStorageCard({ isLight }: { isLight: boolean }) {
  const router = useRouter();
  const { theme } = useThemeStore();
  const [notesStats, setNotesStats] = useState({ bytes: 0, count: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStorageStats();
    
    // Listen for custom event to refresh when new notes are created
    const handleRefresh = () => fetchStorageStats();
    window.addEventListener("refresh-notes-stats", handleRefresh);
    return () => window.removeEventListener("refresh-notes-stats", handleRefresh);
  }, []);

  const fetchStorageStats = async () => {
    try {
      const data = await api.get(`${API_URLS.HUB.replace('/api/v1', '/api/v1/canvas/storage')}`);
      setNotesStats({ bytes: data.total_bytes || 0, count: data.total_notes || 0 });
    } catch (error) {
      console.error("Failed to fetch canvas storage", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Canvas allocation logic (e.g. 1GB dedicated for rich text nodes)
  const TOTAL_QUOTA = 1 * 1024 * 1024 * 1024; 
  const percentUsed = ((notesStats.bytes / TOTAL_QUOTA) * 100).toFixed(2);

  return (
    <div 
      onClick={() => router.push('/canvas')}
      className={`p-5 rounded-[2rem] border flex flex-col gap-4 transition-all relative overflow-hidden group cursor-pointer
      ${isLight 
        ? 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300' 
        : 'bg-zinc-900/20 border-white/5 backdrop-blur-2xl hover:bg-white/[0.04] hover:border-white/10'}`}
    >
      
      {/* Dynamic Background Glow on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      {/* Header */}
      <div className="flex justify-between items-start relative z-10">
        <div className={`w-10 h-10 rounded-[1rem] flex items-center justify-center border transition-all duration-300
          ${isLight 
            ? 'bg-slate-50 border-slate-200 group-hover:bg-primary/10' 
            : 'bg-black/40 border-white/10 group-hover:bg-primary/20'}`}>
          <FileText className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" style={{ color: theme?.primary }} />
        </div>
        <div className="text-right">
          <p className="text-[8px] font-mono uppercase opacity-50 tracking-widest flex items-center justify-end gap-1">
            <Activity className="w-2.5 h-2.5" /> Canvas DB
          </p>
          <h3 className="text-lg font-black mt-1">
            {isLoading ? <span className="animate-pulse opacity-50 text-sm">Syncing...</span> : formatBytes(notesStats.bytes)}
          </h3>
        </div>
      </div>

      {/* Details */}
      <div className="relative z-10 mt-1">
        {/* 🚀 Changed to Hyper Canvas */}
        <h4 className={`font-bold text-sm tracking-wide transition-colors ${isLight ? 'group-hover:text-primary' : 'group-hover:text-primary'}`}>
          Hyper Canvas
        </h4>
        <p className="text-[9px] font-mono opacity-50 uppercase tracking-widest mt-1">
          {isLoading ? '-' : notesStats.count} Document Nodes
        </p>
      </div>

      {/* Progress Bar Bottom */}
      <div className={`absolute bottom-0 left-0 w-full h-1.5 ${isLight ? 'bg-slate-100' : 'bg-white/5'}`}>
        <div 
          className="h-full transition-all duration-1000 ease-out" 
          style={{ 
            width: `${Math.max(Number(percentUsed), 1.5)}%`, 
            backgroundColor: theme?.primary,
            boxShadow: `0 0 10px ${theme?.primary}` 
          }} 
        ></div>
      </div>
    </div>
  );
}