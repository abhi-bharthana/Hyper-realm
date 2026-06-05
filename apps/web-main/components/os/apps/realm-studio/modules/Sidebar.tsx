import React, { useState, useRef, useEffect } from 'react';
import { Box, FolderTree, FileCode, Settings, FilePlus, FolderPlus, Rocket } from 'lucide-react';

interface SidebarProps {
  workspaceName: string; // 🚀 NAYA: Dynamic Project Name
  files: { path: string; name: string }[];
  activeFile: string;
  setActiveFile: (path: string) => void;
  unsavedDrafts: Record<string, boolean>;
  onCreateItem: (type: 'file' | 'folder', name: string) => void;
  onNewProject: () => void; // 🚀 NAYA: Trigger Project Wizard
}

export const Sidebar: React.FC<SidebarProps> = ({ workspaceName, files, activeFile, setActiveFile, unsavedDrafts, onCreateItem, onNewProject }) => {
  const [newItemType, setNewItemType] = useState<'file' | 'folder' | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (newItemType && inputRef.current) inputRef.current.focus();
  }, [newItemType]);

  const handleCreateSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newItemName.trim()) {
      onCreateItem(newItemType!, newItemName.trim());
      setNewItemType(null);
      setNewItemName('');
    } else if (e.key === 'Escape') {
      setNewItemType(null);
      setNewItemName('');
    }
  };

  return (
    <div className="w-64 bg-black/40 border-r border-white/5 flex flex-col backdrop-blur-md shrink-0">
      
      {/* 🚀 WORKSPACE HEADER */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between group">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 bg-[#8d6bff]/20 rounded-xl text-[#8d6bff] shrink-0">
             <Box size={18} />
          </div>
          <div className="overflow-hidden">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Workspace</h3>
            <p className="text-sm font-bold text-white truncate" title={workspaceName}>{workspaceName}</p>
          </div>
        </div>
        
        {/* 🚀 CREATE NEW APP BUTTON */}
        <button 
          onClick={onNewProject}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-[#52d9ff]/20 text-gray-400 hover:text-[#52d9ff] transition-all border border-transparent hover:border-[#52d9ff]/30 shrink-0"
          title="Create New Hyper App"
        >
          <Rocket size={16} />
        </button>
      </div>

      <div className="flex-1 p-3 flex flex-col overflow-hidden">
        {/* 🛠️ EXPLORER TOOLBAR */}
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
             <FolderTree size={12} /> Source Files
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setNewItemType('file')} className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              <FilePlus size={14} />
            </button>
            <button onClick={() => setNewItemType('folder')} className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              <FolderPlus size={14} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
          {newItemType && (
            <div className="flex items-center gap-3 px-4 py-2 mb-1 rounded-xl bg-black/60 border border-[#52d9ff]/40 shadow-inner">
              {newItemType === 'file' ? <FileCode size={14} className="text-[#52d9ff]" /> : <FolderTree size={14} className="text-[#8d6bff]" />}
              <input
                ref={inputRef} type="text" value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)} onKeyDown={handleCreateSubmit}
                onBlur={() => { setNewItemType(null); setNewItemName(''); }}
                placeholder={`New ${newItemType}...`}
                className="w-full bg-transparent text-xs text-white font-mono focus:outline-none placeholder:text-gray-600"
              />
            </div>
          )}

          {files.map(file => {
            const isUnsaved = unsavedDrafts[file.path];
            const isActive = activeFile === file.path;

            return (
              <button 
                key={file.path} onClick={() => setActiveFile(file.path)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[1.2rem] text-sm font-medium transition-all relative ${
                  isActive ? 'bg-[#52d9ff]/15 text-[#52d9ff] shadow-inner' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {file.name.endsWith('.json') ? <Settings size={16} className="text-gray-400 shrink-0" /> : <FileCode size={16} className={`shrink-0 ${isActive ? 'text-[#52d9ff]' : 'text-[#8d6bff]'}`} />}
                <span className="truncate">{file.name}</span>
                {isUnsaved && <div className="absolute right-4 w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)] animate-pulse" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};