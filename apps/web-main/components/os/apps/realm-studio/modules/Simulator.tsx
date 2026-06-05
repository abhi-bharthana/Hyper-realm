import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Zap, RefreshCw } from 'lucide-react';

interface SimulatorProps {
  code: string; // 🚀 NAYA: Ab ye actual code accept karega
  onClose: () => void;
  onLog: (msg: string) => void;
}

export const Simulator: React.FC<SimulatorProps> = ({ code, onClose, onLog }) => {
  const [iframeKey, setIframeKey] = useState(0);

  // Manual Refresh Feature
  const handleRefresh = () => {
    onLog('[Sandbox] Force rebooting container...');
    setIframeKey(prev => prev + 1);
  };

  // 🧠 THE GOD-LEVEL IFRAME INJECTION ENGINE
  const srcDoc = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <!-- React & Babel Injected directly inside the sandbox -->
        <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <!-- Tailwind CSS for styling -->
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { margin: 0; background: transparent; overflow: hidden; color: white; font-family: sans-serif; }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 4px; }
        </style>
      </head>
      <body>
        <div id="root" style="height: 100vh; width: 100vw; display: flex; flex-direction: column;"></div>
        
        <script type="text/babel">
          try {
            // 1. Mocking the Hyper OS SDK
            window.defineApp = (config) => config;
            
            // 2. Safely injecting the user's React Code
            const rawCode = ${JSON.stringify(code)};
            
            // 3. Cleaning Code (Removing imports & catching the export)
            let safeCode = rawCode
              .replace(/import .* from .*;/g, '') 
              .replace(/export const [a-zA-Z0-9_]+ = defineApp/g, 'const AppConfig = defineApp');
            
            // 4. Executing the Render Logic
            safeCode += "\\n" + \`
              const api = {
                notification: { show: (title, msg) => alert("🔔 " + title + "\\\\n" + msg) }
              };
              
              if (typeof AppConfig !== 'undefined' && AppConfig.render) {
                 const root = ReactDOM.createRoot(document.getElementById('root'));
                 root.render(AppConfig.render(api));
              } else {
                 document.getElementById('root').innerHTML = '<div class="p-6 text-[#ff5f56] font-mono text-sm">Error: Invalid Hyper App structure.</div>';
              }
            \`;

            // 5. Transpile JSX -> JS and Execute
            const compiled = Babel.transform(safeCode, { presets: ['react', 'env'] }).code;
            eval(compiled);
            
          } catch (err) {
            document.getElementById('root').innerHTML = '<div class="p-6 text-[#ff5f56] font-mono text-sm overflow-auto h-full"><b>Compilation Error:</b><br/>' + err.message + '</div>';
            console.error(err);
          }
        </script>
      </body>
    </html>
  `;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-4 right-4 bottom-4 w-[400px] bg-black/90 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden z-50 pointer-events-auto"
    >
      {/* Simulator Header */}
      <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between shadow-lg z-10">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-widest">
           <Zap size={14} className="text-yellow-400 animate-pulse" /> Live Sandbox
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} className="p-1.5 rounded-full bg-white/5 hover:bg-[#52d9ff]/20 text-gray-400 hover:text-[#52d9ff] transition-colors" title="Reload Sandbox">
            <RefreshCw size={14} />
          </button>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>
      
      {/* 🚀 THE IFRAME BROWSER */}
      <div className="flex-1 bg-gradient-to-br from-[#050508] to-black relative overflow-hidden">
        <iframe 
          key={iframeKey} 
          srcDoc={srcDoc} 
          className="w-full h-full border-none bg-transparent" 
          sandbox="allow-scripts allow-same-origin allow-modals" 
        />
      </div>
    </motion.div>
  );
};