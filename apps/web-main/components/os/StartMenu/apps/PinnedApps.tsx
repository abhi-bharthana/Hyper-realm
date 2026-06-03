import React, { useState } from 'react';
import { Terminal, PenTool, Image as ImageIcon, Settings, Activity, Calculator, FolderOpen, ChevronLeft, ShieldCheck, Edit2 } from 'lucide-react';
import { useOSStore } from '@/store/useOSStore';
import StackApp from './stacks/StackApp';

// 📌 TERA FULL SYSTEM APP REGISTRY
export const SYSTEM_APPS = [
  { id: 'explorer', name: 'Hyper Drive', icon: <FolderOpen size={24} className="text-[#52d9ff]" />, color: 'bg-[#52d9ff]/10 hover:bg-[#52d9ff]/20' },
  { id: 'terminal', name: 'Terminal', icon: <Terminal size={24} className="text-green-400" />, color: 'bg-green-500/10 hover:bg-green-500/20' },
  { id: 'notes', name: 'Note-Mate', icon: <PenTool size={24} className="text-yellow-400" />, color: 'bg-yellow-500/10 hover:bg-yellow-500/20' },
  { id: 'canvas', name: 'Neural Canvas', icon: <ImageIcon size={24} className="text-[#8d6bff]" />, color: 'bg-[#8d6bff]/10 hover:bg-[#8d6bff]/20' },
  { id: 'taskmanager', name: 'Task Manager', icon: <Activity size={24} className="text-[#ff5f56]" />, color: 'bg-[#ff5f56]/10 hover:bg-[#ff5f56]/20' },
  { id: 'calculator', name: 'Calculator', icon: <Calculator size={24} className="text-lime-400" />, color: 'bg-lime-500/10 hover:bg-lime-500/20' },
  { id: 'wellbeing', name: 'Wellbeing', icon: <Activity size={24} className="text-[#06b6d4]" />, color: 'bg-[#06b6d4]/10 hover:bg-[#06b6d4]/20' },
  { id: 'settings', name: 'Settings', icon: <Settings size={24} className="text-gray-300" />, color: 'bg-gray-500/10 hover:bg-gray-500/20' },
];

interface PinnedAppsProps {
  searchQuery: string;
  showAllApps: boolean;
  setShowAllApps: (val: boolean) => void;
  onClose: () => void;
}

type LayoutItem = { type: 'app', id: string } | { type: 'stack', id: string, name: string, apps: string[] };

