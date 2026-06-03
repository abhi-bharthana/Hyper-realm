import React, { useState } from 'react';
import { LayoutDashboard } from 'lucide-react';

export default function WidgetsModule() {
  const [widgets, setWidgets] = useState({
    storage: true, calendar: false, notes: true, cryptoTicker: false
  });

  return (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
      <h2 className="text-3xl font-black mb-2 flex items-center gap-3 tracking-tight">
        <LayoutDashboard className="text-[#52d9ff]" size={28} /> Global Widgets
      </h2>
      <p className="text-white/40 text-sm mb-8 font-medium">Toggle components across your OS Desktop and Main Dashboard.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(widgets).map(([key, isActive]) => (
          <div key={key} className="flex items-center justify-between p-5 rounded-3xl border border-white/5 bg-black/20 hover:bg-white/[0.03] transition-all duration-300 shadow-lg group">
            <div>
              <div className="font-bold capitalize text-sm text-white/80 group-hover:text-white transition-colors">{key.replace(/([A-Z])/g, ' $1').trim()} Module</div>
              <div className="text-[10px] text-white/40 mt-1 uppercase tracking-widest font-bold">Environment Sync</div>
            </div>
            <button onClick={() => setWidgets(prev => ({ ...prev, [key]: !prev[key as keyof typeof widgets] }))} className={`w-12 h-6 rounded-full p-1 transition-all duration-500 ease-out flex items-center shadow-inner ${isActive ? 'bg-[#52d9ff]' : 'bg-white/10'}`}>
              <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-md ${isActive ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}