"use client";

import { useState } from "react";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
  isLight: boolean;
}

export function CreateFolderModal({ isOpen, onClose, onCreate, isLight }: CreateFolderModalProps) {
  const [name, setName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onCreate(name);
    setName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <form 
        onSubmit={handleSubmit} 
        className={`w-full max-w-sm border p-6 rounded-[2rem] flex flex-col gap-4 shadow-2xl ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-950 border-white/10 text-white'
        }`}
      >
        <h4 className="text-xs font-black uppercase tracking-wider italic">Provision New Namespace</h4>
        <input 
          type="text"
          placeholder="DIRECTORY NAME"
          value={name}
          onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
          className={`w-full p-3 border rounded-xl font-mono text-xs focus:outline-none ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-400' : 'bg-zinc-900 border-white/5 text-white focus:border-white/20'
          }`}
          autoFocus
        />
        <div className="flex gap-2 justify-end text-[10px] font-mono uppercase tracking-widest">
          <button type="button" onClick={onClose} className={`px-4 py-2 ${isLight ? 'text-slate-500 hover:text-slate-800' : 'opacity-50 hover:opacity-100'}`}>Cancel</button>
          <button type="submit" className={`px-4 py-2 font-black rounded-xl ${isLight ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-black'}`}>Commit Node</button>
        </div>
      </form>
    </div>
  );
}