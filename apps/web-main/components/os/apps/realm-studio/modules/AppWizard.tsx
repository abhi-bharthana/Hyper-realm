import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, X, FileCode, Code2 } from 'lucide-react';

interface AppWizardProps {
  isOpen: boolean;
  onClose: () => void;
  appName: string;
  setAppName: (name: string) => void;
  onSubmit: () => void;
}

export const AppWizard: React.FC<AppWizardProps> = ({ isOpen, onClose, appName, setAppName, onSubmit }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 z-[1000] bg-black/60 backdrop-blur-md flex items-center justify-center pointer-events-auto"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            className="w-[450px] bg-[#0d0d12] border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
          >
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#52d9ff]/20 rounded-xl text-[#52d9ff]"><Rocket size={20} /></div>
                <h2 className="font-bold text-lg tracking-wide">Initialize Hyper App</h2>
              </div>
              <button onClick={() => { onClose(); setAppName(''); }} className="p-2 rounded-full hover:bg-white/10 text-gray-400 transition-all"><X size={16} /></button>
            </div>
            
            <div className="p-6 flex flex-col gap-5">
              <div>
                <label className="text-[10px] font-bold text-[#52d9ff] uppercase tracking-widest mb-2 block">1. Application Name</label>
                <input 
                  type="text" autoFocus value={appName} onChange={(e) => setAppName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
                  placeholder="e.g. Deep Work Protocol"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-white focus:outline-none focus:border-[#52d9ff]/50 transition-all"
                />
                <p className="text-[10px] text-gray-500 mt-2 font-mono">Note: Just enter the name. VFS will auto-generate the manifest & boilerplate.</p>
              </div>

              <div className="bg-[#050508] border border-white/5 rounded-xl p-4">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <FileCode size={12} className="text-[#ff79c6]" /> Auto-Generated manifest.json
                </label>
                <div className="font-mono text-[11px] leading-relaxed bg-white/[0.02] p-3 rounded-lg border border-white/5">
                  <span className="text-gray-400">{"{"}</span><br/>
                  &nbsp;&nbsp;<span className="text-[#ff79c6]">"id"</span>: <span className="text-[#f1fa8c]">"{appName ? `com.dev.${appName.toLowerCase().replace(/[^a-z0-9]/g, '_')}` : 'com.dev.app'}"</span>,<br/>
                  &nbsp;&nbsp;<span className="text-[#ff79c6]">"name"</span>: <span className="text-[#f1fa8c]">"{appName || 'App Name'}"</span>,<br/>
                  &nbsp;&nbsp;<span className="text-[#ff79c6]">"version"</span>: <span className="text-[#f1fa8c]">"1.0.0"</span><br/>
                  <span className="text-gray-400">{"}"}</span>
                </div>
              </div>

              <button 
                onClick={onSubmit} disabled={!appName.trim()}
                className="w-full py-3 bg-[#52d9ff] hover:bg-[#52d9ff]/90 text-black font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 shadow-[0_0_20px_rgba(82,217,255,0.3)]"
              >
                <Code2 size={18} /> Scaffold Matrix
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};