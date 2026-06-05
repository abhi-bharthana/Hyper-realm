'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ShieldCheck, Edit2, LayoutGrid } from 'lucide-react';
import { useOSStore } from '@/store/useOSStore';
import { SYSTEM_APPS } from '@/config/apps.config'; // 🚀 TERA CENTRAL REGISTRY

// ==========================================
// 📦 RECURSIVE DATA TYPES
// ==========================================
export type LayoutNode = 
  | { type: 'app'; id: string }
  | { type: 'stack'; id: string; name: string; items: LayoutNode[] };

// 🚀 DEFAULT NESTED LAYOUT (To demonstrate Apple/Xiaomi style)
const INITIAL_LAYOUT: LayoutNode[] = [
  { type: 'app', id: 'explorer' },
  { type: 'app', id: 'settings' },
  {
    type: 'stack',
    id: 'creative_suite',
    name: 'Creative Suite',
    items: [
      { type: 'app', id: 'canvas' },
      { type: 'app', id: 'notes' },
      {
        // 🚀 STACK KE ANDAR STACK (Nested!)
        type: 'stack',
        id: 'dev_tools',
        name: 'Dev Tools',
        items: [
          { type: 'app', id: 'terminal' },
          { type: 'app', id: 'taskmanager' }
        ]
      }
    ]
  },
  { type: 'app', id: 'calculator' },
  { type: 'app', id: 'wellbeing' }
];

interface PinnedAppsProps {
  searchQuery: string;
  showAllApps: boolean;
  setShowAllApps: (val: boolean) => void;
  onClose: () => void;
}

// ==========================================
// 🧩 APPLE STYLE MINI GRID PREVIEW
// ==========================================
const MiniGridPreview = ({ items, level = 0 }: { items: LayoutNode[], level?: number }) => {
  const previewItems = items.slice(0, 4); // Show only top 4
  const radius = level === 0 ? 'rounded-[0.8rem]' : 'rounded-md';
  const iconSize = level === 0 ? 14 : 8;

  return (
    <div className="grid grid-cols-2 gap-1 w-full h-full p-1.5">
      {previewItems.map((item, idx) => {
        if (item.type === 'app') {
          const appDef = SYSTEM_APPS[item.id];
          if (!appDef) return <div key={idx} className={`w-full h-full bg-white/10 ${radius}`} />;
          const Icon = appDef.icon;
          return (
            <div key={idx} className={`w-full h-full flex items-center justify-center bg-black/40 ${appDef.color} ${radius} shadow-inner`}>
               {typeof Icon === 'string' ? (
                 <img src={Icon} alt={appDef.name} className="w-full h-full object-contain p-0.5" />
               ) : (
                 <Icon size={iconSize} strokeWidth={2.5} />
               )}
            </div>
          );
        } else {
          // Recursive preview for nested stack
          return (
            <div key={idx} className={`w-full h-full bg-white/20 ${radius} overflow-hidden shadow-inner flex items-center justify-center`}>
               <LayoutGrid size={iconSize} className="text-white/60" />
            </div>
          );
        }
      })}
    </div>
  );
};

