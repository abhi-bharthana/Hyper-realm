"use client";

import { X, Calendar, HardDrive, Plus, Clock, RefreshCw, GitCommit, Move, Copy, Trash2, Edit3, Share2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

// Activity Footprint Structure Interface Mappings
interface FootprintNode {
  id: string;
  action: "UPLOAD" | "DELETE" | "RENAME" | "COPY" | "MOVE" | "SHARE";
  target: string;
  details: string;
  timestamp: string;
}

interface DetailsPanelProps {
  file: any;
  onClose: () => void;
  isLight: boolean;
  onAddTag: (objectKey: string, tag: string) => void;
  onRemoveTag: (objectKey: string, tag: string) => void;
  tags: string[];
}

export function DetailsPanel({ file, onClose, isLight, onAddTag, onRemoveTag, tags }: DetailsPanelProps) {
  const [newTag, setNewTag] = useState("");
  const [history, setHistory] = useState<FootprintNode[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const USER_ID = "abhishek-babu-node";
  const API_BASE = "http://localhost:8001/api/v1/storage";

  // 🎯 TELEMETRY LAYER: Fetch asset specific historical logs from storage audit engine
  const loadAssetTimelineLogs = useCallback(async () => {
    if (!file?.object_name) return;
    setLoadingHistory(true);
    try {
      const response = await axios.get(
        `${API_BASE}/audit/footprints?user_id=${encodeURIComponent(USER_ID)}&object_key=${encodeURIComponent(file.object_name)}`
      );
      setHistory(response.data.footprints || []);
    } catch (err) {
      console.error("Failed to stream asset telemetry context:", err);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, [file?.object_name]);

  // Sync timeline track whenever a new file node selection is triggered
  useEffect(() => {
    loadAssetTimelineLogs();
  }, [loadAssetTimelineLogs]);

  if (!file) return null;

  const handleTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim()) {
      onAddTag(file.object_name, newTag.trim().toUpperCase());
      setNewTag("");
    }
  };

  // Icon switcher mapping based on standard system mutation categories
  const getActionLayoutMeta = (action: string) => {
    switch (action) {
      case "RENAME":
        return { icon: <Edit3 className="w-2.5 h-2.5" />, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
      case "COPY":
        return { icon: <Copy className="w-2.5 h-2.5" />, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
      case "MOVE":
        return { icon: <Move className="w-2.5 h-2.5" />, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" };
      case "DELETE":
        return { icon: <Trash2 className="w-2.5 h-2.5" />, color: "text-red-400 bg-red-500/10 border-red-500/20" };
      case "SHARE":
        return { icon: <Share2 className="w-2.5 h-2.5" />, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" };
      default:
        return { icon: <GitCommit className="w-2.5 h-2.5" />, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    }
  };

  return (
    <div className={`w-full lg:w-80 border rounded-[2.5rem] p-6 flex flex-col gap-5 shrink-0 transition-all duration-300 max-h-[85vh] overflow-y-auto custom-scrollbar ${
      isLight ? 'bg-white border-slate-200/90 shadow-md' : 'bg-zinc-900/40 border-white/5 backdrop-blur-2xl'
    }`}>
      {/* Header Block Panel */}
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <h4 className="text-[10px] font-mono font-black uppercase tracking-widest opacity-60">Asset Diagnostics</h4>
        <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg transition"><X className="w-3.5 h-3.5" /></button>
      </div>

      <div className="overflow-hidden">
        <h3 className="font-bold text-sm uppercase italic tracking-wide truncate">{file.file_name}</h3>
        <p className="text-[7px] font-mono text-zinc-500 uppercase tracking-wider mt-1 truncate">{file.object_name}</p>
      </div>

      {/* METADATA DIAGNOSTICS TREE */}
      <div className="flex flex-col gap-2.5 font-mono text-[10px] uppercase tracking-wide">
        <div className={`p-3 border rounded-xl flex items-center justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'}`}>
          <span className="opacity-40 flex items-center gap-1.5"><HardDrive className="w-3 h-3" /> Size</span>
          <span className="font-bold">{(file.file_size / (1024 * 1024)).toFixed(2)} MB</span>
        </div>
        <div className={`p-3 border rounded-xl flex items-center justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'}`}>
          <span className="opacity-40 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Committed</span>
          <span className="font-bold">{new Date(file.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* 🏷️ TAGS MANAGEMENT SHARDS */}
      <div className="flex flex-col gap-3 pb-2 border-b border-white/5">
        <h4 className="text-[9px] font-mono font-black uppercase tracking-wider text-zinc-500">Node Tags Allocation</h4>
        <div className="flex flex-wrap gap-1.5">
          {tags.length === 0 ? (
            <span className="text-[8px] font-mono uppercase opacity-30 italic">No Tags Hooked</span>
          ) : (
            tags.map((t, idx) => (
              <span 
                key={idx} 
                className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary font-mono text-[8px] rounded-md uppercase font-bold tracking-wider transition-all"
              >
                {t}
                <button 
                  type="button"
                  onClick={() => onRemoveTag(file.object_name, t)}
                  className="opacity-50 hover:opacity-100 text-primary hover:text-red-400 transition-all font-sans font-bold"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Input Add Tag Form */}
        <form onSubmit={handleTagSubmit} className="flex gap-2">
          <input 
            type="text" 
            placeholder="ADD NEW TAG..." 
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className={`px-3 py-1.5 border rounded-xl font-mono text-[9px] focus:outline-none w-full ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-black/20 border-white/5 text-white'
            }`}
          />
          <button type="submit" className="p-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-xl text-primary transition">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* 📊 INTERACTIVE STREAM: DYNAMIC ACTIVITY TIMELINE PANEL */}
      <div className="flex flex-col gap-3 mt-1">
        <div className="flex items-center justify-between">
          <h4 className="text-[9px] font-mono font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-primary" /> Lifecycle Audit Stream
          </h4>
          <button 
            type="button"
            onClick={loadAssetTimelineLogs} 
            className="p-1 hover:bg-white/5 rounded-lg transition active:scale-95 text-zinc-500"
            title="Refresh footprints channel"
          >
            <RefreshCw className={`w-3 h-3 ${loadingHistory ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Stream Stack Pipeline Wrapper */}
        <div className="flex flex-col gap-3.5 max-h-[220px] overflow-y-auto custom-scrollbar relative pl-1 pr-1">
          {loadingHistory ? (
            <div className="text-[8px] font-mono opacity-40 uppercase tracking-widest text-center py-4 animate-pulse">Syncing logs tree...</div>
          ) : history.length === 0 ? (
            <div className="text-[8px] font-mono opacity-30 uppercase tracking-widest text-center py-4 italic">No cluster activity trace recorded</div>
          ) : (
            history.map((node, index) => {
              const meta = getActionLayoutMeta(node.action);
              return (
                <div key={node.id || index} className="flex gap-2.5 items-start relative group">
                  {/* Vertical Connector Thread line */}
                  {index !== history.length - 1 && (
                    <div className={`absolute left-3 top-6 bottom-0 w-px ${isLight ? 'bg-slate-200' : 'bg-white/5'}`} />
                  )}

                  {/* Indicator Shard dot badge */}
                  <div className={`p-1.5 rounded-lg border shrink-0 z-10 ${meta.color}`}>
                    {meta.icon}
                  </div>

                  {/* Logging context metadata container text */}
                  <div className="flex flex-col overflow-hidden flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 font-mono text-[8px] uppercase tracking-wide">
                      <span className="font-black opacity-80">{node.action}</span>
                      <span className="opacity-40">{new Date(node.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground opacity-90 leading-normal font-mono tracking-tight break-words mt-0.5">
                      {node.details}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}