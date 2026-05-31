"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { api, API_URLS } from "@/lib/api";
import { useThemeStore } from "@/store/useThemeStore";

import { NeuralEditor } from "@/components/canvas/NeuralEditor";
import { CanvasBackground } from "@/components/canvas/CanvasBackground";
import { AspectRatioControls } from "@/components/canvas/AspectRatioControls";
import { CanvasTabBar, CanvasPage } from "@/components/canvas/CanvasTabBar";

export default function CanvasEditor() {
  const params = useParams();
  const canvasId = params.id as string;

  const { 
    theme, setCanvasMode, setCanvasTitle, setCanvasSaveStatus, 
    canvasTitle, forceSaveTrigger, forceShareTrigger, forceDeleteTrigger 
  } = useThemeStore();
  
  const isLight = theme === 'light-verdant' || theme === 'light';

  const [aspectRatio, setAspectRatio] = useState("infinite");
  const [isLoading, setIsLoading] = useState(true);
  
  // 🚀 DEFAULT ROOT NODE
  const [pages, setPages] = useState<CanvasPage[]>([{ id: 'default', name: 'Main Node', content: '', parentId: null }]);
  const [activePageId, setActivePageId] = useState<string>('default');
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch Existing Canvas Data
  useEffect(() => {
    setCanvasMode(true);
    const fetchCanvas = async () => {
      try {
        const data = await api.get(`${API_URLS.HUB.replace('/api/v1', '/api/v1/canvas')}/${canvasId}`);
        setCanvasTitle(data.title || "Untitled Node");
        setAspectRatio(data.aspect_ratio || "infinite");
        
        if (data.content && data.content !== "{}" && data.content !== "\"\"") {
          let parsed = data.content;
          if (typeof parsed === 'string') parsed = JSON.parse(parsed);
          
          if (Array.isArray(parsed) && parsed.length > 0) {
            // 🚀 Backward Compatibility: Add parentId if missing
            const normalizedPages = parsed.map(p => ({
              ...p,
              parentId: p.parentId !== undefined ? p.parentId : null
            }));
            setPages(normalizedPages);
            setActivePageId(normalizedPages[0].id);
          } else if (parsed && Object.keys(parsed).length > 0 && !Array.isArray(parsed)) {
            setPages([{ id: 'default', name: 'Main Node', content: JSON.stringify(parsed), parentId: null }]);
          }
        }
      } catch (error) {
        console.error("Failed to load canvas data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCanvas();
    return () => setCanvasMode(false);
  }, [canvasId]);

  // 2. SAVE LOGIC
  const handleSaveToCloud = async () => {
    if (isLoading) return;
    setCanvasSaveStatus("Saving...");
    try {
      await api.raw(`${API_URLS.HUB.replace('/api/v1', '/api/v1/canvas')}/${canvasId}`, {
        method: "PATCH",
        body: JSON.stringify({ title: canvasTitle, aspect_ratio: aspectRatio, content: JSON.stringify(pages) })
      });
      setCanvasSaveStatus("Saved to Cloud");
      window.dispatchEvent(new Event("refresh-notes-stats"));
    } catch (error) {
      setCanvasSaveStatus("Offline - Saved Locally");
    }
  };

  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => handleSaveToCloud(), 1500);
  }, [canvasTitle, aspectRatio, pages]);

  useEffect(() => { if (forceSaveTrigger > 0) handleSaveToCloud(); }, [forceSaveTrigger]);

  useEffect(() => {
    if (forceShareTrigger > 0) {
      navigator.clipboard.writeText(window.location.href);
      setCanvasSaveStatus("Link Copied!");
      setTimeout(() => setCanvasSaveStatus("Saved to Cloud"), 2000);
    }
  }, [forceShareTrigger]);

  useEffect(() => {
    if (forceDeleteTrigger > 0) {
      if (confirm("WARNING: Purge this entire Canvas Node and its pages?")) {
        setCanvasSaveStatus("Purging...");
        api.raw(`${API_URLS.HUB.replace('/api/v1', '/api/v1/canvas')}/${canvasId}`, { method: "DELETE" })
          .then(() => window.location.href = '/canvas')
          .catch(() => setCanvasSaveStatus("Delete Failed"));
      }
    }
  }, [forceDeleteTrigger]);

  // ==========================================
  // 🚀 3. PAGE (NODE) MANAGEMENT LOGIC
  // ==========================================
  
  const handleAddPage = (parentId: string | null) => {
    const newName = prompt("Initialize Node Name:", "New Neural Node");
    if (!newName) return; // Action cancelled if user didn't enter a name
    
    const newId = `node-${Date.now()}`;
    setPages([...pages, { id: newId, name: newName, content: '', parentId }]);
    setActivePageId(newId); // Focus the newly created node
  };

  const handleRenamePage = (id: string, currentName: string) => {
    const newName = prompt("Rename Neural Node:", currentName);
    if (newName && newName.trim()) {
      setPages(pages.map(p => p.id === id ? { ...p, name: newName } : p));
    }
  };

  // 🚀 Cascading Delete: Us Node ko aur uske saare bacchon (sub-nodes) ko delete karo
  const handleDeletePage = (idToDelete: string) => {
    if (!confirm("Are you sure you want to delete this node and ALL its sub-nodes?")) return;

    // Recursive function to find all descendant IDs
    const getDescendants = (parentId: string): string[] => {
      const childrenIds = pages.filter(p => p.parentId === parentId).map(p => p.id);
      let allDescendants = [...childrenIds];
      childrenIds.forEach(childId => {
        allDescendants = [...allDescendants, ...getDescendants(childId)];
      });
      return allDescendants;
    };

    const idsToRemove = [idToDelete, ...getDescendants(idToDelete)];
    const remainingPages = pages.filter(p => !idsToRemove.includes(p.id));

    // Fallback if the last node gets deleted
    if (remainingPages.length === 0) {
      const fallbackId = `default-${Date.now()}`;
      setPages([{ id: fallbackId, name: 'Main Node', content: '', parentId: null }]);
      setActivePageId(fallbackId);
    } else {
      setPages(remainingPages);
      if (idsToRemove.includes(activePageId)) {
        setActivePageId(remainingPages[0].id); // Switch active page to first available
      }
    }
  };

  const activePage = pages.find(p => p.id === activePageId) || pages[0];

  return (
    <div className={`fixed top-0 left-0 w-screen h-screen flex flex-col transition-colors duration-700 z-10 font-sans
      ${isLight ? 'bg-[#f4f6f8]' : 'bg-[#030303]'}`}>
      
      <CanvasBackground isLight={isLight} />
      <AspectRatioControls aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} isLight={isLight} />

      {!isLoading && (
        <CanvasTabBar 
          pages={pages}
          activePageId={activePageId}
          setActivePageId={setActivePageId}
          onAddPage={handleAddPage}
          onRenamePage={handleRenamePage}
          onDeletePage={handleDeletePage} // 🚀 Pass delete logic
          aspectRatio={aspectRatio}
          isLight={isLight}
        />
      )}

      {/* CANVAS WORKSPACE AREA */}
      <div className="flex-1 w-full h-full overflow-auto z-10 pt-28 pb-32 flex flex-col items-center justify-start pl-4 md:pl-[300px] pr-4 md:pr-10 custom-scrollbar">
        <div 
          className={`transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] relative flex flex-col flex-shrink-0 group
            ${isLight 
              ? 'bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.08),0_0_20px_rgba(0,0,0,0.02)] border border-slate-200/60' 
              : 'bg-[#090909] border border-white/5 shadow-[0_30px_100px_rgba(0,0,0,0.8)] hover:border-white/10'}
            ${aspectRatio === 'A4' ? 'w-[794px] min-h-[1123px] rounded-xl' : ''}
            ${aspectRatio === '16:9' ? 'w-full max-w-[1280px] aspect-video rounded-3xl' : ''}
            ${aspectRatio === 'infinite' ? 'w-full max-w-[1600px] min-h-[calc(100vh-160px)] rounded-[40px] border-dashed border-2 border-primary/20 hover:border-primary/40' : ''}
          `}
        >
          {!isLight && <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0_0_30px_rgba(255,255,255,0.01)] transition-opacity group-hover:shadow-[inset_0_0_30px_rgba(255,255,255,0.03)]"></div>}

          <div className="flex-1 w-full h-full relative z-10 p-4 md:p-8">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center h-full opacity-60 font-mono text-center pt-32 animate-pulse">
                 <div className="w-8 h-8 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin mb-6 shadow-[0_0_15px_rgba(var(--primary),0.5)]"></div>
                 <p className="text-xs uppercase tracking-[0.3em] font-black">Establishing Neural Link...</p>
              </div>
            ) : (
              <NeuralEditor 
                key={activePageId} 
                initialContent={activePage?.content || ''} 
                onChange={(newContent) => {
                  setPages(pages.map(p => p.id === activePageId ? { ...p, content: newContent } : p));
                }} 
                isLight={isLight} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}