// ==========================================
// 📱 MAIN COMPONENT
// ==========================================
export default function PinnedApps({ searchQuery, showAllApps, setShowAllApps, onClose }: PinnedAppsProps) {
  const { openApp } = useOSStore();
  const [layout, setLayout] = useState<LayoutNode[]>(INITIAL_LAYOUT);
  
  // 📂 BREADCRUMB NAVIGATION (Allows infinite nesting depth)
  const [stackPath, setStackPath] = useState<LayoutNode[]>([]);
  const [dragTarget, setDragTarget] = useState<string | null>(null);

  // 🔎 Helper: Get current level items based on navigation path
  const getCurrentItems = () => {
    if (stackPath.length === 0) return layout;
    const currentFolder = stackPath[stackPath.length - 1];
    return currentFolder.type === 'stack' ? currentFolder.items : [];
  };

  const currentItems = getCurrentItems();

  // ----------------------------------------------------
  // 🪄 RENDER: SEARCH / ALL APPS VIEW
  // ----------------------------------------------------
  if (searchQuery || showAllApps) {
    const allAppsList = Object.values(SYSTEM_APPS);
    const filteredApps = allAppsList.filter(app => app.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 px-3 mb-5">
          {showAllApps && !searchQuery && (
            <button onClick={() => setShowAllApps(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
              <ChevronLeft size={16} className="text-white/70" />
            </button>
          )}
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{searchQuery ? 'Search Results' : 'All System Apps'}</h3>
        </div>
        <div className="grid grid-cols-4 gap-4 place-items-center">
          {filteredApps.map(app => (
             <AppButton key={app.id} app={app} onClick={() => { openApp(app.id, app.name); onClose(); }} showBadge={true} />
          ))}
        </div>
      </motion.div>
    );
  }

  // ----------------------------------------------------
  // 📂 RENDER: HOME OR STACK VIEW (Recursive & Navigable)
  // ----------------------------------------------------
  const isRoot = stackPath.length === 0;
  const currentStack = isRoot ? null : stackPath[stackPath.length - 1];

  return (
    <div className="mb-6 relative min-h-[300px]">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-3 mb-5">
        <div className="flex items-center gap-3">
          {!isRoot && (
            <button 
              onClick={() => setStackPath(prev => prev.slice(0, -1))} 
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10 shadow-sm"
            >
              <ChevronLeft size={16} className="text-white/70" />
            </button>
          )}
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            {isRoot ? 'Pinned Apps' : (
              <>
                {(currentStack as any).name} 
                <Edit2 size={10} className="text-white/30 hover:text-white/70 cursor-pointer transition-colors" />
              </>
            )}
          </h3>
        </div>
        
        {isRoot && (
          <button onClick={() => setShowAllApps(true)} className="text-[10px] bg-white/5 hover:bg-white/10 text-[#52d9ff] px-3 py-1.5 rounded-full transition-all shadow-sm border border-white/5 font-bold uppercase tracking-wider">
            All Apps
          </button>
        )}
      </div>
      
      {/* GRID */}
      <AnimatePresence mode="popLayout">
        <motion.div 
          key={isRoot ? 'root' : currentStack?.id}
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(4px)' }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`grid grid-cols-4 gap-y-6 gap-x-4 place-items-center ${!isRoot ? 'bg-white/5 p-6 rounded-[2.5rem] border border-white/10 shadow-inner backdrop-blur-md' : ''}`}
        >
          {currentItems.map((item) => {
            if (item.type === 'app') {
              const app = SYSTEM_APPS[item.id];
              if (!app) return null;
              return (
                <AppButton 
                  key={item.id} 
                  app={app} 
                  onClick={() => { openApp(app.id, app.name); onClose(); }} 
                  isDragOver={dragTarget === item.id} 
                />
              );
            } else {
              // Render Stack Folder
              return (
                <motion.div 
                  key={item.id}
                  layoutId={`stack-${item.id}`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStackPath(prev => [...prev, item])}
                  className="flex flex-col items-center gap-2 cursor-pointer group w-full"
                >
                  <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 border border-white/20 shadow-lg backdrop-blur-md group-hover:bg-white/20 transition-all overflow-hidden relative">
                     <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                     <MiniGridPreview items={item.items} />
                  </div>
                  <span className="text-[11px] font-medium text-gray-300 tracking-wide truncate w-full text-center">{item.name}</span>
                </motion.div>
              );
            }
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ----------------------------------------------------
// 🧩 HELPER COMPONENT: Reusable App Button (Pill Design)
// ----------------------------------------------------
function AppButton({ app, onClick, showBadge, isDragOver }: { app: any, onClick: () => void, showBadge?: boolean, isDragOver?: boolean }) {
  const Icon = app.icon;
  
  return (
    <motion.button
      layout
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center justify-center rounded-[2rem] transition-all duration-300 group w-full cursor-pointer"
    >
      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-2 shadow-lg backdrop-blur-md border transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] ${app.color} ${isDragOver ? 'border-[#52d9ff] scale-110 bg-white/20' : 'border-white/10 bg-white/5'}`}>
        {typeof Icon === 'string' ? (
          <img src={Icon} alt={app.name} className="w-8 h-8 object-contain drop-shadow-md" />
        ) : (
          <Icon size={28} strokeWidth={1.5} className="drop-shadow-md" />
        )}
      </div>
      <span className="text-[11px] font-medium text-gray-300 group-hover:text-white transition-colors truncate w-full text-center px-1">
        {app.name}
      </span>
      {showBadge && (
        <span className="text-[8px] text-[#52d9ff] bg-[#52d9ff]/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1 border border-[#52d9ff]/20">
          <ShieldCheck size={8} /> System
        </span>
      )}
    </motion.button>
  );
}