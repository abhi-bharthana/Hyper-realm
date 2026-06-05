import React from 'react';
import { FileCode, X } from 'lucide-react';

interface TabBarProps {
  openTabs: string[];
  activeFilePath: string;
  unsavedDraftsMap: Record<string, boolean>;
  onSelectTab: (path: string) => void;
  onCloseTab: (e: React.MouseEvent, path: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ openTabs, activeFilePath, unsavedDraftsMap, onSelectTab, onCloseTab }) => {
  return (
    <div className="h-10 bg-black/20 border-b border-white/5 flex items-end px-2 gap-1 shrink-0 overflow-x-auto custom-scrollbar hide-scrollbar">
      {openTabs.map(tabPath => {
        const fileName = tabPath.split('/').pop() || 'Unknown';
        const isActive = activeFilePath === tabPath;
        const isTabUnsaved = unsavedDraftsMap[tabPath];

        return (
          <div 
            key={tabPath}
            onClick={() => onSelectTab(tabPath)}
            className={`group h-8 px-4 flex items-center gap-2 rounded-t-[10px] cursor-pointer transition-all border-t border-x ${
              isActive 
                ? 'bg-[#0d0d12] border-white/10 text-[#52d9ff]'
                : 'bg-transparent border-transparent text-gray-500 hover:bg-white/5 hover:text-gray-300'
            }`}
          >
             <FileCode size={12} className={isActive ? 'text-[#52d9ff]' : 'text-gray-500'} />
             <span className="text-xs font-medium tracking-wide">{fileName}</span>
             {isTabUnsaved && <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 ml-1" />}
             
             <button 
               onClick={(e) => onCloseTab(e, tabPath)}
               className={`ml-1 p-0.5 rounded-md transition-colors ${isActive ? 'text-gray-400 hover:bg-white/10 hover:text-white' : 'text-transparent group-hover:text-gray-500 hover:bg-white/10'}`}
             >
               <X size={12} />
             </button>
          </div>
        );
      })}
    </div>
  );
};