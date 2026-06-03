import React from 'react';
import { FileText, Image as ImageIcon, Code, Clock } from 'lucide-react';

export default function RecentFiles() {
  // Dummy data (Future mein tu isko VFS ya Audit logs API se connect kar sakta hai)
  const recentActivity = [
    { id: 1, name: 'Project_Alpha_Specs.txt', time: '12 mins ago', icon: <FileText size={16} className="text-[#ffbd2e]" /> },
    { id: 2, name: 'Hyper_UI_Mockup.png', time: '1 hour ago', icon: <ImageIcon size={16} className="text-[#52d9ff]" /> },
    { id: 3, name: 'quantum_gravity_v2.go', time: 'Yesterday', icon: <Code size={16} className="text-[#27c93f]" /> },
  ];

  return (
    <div>
      <div className="flex items-center justify-between px-2 mb-4">
        <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest flex items-center gap-2">
          <Clock size={12} className="text-white/40" /> Recommended
        </h3>
        <button className="text-[10px] bg-white/5 hover:bg-white/10 text-white/50 px-2 py-1 rounded-full transition-colors font-semibold">
          More {'>'}
        </button>
      </div>

      <div className="bg-black/20 rounded-2xl border border-white/5 overflow-hidden flex flex-col">
        {recentActivity.map((item, index) => (
          <button
            key={item.id}
            className={`flex items-center justify-between p-3 hover:bg-white/5 transition-colors group ${
              index !== recentActivity.length - 1 ? 'border-b border-white/5' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-white/10 transition-colors">
                {item.icon}
              </div>
              <span className="text-xs font-medium text-white/80 group-hover:text-white transition-colors truncate max-w-[150px]">
                {item.name}
              </span>
            </div>
            <span className="text-[10px] text-white/40 font-mono">
              {item.time}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}