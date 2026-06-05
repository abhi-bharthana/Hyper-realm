'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Code2, HardDrive, Bell, LayoutTemplate, Cpu, ChevronRight, Terminal, Rocket, FolderTree } from 'lucide-react';

// 📚 THE DEFINITIVE DOCUMENTATION MATRIX
const DOCS_DATA = {
  getting_started: {
    title: 'Core Architecture',
    icon: <Cpu size={18} />,
    sections: [
      {
        subtitle: 'Welcome to Hyper-Realm OS',
        content: 'Hyper-Realm is a next-generation web-based OS. It uses a strict sandbox architecture where every application runs in an isolated context. To build an app, developers use the Hyper SDK which bridges the gap between the React frontend and the Golang/MinIO VFS backend.',
      },
      {
        subtitle: 'The defineApp() Scaffold',
        content: 'Every application must export a configuration object wrapped in `defineApp()`. This object tells the OS how to mount, render, and manage the lifecycle of your app.',
        code: `import { defineApp } from '@hyper-realm/sdk';

export const MyFirstApp = defineApp({
  id: 'com.dev.myapp',       // Unique reverse-DNS identifier
  name: 'My App',            // Display name in OS UI
  version: '1.0.0',          
  permissions: ['vfs_write'], // Required for OS security prompt
  
  setup: (api) => {
    // Runs in the background when OS boots the app into RAM
    console.log('App initialized and ready.');
  },
  
  render: (api) => {
    // Returns the React UI to be injected into the Window Manager
    return <div className="p-4 text-white">Hello World!</div>;
  }
});`
      }
    ]
  },
  vfs_api: {
    title: 'Hyper Drive (VFS API)',
    icon: <HardDrive size={18} />,
    sections: [
      {
        subtitle: 'Virtual File System Overview',
        content: 'The VFS (Virtual File System) is the backbone of Hyper-Realm. It maps local OS state to the remote database. You can interact with it using the `api.vfs` object inside your app\'s render or setup methods.',
      },
      {
        subtitle: '1. Writing Files (writeNode)',
        content: 'Creates or updates a file. If the directories in the path do not exist, they must be created first using makeDir.',
        code: `// Signature: api.vfs.writeNode(path: string, content: string, owner?: string)

const handleSave = () => {
  try {
    api.vfs.writeNode(
      '/home/projects/data.json', 
      JSON.stringify({ score: 100 }), 
      'user'
    );
    api.notification.show('Saved', 'File written to Hyper Drive');
  } catch (err) {
    console.error('VFS Write Error:', err);
  }
};`
      },
      {
        subtitle: '2. Reading Files (readNode)',
        content: 'Fetches the content of a file from the VFS. Returns the file node object containing metadata and content.',
        code: `// Signature: api.vfs.readNode(path: string) -> VFSNode | null

const loadData = () => {
  const fileNode = api.vfs.readNode('/home/projects/data.json');
  
  if (fileNode && fileNode.type === 'file') {
    const data = JSON.parse(fileNode.content);
    console.log('Loaded Score:', data.score);
  } else {
    console.log('File not found or is a directory.');
  }
};`
      },
      {
        subtitle: '3. Creating Directories (makeDir)',
        content: 'Creates a new folder in the VFS structure. Essential before writing files to deep paths.',
        code: `// Signature: api.vfs.makeDir(path: string, owner?: string)

const initializeWorkspace = () => {
  // Creates a nested folder structure
  api.vfs.makeDir('/home/projects/assets', 'user');
  console.log('Folder created successfully!');
};`
      }
    ]
  },
  notifications: {
    title: 'Notification Engine',
    icon: <Bell size={18} />,
    sections: [
      {
        subtitle: 'Triggering OS Alerts',
        content: 'Interact with the global OS notification daemon. Ensure your app manifest includes the `notifications` permission, otherwise the OS firewall will block the request.',
        code: `// Signature: api.notification.show(title: string, message: string)

const triggerAlert = () => {
  api.notification.show(
    'Download Complete', 
    'fusion_core_v2.zip has been securely saved to VFS.'
  );
};`
      }
    ]
  },
  ui_guidelines: {
    title: 'UI & Aesthetics',
    icon: <LayoutTemplate size={18} />,
    sections: [
      {
        subtitle: 'The Glassmorphism Standard',
        content: 'Hyper-Realm OS mandates a dark-mode glassmorphic design language for all native apps. Avoid solid bright backgrounds. Use Tailwind CSS with high backdrop-blur and low-opacity white/black fills.',
        code: `// Official Tailwind Glass Card Boilerplate
<div className="bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
  <h1 className="text-[#52d9ff] font-bold text-2xl drop-shadow-md">
    Premium Glass
  </h1>
  <p className="text-gray-400 mt-2 text-sm">
    This conforms to OS aesthetic guidelines.
  </p>
</div>`
      }
    ]
  }
};

