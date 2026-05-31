"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, API_URLS } from "@/lib/api";
import { useThemeStore } from "@/store/useThemeStore";
import { Plus, LayoutDashboard } from "lucide-react";

export default function CanvasDashboard() {
  const router = useRouter();
  const { theme } = useThemeStore();
  
  const isLight = theme === 'light-verdant' || theme === 'light';

  const [canvases, setCanvases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchCanvases();
  }, []);

  const fetchCanvases = async () => {
    try {
      const data = await api.get(`${API_URLS.HUB.replace('/api/v1', '/api/v1/canvas')}`);
      setCanvases(data.canvases || []);
    } catch (error) {
      console.error("Failed to fetch canvases:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = async () => {
    setIsCreating(true);
    try {
      const newCanvas = await api.post('/api/v1/canvas', {
        title: "New Neural Node",
        aspect_ratio: "infinite"
      });
      router.push(`/canvas/${newCanvas.id}`);
    } catch (error) {
      console.error("Failed to create canvas:", error);
      setIsCreating(false);
    }
  };

  return (
    // 🚀 FULL-BLEED HACK: Fixed viewport to break out of Next.js layout paddings
    <div className={`fixed top-0 left-0 w-screen h-screen overflow-y-auto transition-colors duration-500 z-10
      ${isLight ? 'bg-[#eaedf2] text-slate-900' : 'bg-[#050505] text-white'}`}>
      
      {/* 🌐 HYPER-REALM BLUEPRINT GRID OVERLAY (Stays fixed behind content) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: isLight 
              ? 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.06) 1px, transparent 0)' 
              : 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.08) 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}
        ></div>
        {/* Center Primary Glow */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] blur-[150px] rounded-full pointer-events-none
          ${isLight ? 'bg-primary/10 mix-blend-multiply' : 'bg-primary/10 mix-blend-screen'}`}></div>
      </div>

      {/* 🟢 MAIN CONTENT CONTAINER */}
      <div className="max-w-7xl mx-auto w-full relative z-10 pt-32 px-6 md:px-12 pb-24 min-h-full flex flex-col">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg
              ${isLight ? 'bg-white border border-slate-200' : 'bg-white/5 border border-white/10'}`}>
              <LayoutDashboard className={`w-6 h-6 ${isLight ? 'text-primary' : 'text-primary'}`} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight">Neural Nodes</h1>
              <p className={`mt-1 text-sm font-mono tracking-widest uppercase opacity-60`}>
                Spatial Workspace & Canvas
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleCreateNew}
            disabled={isCreating}
            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 tracking-wide
              ${isCreating ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:scale-105 active:scale-95'}
              bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] border border-primary/50`}
          >
            {isCreating ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
            ) : (
              <Plus className="w-5 h-5" />
            )}
            {isCreating ? 'DEPLOYING...' : 'NEW NODE'}
          </button>
        </div>

        {/* Grid Section */}
        {isLoading ? (
          <div className="flex items-center justify-center h-[50vh]">
            <div className="flex flex-col items-center gap-6 animate-in fade-in duration-1000">
              <div className={`w-16 h-16 rounded-full border flex items-center justify-center transition-colors
                  ${isLight ? 'border-primary/30 bg-primary/10' : 'border-primary/40 bg-primary/5'}`}>
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_15px_var(--primary)]"></div>
              </div>
              <p className="font-mono text-sm tracking-[0.2em] opacity-50 uppercase">Loading Data Matrix...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {canvases.length === 0 ? (
              <div className={`col-span-full text-center py-32 rounded-[32px] border-2 border-dashed backdrop-blur-sm
                ${isLight ? 'border-primary/20 bg-white/50 text-slate-500' : 'border-white/10 bg-black/20 text-white/40'}`}>
                <div className="w-16 h-16 mx-auto mb-4 opacity-20"><Plus className="w-full h-full" /></div>
                <p className="font-mono tracking-widest text-sm">NO NODES FOUND.</p>
                <p className="opacity-50 text-xs mt-2">Initialize a new canvas to start architecting.</p>
              </div>
            ) : (
              canvases.map((canvas) => (
                <div 
                  key={canvas.id}
                  onClick={() => router.push(`/canvas/${canvas.id}`)}
                  className={`group cursor-pointer p-5 rounded-3xl transition-all duration-500 flex flex-col relative overflow-hidden backdrop-blur-xl
                    ${isLight 
                      ? 'bg-white/80 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] hover:-translate-y-2' 
                      : 'bg-[#111]/80 border border-white/5 shadow-2xl hover:border-primary/30 hover:shadow-[0_10px_40px_rgba(var(--primary),0.1)] hover:-translate-y-2'
                    }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                  <div className={`aspect-video w-full rounded-2xl mb-5 flex items-center justify-center text-[10px] tracking-widest font-mono relative overflow-hidden
                    ${isLight ? 'bg-[#eaedf2] border border-black/5' : 'bg-black/50 border border-white/5'}
                  `}>
                    <div className={`border transition-all opacity-50
                      ${isLight ? 'border-slate-400 bg-white' : 'border-white/30 bg-white/5'}
                      ${canvas.aspect_ratio === 'A4' ? 'w-[40%] h-[80%]' : ''}
                      ${canvas.aspect_ratio === '16:9' ? 'w-[80%] h-[45%]' : ''}
                      ${canvas.aspect_ratio === 'infinite' ? 'w-[90%] h-[90%] border-dashed' : ''}
                    `}></div>
                    <span className="absolute bottom-2 right-3 font-bold opacity-30">{canvas.aspect_ratio}</span>
                  </div>
                  
                  <h3 className={`font-bold truncate text-lg transition-colors duration-300
                    ${isLight ? 'text-slate-900 group-hover:text-primary' : 'text-white group-hover:text-primary'}`}>
                    {canvas.title}
                  </h3>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between opacity-50 font-mono text-[10px]">
                    <span>{new Date(canvas.updated_at).toLocaleDateString()}</span>
                    <span className="uppercase">{new Date(canvas.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}