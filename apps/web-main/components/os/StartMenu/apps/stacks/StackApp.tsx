import React from 'react';
import { SYSTEM_APPS } from '../PinnedApps';

interface StackAppProps {
  name: string;
  appIds: string[];
  onClick: () => void;
  isDragOver?: boolean;
}

export default function StackApp({ name, appIds, onClick, isDragOver }: StackAppProps) {
  // Get first 4 apps to show in the mini-grid preview
  const previewApps = appIds.slice(0, 4).map(id => SYSTEM_APPS.find(app => app.id === id)).filter(Boolean);

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group hover:bg-white/[0.03] active:scale-95 border border-transparent w-full"
    >
      {/* 📁 IOS-STYLE FOLDER ICON (PERFECT GRID FIX) */}
      <div className={`w-14 h-14 rounded-2xl grid grid-cols-2 grid-rows-2 gap-[3px] p-1.5 shadow-inner transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] ${
        isDragOver ? 'bg-white/20 border-white/30 scale-110' : 'bg-white/10 border-white/5'
      } border backdrop-blur-md overflow-hidden`}>
        {previewApps.map((app, i) => (
          <div key={i} className={`w-full h-full rounded-[5px] flex items-center justify-center ${app?.color} shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/5`}>
             {/* Icon size chota kiya (size 10) taaki 20x20 ke dibbe me perfectly fit ho */}
             {React.cloneElement(app?.icon as React.ReactElement, { size: 10 })}
          </div>
        ))}
      </div>
      
      <span className="text-[11px] font-medium text-white/80 group-hover:text-white transition-colors truncate w-full text-center mt-2">
        {name}
      </span>
    </button>
  );
}