type DocKey = keyof typeof DOCS_DATA;

export const DevDocsApp = () => {
  const [activeTab, setActiveTab] = useState<DocKey>('getting_started');
  const activeContent = DOCS_DATA[activeTab];

  return (
    <div className="w-full h-full flex bg-[#050508]/95 backdrop-blur-3xl overflow-hidden text-white font-sans rounded-[1.2rem] shadow-2xl border border-white/10">
      
      {/* 📚 LEFT SIDEBAR NAVIGATION */}
      <div className="w-64 bg-black/40 border-r border-white/5 flex flex-col shrink-0">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="p-2.5 bg-[#52d9ff]/20 rounded-xl text-[#52d9ff] shadow-[0_0_15px_rgba(82,217,255,0.2)]">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="font-black tracking-widest uppercase text-sm">Hyper Docs</h2>
            <p className="text-[10px] text-gray-500 font-mono tracking-wider">SDK v2.5 Reference</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-3 mt-2">
             Documentation
          </div>
          {(Object.keys(DOCS_DATA) as DocKey[]).map((key) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-[#8d6bff]/20 text-[#8d6bff] border border-[#8d6bff]/30 shadow-inner' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  {DOCS_DATA[key].icon || <Code2 size={16} />}
                  <span>{DOCS_DATA[key].title}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-[#8d6bff]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 📖 MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[#0a0a0f]/50">
        
        {/* Header */}
        <div className="h-20 border-b border-white/5 flex items-center px-10 shrink-0 bg-gradient-to-r from-transparent to-black/20">
          <h1 className="text-2xl font-bold flex items-center gap-3 drop-shadow-md">
            {activeContent.icon} {activeContent.title}
          </h1>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth p-10 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl mx-auto space-y-12 pb-20"
            >
              {activeContent.sections.map((section, idx) => (
                <div key={idx} className="space-y-4">
                  <h3 className="text-lg font-bold text-[#52d9ff] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#52d9ff] shadow-[0_0_8px_#52d9ff]"></span>
                    {section.subtitle}
                  </h3>
                  
                  <p className="text-gray-400 text-sm leading-relaxed tracking-wide">
                    {section.content}
                  </p>

                  {/* 💻 CODE BLOCK RENDERER */}
                  {section.code && (
                    <div className="mt-4 rounded-2xl overflow-hidden border border-white/10 bg-[#050508] shadow-2xl relative group">
                      <div className="h-9 bg-white/5 border-b border-white/10 flex items-center px-4 justify-between select-none">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                        </div>
                        <div className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                          <Terminal size={10} /> snippet
                        </div>
                      </div>
                      
                      <div className="p-5 overflow-x-auto custom-scrollbar">
                        <pre className="font-mono text-[13px] leading-relaxed text-gray-300">
                          <code>
                            {section.code.split('\n').map((line, i) => (
                              <div key={i} className="flex gap-4 hover:bg-white/[0.02] transition-colors rounded-sm px-1 -mx-1">
                                <span className="text-gray-600 select-none w-4 text-right shrink-0">{i + 1}</span>
                                <span dangerouslySetInnerHTML={{ 
                                  __html: line
                                    // Highlight keywords
                                    .replace(/\b(const|let|var|export|import|from|return|async|await|try|catch|if|else)\b/g, '<span class="text-[#ff79c6] font-bold">$&</span>')
                                    // Highlight object properties & functions
                                    .replace(/\b(defineApp|show|writeNode|readNode|makeDir|console|log|error|JSON|stringify|parse)\b/g, '<span class="text-[#50fa7b]">$&</span>')
                                    // Highlight strings
                                    .replace(/'.*?'/g, '<span class="text-[#f1fa8c]">$&</span>')
                                    .replace(/".*?"/g, '<span class="text-[#f1fa8c]">$&</span>')
                                    // Highlight Comments (Overrides previous matches)
                                    .replace(/\/\/.*$/g, (match) => `<span class="text-[#6272a4] italic">${match.replace(/<[^>]*>?/gm, '')}</span>`)
                                }}></span>
                              </div>
                            ))}
                          </code>
                        </pre>
                      </div>
                      
                      {/* Copy Button */}
                      <button 
                        onClick={() => navigator.clipboard.writeText(section.code || '')}
                        className="absolute top-12 right-4 p-2 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20 text-xs font-bold text-gray-300 backdrop-blur-md border border-white/10"
                      >
                        Copy
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default DevDocsApp;