export default function PinnedApps({ searchQuery, showAllApps, setShowAllApps, onClose }: PinnedAppsProps) {
  const { openApp } = useOSStore();
  
  // 🧩 STATE: Current Grid Layout (Initial state me sab alag apps hain)
  const [layout, setLayout] = useState<LayoutItem[]>(
    SYSTEM_APPS.map(app => ({ type: 'app', id: app.id }))
  );

  // 📂 STATE: Currently opened Stack (Agar null hai to Home view hai)
  const [activeStack, setActiveStack] = useState<string | null>(null);
  const [dragTarget, setDragTarget] = useState<string | null>(null);

  // 🛠️ DRAG AND DROP LOGIC
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('sourceId', id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragTarget(targetId);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragTarget(null);
    const sourceId = e.dataTransfer.getData('sourceId');
    if (sourceId === targetId) return;

    setLayout(prev => {
      const newLayout = [...prev];
      const sourceIndex = newLayout.findIndex(item => item.id === sourceId);
      const targetIndex = newLayout.findIndex(item => item.id === targetId);
      
      if (sourceIndex === -1 || targetIndex === -1) return prev;

      const sourceItem = newLayout[sourceIndex];
      const targetItem = newLayout[targetIndex];

      // Sirf Apps ko hi utha sakte hain (Stack ke andar stack nahi banega)
      if (sourceItem.type === 'app') {
        // App dropped on App -> Create new Stack
        if (targetItem.type === 'app') {
          newLayout.splice(sourceIndex, 1); // Remove source
          const updatedTargetIndex = newLayout.findIndex(item => item.id === targetId); // Recalculate index
          newLayout[updatedTargetIndex] = {
            type: 'stack',
            id: `stack-${Date.now()}`,
            name: 'New Folder',
            apps: [targetItem.id, sourceItem.id]
          };
        } 
        // App dropped on Stack -> Add to Stack
        else if (targetItem.type === 'stack') {
          newLayout.splice(sourceIndex, 1);
          const updatedTargetIndex = newLayout.findIndex(item => item.id === targetId);
          newLayout[updatedTargetIndex] = {
            ...targetItem,
            apps: [...targetItem.apps, sourceItem.id]
          };
        }
      }
      return newLayout;
    });
  };

  // ----------------------------------------------------
  // 🪄 RENDER: SEARCH / ALL APPS VIEW
  // ----------------------------------------------------
  if (searchQuery || showAllApps) {
    const filteredApps = SYSTEM_APPS.filter(app => app.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 px-2 mb-4">
          {showAllApps && !searchQuery && (
            <button onClick={() => setShowAllApps(false)} className="text-white/50 hover:text-white transition-colors"><ChevronLeft size={16} /></button>
          )}
          <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest">{searchQuery ? 'Search Results' : 'All System Apps'}</h3>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {filteredApps.map(app => (
             <AppButton key={app.id} app={app} onClick={() => { openApp(app.id, app.name); onClose(); }} showBadge={true} />
          ))}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 📂 RENDER: OPEN STACK VIEW
  // ----------------------------------------------------
  if (activeStack) {
    const stackData = layout.find(item => item.id === activeStack) as { type: 'stack', name: string, apps: string[] };
    if (!stackData) return null;
    
    return (
      <div className="mb-6 animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center justify-between px-2 mb-4 bg-white/5 p-2 rounded-xl">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveStack(null)} className="text-white/50 hover:text-white transition-colors bg-black/40 p-1.5 rounded-lg"><ChevronLeft size={16} /></button>
            <input 
              type="text" 
              value={stackData.name}
              onChange={(e) => {
                setLayout(prev => prev.map(item => item.id === activeStack ? { ...item, name: e.target.value } : item));
              }}
              className="bg-transparent text-sm font-bold text-white focus:outline-none focus:border-b border-white/20 w-32"
            />
            <Edit2 size={12} className="text-white/30" />
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-3 bg-black/20 p-4 rounded-2xl border border-white/5 shadow-inner">
          {stackData.apps.map(appId => {
            const app = SYSTEM_APPS.find(a => a.id === appId);
            if (!app) return null;
            return <AppButton key={app.id} app={app} onClick={() => { openApp(app.id, app.name); onClose(); }} />;
          })}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 🏠 RENDER: HOME / PINNED VIEW (With Drag & Drop)
  // ----------------------------------------------------
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between px-2 mb-4">
        <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest">Pinned Apps</h3>
        <button onClick={() => setShowAllApps(true)} className="text-[10px] bg-white/5 hover:bg-white/10 text-white/50 px-2 py-1 rounded-full transition-colors font-semibold">
          All apps {'>'}
        </button>
      </div>
      
      {/* 🚀 INCREASED GRID TO 4 COLUMNS */}
      <div className="grid grid-cols-4 gap-3">
        {layout.map((item) => {
          if (item.type === 'app') {
            const app = SYSTEM_APPS.find(a => a.id === item.id);
            if (!app) return null;
            return (
              <div 
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDrop={(e) => handleDrop(e, item.id)}
                onDragLeave={() => setDragTarget(null)}
              >
                <AppButton 
                  app={app} 
                  onClick={() => { openApp(app.id, app.name); onClose(); }} 
                  isDragOver={dragTarget === item.id} 
                />
              </div>
            );
          } else {
            return (
              <div
                key={item.id}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDrop={(e) => handleDrop(e, item.id)}
                onDragLeave={() => setDragTarget(null)}
              >
                <StackApp 
                  name={item.name} 
                  appIds={item.apps} 
                  onClick={() => setActiveStack(item.id)} 
                  isDragOver={dragTarget === item.id}
                />
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 🧩 HELPER COMPONENT: Reusable App Button
// ----------------------------------------------------
function AppButton({ app, onClick, showBadge, isDragOver }: { app: any, onClick: () => void, showBadge?: boolean, isDragOver?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group hover:bg-white/[0.03] active:scale-95 border border-transparent hover:border-white/5 w-full cursor-grab active:cursor-grabbing"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-inner border transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] ${app.color} ${isDragOver ? 'border-[#52d9ff] scale-110 bg-white/20' : 'border-white/5'}`}>
        {app.icon}
      </div>
      <span className="text-[11px] font-medium text-white/80 group-hover:text-white transition-colors truncate w-full text-center">
        {app.name}
      </span>
      {showBadge && (
        <span className="text-[8px] text-white/30 font-bold uppercase tracking-widest mt-1 flex items-center gap-1"><ShieldCheck size={8} /> System</span>
      )}
    </button>
  );
}