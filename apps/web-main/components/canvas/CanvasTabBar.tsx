"use client";

import { useState, useMemo } from "react";
import { Plus, FileText, Trash2, FolderPlus, ChevronRight, ChevronDown, Search } from "lucide-react";
import { useThemeStore } from "@/store/useThemeStore";
import { CanvasBlock } from "@/components/Navbar/segments/CanvasBlock";

export type CanvasPage = {
  id: string;
  name: string;
  content: string;
  parentId: string | null;
};

interface Props {
  pages: CanvasPage[];
  activePageId: string;
  setActivePageId: (id: string) => void;
  onAddPage: (parentId: string | null) => void;
  onRenamePage: (id: string, currentName: string) => void;
  onDeletePage: (id: string) => void;
  aspectRatio: string;
  isLight: boolean;
  
  editor?: any;
  activeMenu?: 'main' | 'text' | 'draw' | 'shapes';
  setActiveMenu?: (menu: any) => void;
  drawTool?: 'pen' | 'eraser' | 'none';
  setDrawTool?: (tool: any) => void;
  brushSize?: number;
  setBrushSize?: (size: number) => void;
  activeColor?: string;
  setActiveColor?: (color: string) => void;
  canvasOverlayRef?: React.RefObject<any>;
}

export function CanvasTabBar({ 
  pages, activePageId, setActivePageId, onAddPage, onRenamePage, onDeletePage, isLight,
  editor, activeMenu, setActiveMenu, drawTool, setDrawTool, brushSize, setBrushSize, activeColor, setActiveColor, canvasOverlayRef 
}: Props) {
  
  const { canvasTitle, setCanvasTitle, canvasSaveStatus } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return pages;
    const lowerQuery = searchQuery.toLowerCase();
    const matches = pages.filter(p => p.name.toLowerCase().includes(lowerQuery));
    const matchesWithParents = new Set<string>();
    
    matches.forEach(match => {
      matchesWithParents.add(match.id);
      let currentParentId = match.parentId;
      while (currentParentId) {
        matchesWithParents.add(currentParentId);
        const parent = pages.find(p => p.id === currentParentId);
        currentParentId = parent ? parent.parentId : null;
      }
    });

    return pages.filter(p => matchesWithParents.has(p.id));
  }, [pages, searchQuery]);

  const renderTree = (parentId: string | null, depth: number = 0) => {
    const children = filteredPages.filter(p => p.parentId === parentId);
    
    return children.map((p) => {
      const allChildren = pages.filter(child => child.parentId === p.id);
      const hasChildren = allChildren.length > 0;
      const isExpanded = searchQuery.trim() !== "" ? true : !!expandedNodes[p.id];

      return (
        <div key={p.id} className="w-full flex flex-col items-start relative">
          {depth > 0 && (
            <div className={`absolute left-[${depth * 12 + 6}px] top-0 bottom-0 w-[1px] ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}></div>
          )}

          <div 
            onClick={() => setActivePageId(p.id)}
            onDoubleClick={() => onRenamePage(p.id, p.name)}
            style={{ paddingLeft: `${depth * 14 + 12}px`, paddingRight: '12px' }}
            className={`group flex items-center justify-between py-2.5 rounded-xl text-[11px] font-black tracking-wider cursor-pointer transition-all duration-300 shrink-0 select-none uppercase w-full my-0.5 relative z-10
              ${activePageId === p.id 
                ? (isLight ? 'bg-white shadow-sm border border-slate-200 text-primary' : 'bg-white/10 border border-white/5 text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]') 
                : (isLight ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-700' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300')}`}
          >
            <div className="flex items-center gap-1.5 truncate">
              {hasChildren ? (
                <div 
                  onClick={(e) => toggleExpand(p.id, e)}
                  className={`p-0.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${activePageId === p.id ? 'text-primary' : ''}`}
                >
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>
              ) : (
                <div className="w-4.5 h-4.5" />
              )}
              <FileText className={`w-3.5 h-3.5 shrink-0 transition-colors ${activePageId === p.id ? 'text-primary' : 'opacity-40'}`} />
              <span className="truncate">{p.name}</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {hasChildren && !isExpanded && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${isLight ? 'bg-slate-200 text-slate-500' : 'bg-white/10 text-zinc-400'} group-hover:hidden`}>
                  {allChildren.length}
                </span>
              )}
              <div className="hidden group-hover:flex items-center gap-1 animate-in fade-in duration-200">
                <button 
                  onClick={(e) => { e.stopPropagation(); onAddPage(p.id); setExpandedNodes(prev => ({...prev, [p.id]: true})); }} 
                  className={`p-1 rounded-md transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-white/20 text-zinc-400'}`}
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeletePage(p.id); }} 
                  className={`p-1 rounded-md transition-colors ${isLight ? 'hover:bg-red-100 text-red-500' : 'hover:bg-red-500/20 text-red-400'}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {hasChildren && isExpanded && (
            <div className="w-full animate-in slide-in-from-top-1 fade-in duration-200">
              {renderTree(p.id, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <>
      {/* 🚀 FIX: Removed the buggy <div className="fixed top-0 left-0 w-full..."> wrapper. The block manages itself! */}
      <CanvasBlock 
        title={canvasTitle} setTitle={setCanvasTitle} saveStatus={canvasSaveStatus} isLight={isLight} 
        editor={editor} activeMenu={activeMenu} setActiveMenu={setActiveMenu} drawTool={drawTool} setDrawTool={setDrawTool}
        brushSize={brushSize} setBrushSize={setBrushSize} activeColor={activeColor} setActiveColor={setActiveColor} canvasOverlayRef={canvasOverlayRef}
      />

      <div className="fixed left-4 md:left-6 top-1/2 -translate-y-1/2 z-40 flex flex-col pointer-events-none animate-in slide-in-from-left-8 duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
        <div className={`pointer-events-auto flex flex-col items-start p-2.5 rounded-[28px] backdrop-blur-2xl border shadow-2xl transition-all max-h-[80vh] w-64
          ${isLight ? 'bg-white/70 border-white/50 shadow-slate-200/50' : 'bg-[#1c1c1e]/80 border-white/10 shadow-black/50'}
        `}>
          <div className="w-full px-2 mt-1 mb-3 relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`} />
            <input 
              type="text" placeholder="Search nodes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs font-bold tracking-wide outline-none transition-all placeholder:font-medium
                ${isLight ? 'bg-slate-100/50 focus:bg-white text-slate-700 placeholder:text-slate-400 border border-transparent focus:border-primary/30' 
                : 'bg-white/5 focus:bg-black/50 text-white placeholder:text-zinc-500 border border-transparent focus:border-primary/30'}`}
            />
          </div>

          <div className="flex flex-col w-full relative overflow-y-auto custom-scrollbar flex-1 px-1 min-h-[100px]">
            {pages.length === 0 ? <div className="text-center w-full py-4 text-xs font-black tracking-widest text-zinc-500 uppercase opacity-50">Empty</div> : renderTree(null, 0)}
          </div>
          
          <div className={`w-8 h-[2px] mx-auto my-3 shrink-0 rounded-full ${isLight ? 'bg-slate-300' : 'bg-white/10'}`}></div>
          
          <button onClick={() => onAddPage(null)} className={`w-full py-3 rounded-2xl transition-all shrink-0 active:scale-95 group flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest ${isLight ? 'hover:bg-primary/10 text-slate-500 hover:text-primary' : 'hover:bg-primary/20 text-zinc-400 hover:text-primary'}`}>
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            <span>New Root Node</span>
          </button>
        </div>
      </div>
    </>
  );
}