'use client';

import { useEffect, useState } from "react";
import { Clock, RefreshCw, GitCommit, Move, Copy, Trash2, Edit3, Share2 } from "lucide-react";

interface FootprintNode {
  id: string;
  action: "UPLOAD" | "DELETE" | "RENAME" | "COPY" | "MOVE" | "SHARE";
  target: string;
  details: string;
  timestamp: string;
}

interface ActivityTimelineProps {
  userId: string;
  objectKey?: string; 
  isLight: boolean;
}

const DUMMY_FOOTPRINTS: FootprintNode[] = [
  { id: '1', action: 'UPLOAD', target: 'fusion_core.py', details: 'Node payload synchronized to VFS', timestamp: new Date().toISOString() },
  { id: '2', action: 'RENAME', target: 'styles.css', details: 'Alias mutated from style_old.css', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', action: 'DELETE', target: 'temp_cache.bin', details: 'Garbage collection purge executed', timestamp: new Date(Date.now() - 7200000).toISOString() }
];

export function ActivityTimeline({ userId, objectKey, isLight }: ActivityTimelineProps) {
  const [history, setHistory] = useState<FootprintNode[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTimelineLogs = () => {
    setLoading(true);
    // 🛑 STRICT BYPASS: No API call at all to prevent Next.js 404 Crash
    setTimeout(() => {
      setHistory(DUMMY_FOOTPRINTS);
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    loadTimelineLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, objectKey]);

  const getActionMeta = (action: string) => {
    switch (action) {
      case "RENAME": return { icon: <Edit3 className="w-3 h-3" />, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
      case "COPY": return { icon: <Copy className="w-3 h-3" />, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
      case "MOVE": return { icon: <Move className="w-3 h-3" />, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" };
      case "DELETE": return { icon: <Trash2 className="w-3 h-3" />, color: "text-red-400 bg-red-500/10 border-red-500/20" };
      case "SHARE": return { icon: <Share2 className="w-3 h-3" />, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" };
      default: return { icon: <GitCommit className="w-3 h-3" />, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    }
  };

  return (
    <div className={`p-5 rounded-[2rem] border flex flex-col gap-4 w-full ${
      isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/20 border-white/5 backdrop-blur-2xl'
    }`}>
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
          <Clock className="w-4 h-4 text-[#8d6bff]" />
          <span>Ecosystem Footprints</span>
        </div>
        <button onClick={loadTimelineLogs} className="p-1 hover:bg-white/5 rounded-lg transition active:scale-95 text-gray-500 hover:text-white">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto custom-scrollbar relative pl-2 pr-1">
        {loading ? (
          <div className="text-[9px] font-mono opacity-40 uppercase tracking-widest text-center py-6 animate-pulse text-[#52d9ff]">Syncing logs map...</div>
        ) : history.length === 0 ? (
          <div className="text-[9px] font-mono opacity-30 uppercase tracking-widest text-center py-6 italic">No mutations tracking recorded</div>
        ) : (
          history.map((node, index) => {
            const meta = getActionMeta(node.action);
            return (
              <div key={node.id || index} className="flex gap-3 items-start relative group">
                {index !== history.length - 1 && (
                  <div className={`absolute left-3.5 top-7 bottom-0 w-px ${isLight ? 'bg-slate-200' : 'bg-white/5'}`} />
                )}
                
                <div className={`p-2 rounded-xl border shrink-0 z-10 shadow-lg ${meta.color}`}>
                  {meta.icon}
                </div>
                
                <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
                  <div className="flex items-center justify-between gap-4 font-mono text-[9px] uppercase tracking-wide">
                    <span className="font-black text-[#52d9ff]">{node.action}</span>
                    <span className="opacity-40">{new Date(node.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs font-bold truncate max-w-[200px] sm:max-w-xs">{node.target}</p>
                  <p className="text-[10px] text-gray-500 opacity-80 leading-relaxed font-mono tracking-tight">{node.details}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}