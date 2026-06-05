'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
// 🚀 Fix: Added Rocket, Code2, FolderGit2 to the imports
import { Code2, FolderGit2, Rocket } from 'lucide-react'; 

import { useVFSStore } from '@/store/useVFSStore'; 


// 🧩 IMPORTED MODULES (Keep these exactly as they are)
import { Sidebar } from './modules/Sidebar';
import { CodeEditor } from './modules/CodeEditor';
import { Simulator } from './modules/Simulator';
import { AppWizard } from './modules/AppWizard';
import { ActionBar } from './modules/ActionBar';
import { TabBar } from './modules/TabBar';
import { TerminalConsole } from './modules/TerminalConsole';

export const RealmStudioApp = () => {
  // OS Engine Hooks
  const { nodes, makeDir, writeNode } = useVFSStore(); 

  // 🚀 CLEAN WORKSPACE: Starts at a dynamic root, no forced dummy files!
  const [workspacePath, setWorkspacePath] = useState<string>('/home/projects');
  const [showWizard, setShowWizard] = useState(false);
  const [newAppName, setNewAppName] = useState('');

  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string>('');
  
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [isSimulating, setIsSimulating] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '[Realm OS] Studio Engine Online.', 
    `[VFS] Attached to volume: ${workspacePath}`
  ]);

  // =======================================
  // 🗂️ TAB MANAGER
  // =======================================
  const handleOpenFile = (path: string) => {
    if (!openTabs.includes(path)) setOpenTabs(prev => [...prev, path]);
    setActiveFilePath(path);
  };

  const handleCloseTab = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    setOpenTabs(prev => {
      const newTabs = prev.filter(t => t !== path);
      if (activeFilePath === path) setActiveFilePath(newTabs.length > 0 ? newTabs[newTabs.length - 1] : '');
      return newTabs;
    });
  };

  // =======================================
  // 🚀 HYPER-APP WIZARD
  // =======================================
  const handleCreateHyperApp = () => {
    if (!newAppName.trim()) return;
    
    // Safely format folder name
    const safeName = newAppName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const appId = `com.dev.${safeName}`;
    const newWorkspace = `/home/projects/${safeName}`; // Cleared up path
    const appComponentName = newAppName.replace(/[^a-zA-Z0-9]/g, '');

    const boilerplateCode = `import { defineApp } from '@hyper-realm/sdk';\n\nexport const ${appComponentName} = defineApp({\n  id: '${appId}',\n  name: '${newAppName}',\n  version: '1.0.0',\n  permissions: [],\n\n  setup: (api) => {\n    console.log('[${newAppName}] Booting up securely!');\n  },\n\n  render: (api) => {\n    return (\n      <div className="p-6 h-full text-white flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0a0f] to-[#12121a]">\n        <h1 className="text-3xl font-bold mb-2 text-[#52d9ff]">Hello from ${newAppName}! 🚀</h1>\n      </div>\n    );\n  }\n});`;
    const manifestCode = `{\n  "id": "${appId}",\n  "name": "${newAppName}",\n  "author": "Hyper Dev",\n  "version": "1.0.0",\n  "sdk_version": "v2.5"\n}`;

    // Force creation of parent directory just in case
    if (!nodes['/home/projects']) makeDir('/home/projects', 'user');
    
    // Create new app folder & files
    makeDir(newWorkspace, 'user');
    writeNode(`${newWorkspace}/App.tsx`, boilerplateCode, 'user');
    writeNode(`${newWorkspace}/manifest.json`, manifestCode, 'user');

    // Mount Workspace & Open Tab
    setWorkspacePath(newWorkspace);
    setOpenTabs([`${newWorkspace}/App.tsx`]);
    setActiveFilePath(`${newWorkspace}/App.tsx`);
    setDrafts({});
    setShowWizard(false);
    setNewAppName('');
    addLog(`[System] Scaffolded new app at: ${newWorkspace}`);
  };

  // =======================================
  // 📝 INLINE FILE CREATOR
  // =======================================
  const handleCreateNode = (type: 'file' | 'folder', name: string) => {
    const newPath = `${workspacePath}/${name}`;
    if (nodes[newPath]) { addLog(`[Error] ${name} already exists.`); return; }
    
    if (type === 'file') {
      const initialContent = name.endsWith('.json') ? '{\n}' : '// Start coding here...\n';
      writeNode(newPath, initialContent, 'user');
      handleOpenFile(newPath); 
    } else {
      makeDir(newPath, 'user');
    }
  };

  // =======================================
  // 🛡️ BULLETPROOF VFS SYNC LOGIC
  // =======================================
  // Map files from the VFS ensuring strict path matching to avoid ghost files
  const projectFiles = useMemo(() => {
    return Object.values(nodes).filter(n => 
      n?.type?.toLowerCase() === 'file' && n.path.startsWith(workspacePath)
    ).map(n => ({ path: n.path, name: n.name, originalContent: n.content || '' }));
  }, [nodes, workspacePath]);

  // Safely fallback to "Unknown" if file gets unlinked
  const activeFileNode = projectFiles.find(f => f.path === activeFilePath);
  const activeFileName = activeFileNode ? activeFileNode.name : (activeFilePath ? activeFilePath.split('/').pop() : 'No file selected');
  
  const currentCode = drafts[activeFilePath] !== undefined ? drafts[activeFilePath] : (activeFileNode?.originalContent || '');
  const isUnsaved = drafts[activeFilePath] !== undefined && drafts[activeFilePath] !== activeFileNode?.originalContent;

  const unsavedDraftsMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    projectFiles.forEach(f => { map[f.path] = drafts[f.path] !== undefined && drafts[f.path] !== f.originalContent; });
    return map;
  }, [drafts, projectFiles]);

  const handleSave = () => {
    if (!activeFilePath || !isUnsaved) return;
    
    const codeToSave = drafts[activeFilePath]; // Capture draft before doing anything
    
    // 💾 Push to VFS Engine (THIS SHOULD TRIGGER GO BACKEND IN useVFSStore)
    writeNode(activeFilePath, codeToSave, 'user'); 
    
    addLog(`[VFS Sync] Committing ${activeFileName} to Database...`);
    
    // Clear draft ONLY for the saved file
    setDrafts(prev => { 
      const n = { ...prev }; 
      delete n[activeFilePath]; 
      return n; 
    });
  };

  const handleRun = () => {
    if (isUnsaved) handleSave(); 
    if (!activeFilePath) {
      addLog(`[Error] No file selected to compile.`);
      return;
    }
    addLog(`[Build] Transpiling ${activeFileName}...`); 
    setIsSimulating(true);
  };

  const addLog = (msg: string) => setConsoleLogs(prev => [...prev, msg]);

  return (
    <div className="w-full h-full flex bg-[#0a0a0f]/90 backdrop-blur-3xl overflow-hidden text-white font-sans rounded-[1.2rem] shadow-2xl border border-white/10 relative">
      
      <AppWizard 
        isOpen={showWizard} onClose={() => setShowWizard(false)}
        appName={newAppName} setAppName={setNewAppName} onSubmit={handleCreateHyperApp}
      />

      <Sidebar 
        workspaceName={workspacePath} // Now shows the FULL PATH so you know exactly where you are
        files={projectFiles} activeFile={activeFilePath} 
        setActiveFile={handleOpenFile} unsavedDrafts={unsavedDraftsMap}
        onCreateItem={handleCreateNode} onNewProject={() => setShowWizard(true)}
      />

      <div className="flex-1 flex flex-col relative min-w-0">
        
        <ActionBar 
          workspaceName={workspacePath}
          activeFilePath={activeFilePath} activeFileName={activeFileName}
          isUnsaved={isUnsaved} onSave={handleSave} onRun={handleRun}
        />

        <TabBar 
          openTabs={openTabs} activeFilePath={activeFilePath} 
          unsavedDraftsMap={unsavedDraftsMap} onSelectTab={setActiveFilePath} onCloseTab={handleCloseTab}
        />

        {activeFilePath ? (
          <CodeEditor activeFile={activeFileName || ''} code={currentCode} onChange={(val) => { if (activeFilePath) setDrafts(prev => ({ ...prev, [activeFilePath]: val || '' })) }} onSave={handleSave} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#0d0d12] text-gray-600 select-none">
             <FolderGit2 size={48} className="mb-4 text-gray-800" />
             <p className="font-mono text-sm tracking-wide text-gray-500">Welcome to Realm Studio</p>
             <p className="font-mono text-xs mt-2 text-gray-700">Click the <Rocket size={12} className="inline mx-1 text-[#52d9ff]" /> icon to initialize a new app.</p>
          </div>
        )}

        <TerminalConsole logs={consoleLogs} />

        <AnimatePresence>
          {isSimulating && <Simulator code={currentCode} onClose={() => setIsSimulating(false)} onLog={addLog} />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RealmStudioApp;