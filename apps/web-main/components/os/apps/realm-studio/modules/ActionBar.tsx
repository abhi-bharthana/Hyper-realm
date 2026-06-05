import React from 'react';
import { FolderTree, Save, Play } from 'lucide-react';

interface ActionBarProps {
  workspaceName: string;
  activeFilePath: string;
  activeFileName: string;
  isUnsaved: boolean;
  onSave: () => void;
  onRun: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({ workspaceName, activeFilePath, activeFileName, isUnsaved, onSave, onRun }) => {
  return (
    <div className="h-12 bg-black/40 border-b border-white/5 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
         <FolderTree size={14} className="text-[#8d6bff]" /> 
         {workspaceName} {activeFilePath && <span className="text-gray-600 mx-1">❯</span>} {activeFileName}
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={onSave} disabled={!isUnsaved}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all text-xs font-bold border ${isUnsaved ? 'bg-[#52d9ff]/20 text-[#52d9ff] border-[#52d9ff]/30 shadow-[0_0_15px_rgba(82,217,255,0.2)]' : 'bg-white/5 text-gray-500 border-white/5 cursor-not-allowed'}`}
        >
           <Save size={12} /> Save
        </button>
        <div className="w-px h-5 bg-white/10 mx-1" />
        <button onClick={onRun} className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-all text-xs font-bold border border-green-500/30">
           <Play size={12} /> Run
        </button>
      </div>
    </div>
  );
};