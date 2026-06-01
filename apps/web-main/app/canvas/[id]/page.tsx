"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { api, API_URLS } from "@/lib/api";
import { useThemeStore } from "@/store/useThemeStore";

import { CanvasBackground } from "@/components/canvas/CanvasBackground";
import { AspectRatioControls } from "@/components/canvas/AspectRatioControls";
import { CanvasTabBar, CanvasPage } from "@/components/canvas/CanvasTabBar";
import { NeuralCanvasWorkspace } from "@/components/canvas/NeuralCanvasWorkspace"; 
import { CanvasOverlayRef } from "@/components/canvas/NeuralCanvasOverlay";

export default function CanvasEditor() {
  const params = useParams();
  const canvasId = params.id as string;

  const { 
    theme, setCanvasMode, setCanvasTitle, setCanvasSaveStatus, 
    canvasTitle, forceSaveTrigger, forceShareTrigger, forceDeleteTrigger 
  } = useThemeStore();
  
  const isLight = theme === 'light-verdant' || theme === 'light';

  // 📐 Layout & Core States
  const [aspectRatio, setAspectRatio] = useState("infinite");
  const [isLoading, setIsLoading] = useState(true);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  
  // 🚀 DYNAMIC ISLAND (DOCK) STATES PIPELINE
  // Default menu is 'text' since we removed 'main' for the cleaner Apple UI
  const [activeMenu, setActiveMenu] = useState<'main' | 'text' | 'draw' | 'shapes'>('text');
  const [drawTool, setDrawTool] = useState<'pen' | 'eraser' | 'none'>('none');
  const [brushSize, setBrushSize] = useState(4);
  const [activeColor, setActiveColor] = useState('#22d3ee');

  // 📝 Node Management States
  const [pages, setPages] = useState<CanvasPage[]>([{ id: 'default', name: 'Main Node', content: '', parentId: null }]);
  const [activePageId, setActivePageId] = useState<string>('default');
  
  // 🧠 MEMORY REF: Connects the Vector Draw layer to the Dynamic Dock for seamless Undo/Redo
  const canvasOverlayRef = useRef<CanvasOverlayRef>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ==========================================
  // 1. DATA HYDRATION (Fetch Canvas)
  // ==========================================
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

  // ==========================================
  // 2. CLOUD BACKEND SAVE PIPELINE
  // ==========================================
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
  // 3. NODE MANAGEMENT LOGIC (Tree Actions)
  // ==========================================
  const handleAddPage = (parentId: string | null) => {
    const newName = prompt("Initialize Node Name:", "New Neural Node");
    if (!newName) return;
    
    const newId = `node-${Date.now()}`;
    setPages([...pages, { id: newId, name: newName, content: '', parentId }]);
    setActivePageId(newId);
  };

  const handleRenamePage = (id: string, currentName: string) => {
    const newName = prompt("Rename Neural Node:", currentName);
    if (newName && newName.trim()) {
      setPages(pages.map(p => p.id === id ? { ...p, name: newName } : p));
    }
  };

  const handleDeletePage = (idToDelete: string) => {
    if (!confirm("Are you sure you want to delete this node and ALL its sub-nodes?")) return;

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

    if (remainingPages.length === 0) {
      const fallbackId = `default-${Date.now()}`;
      setPages([{ id: fallbackId, name: 'Main Node', content: '', parentId: null }]);
      setActivePageId(fallbackId);
    } else {
      setPages(remainingPages);
      if (idsToRemove.includes(activePageId)) {
        setActivePageId(remainingPages[0].id);
      }
    }
  };

  const activePage = pages.find(p => p.id === activePageId) || pages[0];

  return (
    <div className={`fixed top-0 left-0 w-screen h-screen flex flex-col transition-colors duration-700 z-10 font-sans overflow-hidden
      ${isLight ? 'bg-[#f4f6f8]' : 'bg-[#030303]'}`}>
      
      {/* 🌌 BACKGROUND & CONTROLS */}
      <CanvasBackground isLight={isLight} />
      <AspectRatioControls aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} isLight={isLight} />

      {/* 👑 LAYER 1: UNIFIED DOCK & SIDEBAR (CanvasTabBar handles both) */}
      {!isLoading && (
        <CanvasTabBar 
          pages={pages} activePageId={activePageId} setActivePageId={setActivePageId}
          onAddPage={handleAddPage} onRenamePage={handleRenamePage} onDeletePage={handleDeletePage}
          aspectRatio={aspectRatio} isLight={isLight}
          
          // 🚀 PIPELINE TO DYNAMIC ISLAND (CanvasBlock inside CanvasTabBar)
          editor={editorInstance} 
          activeMenu={activeMenu} setActiveMenu={setActiveMenu}
          drawTool={drawTool} setDrawTool={setDrawTool}
          brushSize={brushSize} setBrushSize={setBrushSize}
          activeColor={activeColor} setActiveColor={setActiveColor}
          canvasOverlayRef={canvasOverlayRef}
        />
      )}

      {/* 👑 LAYER 2: THE WORKSPACE (Text Editor + Vector Drawing Canvas) */}
      <NeuralCanvasWorkspace 
        isLoading={isLoading}
        aspectRatio={aspectRatio}
        isLight={isLight}
        activePageId={activePageId}
        activePageContent={activePage?.content || ''}
        activeMenu={activeMenu}
        drawTool={drawTool}
        brushSize={brushSize}
        activeColor={activeColor}
        setPagesContent={(newContent) => {
          setPages(pages.map(p => p.id === activePageId ? { ...p, content: newContent } : p));
        }}
        setEditorInstance={(editor) => setEditorInstance(editor)}
        canvasOverlayRef={canvasOverlayRef}
      />
    </div>
  );
}