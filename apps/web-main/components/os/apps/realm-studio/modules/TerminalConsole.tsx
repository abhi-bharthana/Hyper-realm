import React from 'react';
import { Terminal } from 'lucide-react';

interface TerminalConsoleProps {
  logs: string[];
}

export const TerminalConsole: React.FC<TerminalConsoleProps> = ({ logs }) => {
  return (
    <div className="h-48 border-t border-white/10 bg-[#050508] p-4 flex flex-col shrink-0">
       <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
          <Terminal size={12} /> Developer Console
       </div>
       <div className="flex-1 overflow-y-auto font-mono text-xs space-y-1.5 custom-scrollbar">
         {logs.map((log, i) => (
            <div key={i} className={`${log.includes('Success') ? 'text-green-400' : log.includes('System') || log.includes('VFS') ? 'text-[#52d9ff]' : 'text-gray-400'}`}>
              <span className="text-gray-600 mr-2">❯</span> {log}
            </div>
         ))}
       </div>
    </div>
  );
};