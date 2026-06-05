"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "@/lib/api"; 
import { useThemeStore } from "@/store/useThemeStore";
import { useVFSStore } from "@/store/useVFSStore"; 
import { useNotificationStore } from "@/store/useNotificationStore"; 

import { NavigationHeader } from "./NavigationHeader";
import { DirectoryCards } from "./DirectoryCards";
import { CreateFolderModal } from "./CreateFolderModal";
import { MoveFolderModal } from "./MoveFolderModal";
import { DetailsPanel } from "./DetailsPanel";
import { ShareModal } from "./ShareModal";
import { UniversalPreview } from "../../Preview/UniversalPreview"; 

import { FileListTableProps } from "./file-table-modules/types";
import { useDriveActions } from "./file-table-modules/useDriveActions";
import { FileExplorerView } from "./file-table-modules/FileExplorerView"; 

// 🚀 RESTORED: THE MISSING MIME TYPE HELPER!
const getMimeTypeFromExt = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
    ico: 'image/x-icon', bmp: 'image/bmp', tiff: 'image/tiff',
    mp4: 'video/mp4', webm: 'video/webm', ogg: 'video/ogg',
    mov: 'video/quicktime', mkv: 'video/x-matroska', avi: 'video/x-msvideo',
    mp3: 'audio/mpeg', wav: 'audio/wav', flac: 'audio/flac',
    pdf: 'application/pdf', doc: 'application/msword', 
    txt: 'text/plain', md: 'text/markdown', html: 'text/html', css: 'text/css',
    js: 'text/javascript', ts: 'application/typescript', json: 'application/json',
    py: 'text/x-python', go: 'text/x-go', c: 'text/x-c', cpp: 'text/x-c++'
  };
  return mimeMap[ext] || 'application/octet-stream';
};

export function FileListTable({ isLight, searchQuery }: FileListTableProps) {
  const { theme } = useThemeStore();
  const { notify } = useNotificationStore();
  const { nodes, makeDir, deleteNode } = useVFSStore();
  
  const [currentFolder, setCurrentFolder] = useState<string>(""); 
  const [apiFiles, setApiFiles] = useState<any[]>([]);
  const [apiDirectories, setApiDirectories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string; mimeType: string; object_name?: string } | null>(null);

  const USER_ID = "abhishek-babu-node"; 
  const API_BASE = "/api/v1/storage"; 
  const MINIO_GATEWAY = "http://localhost:7480/hyper-users-data";

  // 1️⃣ REAL BACKEND DATA FETCH
  const loadClusterTopology = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get(`${API_BASE}/files?user_id=${USER_ID}&folder=${encodeURIComponent(currentFolder)}`);
      setApiFiles(data.files || []);
      setApiDirectories(data.directories || []);
      if (data.stats) {
        window.dispatchEvent(new CustomEvent("sync-storage-metrics", { detail: data.stats }));
      }
    } catch (err) { 
      console.warn("Backend Sync Warning: Displaying local VFS mode only.", err);
      setApiFiles([]);
      setApiDirectories([]);
    } finally { 
      setLoading(false); 
    }
  }, [currentFolder]);

  const actions = useDriveActions(USER_ID, API_BASE, currentFolder, loadClusterTopology);

  // 2️⃣ HYBRID MERGE (Real Backend + Local VFS Sandbox)
  const combinedData = useMemo(() => {
    const vfsTarget = currentFolder ? `/home/user/${currentFolder}` : `/home/user`;
    const prefix = vfsTarget === '/' ? '/' : `${vfsTarget}/`;
    
    let vfsChildren = Object.values(nodes).filter(node => {
      if (node.path === vfsTarget) return false;
      if (!node.path.startsWith(prefix)) return false; 
      const relativePath = node.path.slice(prefix.length);
      return !relativePath.includes('/'); 
    });

    if (currentFolder === "" && !vfsChildren.some(c => c.name === 'vault')) {
      vfsChildren.push({
        path: '/home/user/vault', name: 'vault', type: 'folder', owner: 'system', size: 0, createdAt: Date.now(), updatedAt: Date.now(), isReadOnly: true 
      });
    }

    const mappedVfsDirs = vfsChildren.filter(c => c.type === 'folder').map(f => ({
       name: f.name, path: f.path, isReadOnly: f.isReadOnly, isVfs: true
    }));

    const mappedVfsFiles = vfsChildren.filter(c => c.type === 'file').map(f => ({
       id: f.path, file_name: f.name, object_name: f.path, file_size: f.size, created_at: new Date(f.createdAt).toISOString(), isVfs: true
    }));

    let finalDirs = [...apiDirectories, ...mappedVfsDirs];
    let finalFiles = [...apiFiles, ...mappedVfsFiles];

    if (searchQuery) {
      finalDirs = finalDirs.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
      finalFiles = finalFiles.filter(f => f.file_name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return { directories: finalDirs, files: finalFiles };
  }, [nodes, currentFolder, searchQuery, apiDirectories, apiFiles]);

  // 3️⃣ SMART ACTION HANDLERS
  const handleCreateFolder = useCallback(async (folderName: string) => {
    try {
      await api.post(`${API_BASE}/folder/create`, { user_id: USER_ID, folder_name: folderName, parent_path: currentFolder });
      loadClusterTopology();
    } catch (err) { console.error(err); }
  }, [currentFolder, loadClusterTopology]);

  const handleDirDelete = useCallback(async (dirName: string) => {
    if (dirName === 'vault') {
       notify({ title: "Access Denied", message: "Vault cannot be deleted.", appName: "Security" });
       return;
    }
    if (!confirm(`WARNING: Purge folder [${dirName}]?`)) return;
    try {
      await api.delete(`${API_BASE}/folder/purge?user_id=${USER_ID}&folder_path=${encodeURIComponent(currentFolder ? `${currentFolder}/${dirName}` : dirName)}`);
      const vfsPath = currentFolder ? `/home/user/${currentFolder}/${dirName}` : `/home/user/${dirName}`;
      deleteNode(vfsPath, 'system');
      loadClusterTopology();
    } catch (err) { console.error(err); }
  }, [currentFolder, loadClusterTopology, deleteNode, notify]);

  const handleDeleteNode = useCallback(async (objectKey: string) => {
    if (!confirm("Purge shard?")) return;
    try {
      if (objectKey.startsWith('/home/user/')) {
        deleteNode(objectKey, 'system'); 
      } else {
        await api.delete(`${API_BASE}/asset/remove?user_id=${USER_ID}&object_key=${encodeURIComponent(objectKey)}`); 
      }
      
      if (actions.selectedDetailFile?.object_name === objectKey) actions.setSelectedDetailFile(null);
      loadClusterTopology();
    } catch (err) { console.error(err); loadClusterTopology(); }
  }, [actions, loadClusterTopology, deleteNode]);

  // 🚀 FIXED PREVIEW HANDLER
  const handleOpenPreview = useCallback((file: any) => {
    if (file.object_name?.startsWith('/home/user/')) {
       notify({ title: file.file_name, message: "Sandbox VFS preview restricted.", appName: "Hyper Drive" });
       return;
    }
    const fileUrl = `${MINIO_GATEWAY}/${file.object_name}`;
    
    // YAHAN MAGIC WAPAS LAGA DIYA
    const mimeType = file.content_type || getMimeTypeFromExt(file.file_name);
    
    setPreviewFile({ url: fileUrl, name: file.file_name, mimeType: mimeType, object_name: file.object_name });
  }, [notify]);

  useEffect(() => { loadClusterTopology(); }, [currentFolder, loadClusterTopology]);

  if (loading) return <div className="text-[10px] font-mono p-12 text-center opacity-40 animate-pulse tracking-widest text-[#52d9ff]">SYNCHRONIZING TOPOLOGY...</div>;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .hyper-list-scrollbar::-webkit-scrollbar { width: 6px; }
        .hyper-list-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .hyper-list-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .hyper-list-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); }
      `}} />

      <div className="w-full h-full flex flex-col lg:flex-row gap-6 justify-start items-start layer-performance overflow-hidden">
        
        <div className="flex-1 w-full flex flex-col h-full overflow-hidden">
          
          <div className="shrink-0">
            <NavigationHeader 
              currentFolder={currentFolder} 
              onNavigateBack={() => { 
                if (!currentFolder) return;
                const parts = currentFolder.split("/"); 
                parts.pop(); 
                setCurrentFolder(parts.join("/")); 
              }} 
              onCreateFolderClick={() => setShowCreateModal(true)} 
              primaryColor={theme?.primary} 
              isLight={isLight} 
            />
          </div>

          <div className="shrink-0 mt-4 mb-2">
            <DirectoryCards 
              directories={combinedData.directories} 
              onNavigate={(name) => {
                 if (name === 'vault' && !nodes['/home/user/vault']) makeDir('/home/user/vault', 'system');
                 setCurrentFolder(currentFolder ? `${currentFolder}/${name}` : name);
              }} 
              onDirRename={(name) => notify({ title: 'System', message: 'Rename disabled for mixed nodes.'})} 
              onDirDelete={handleDirDelete} 
              onDirMove={(name) => notify({ title: 'System', message: 'Move disabled for mixed nodes.'})} 
              primaryColor={theme?.primary} 
              isLight={isLight} 
            />
          </div>

          <div className="flex-1 w-full overflow-y-auto hyper-list-scrollbar pb-24 pr-2">
            <FileExplorerView 
              filteredFiles={combinedData.files} 
              handleOpenPreview={handleOpenPreview} 
              handleDeleteNode={handleDeleteNode}
              setActiveMoveFile={actions.setActiveMoveFile} 
              setIsFolderMoveMode={actions.setIsFolderMoveMode}
              setIsFileCopyMode={actions.setIsFileCopyMode} 
              setShowMoveModal={actions.setShowMoveModal}
              handleCopyAssetNode={actions.handleCopyAssetNode} 
              handleRenameAssetNode={actions.handleRenameAssetNode}
              setSelectedDetailFile={actions.setSelectedDetailFile} 
              setActiveShareFile={actions.setActiveShareFile}
              setShowShareModal={actions.setShowShareModal} 
              MINIO_GATEWAY={MINIO_GATEWAY} 
              themePrimary={theme?.primary} 
              isLight={isLight}
            />
          </div>

        </div>

        {actions.selectedDetailFile && (
          <div className="shrink-0 w-full lg:w-80 h-full overflow-y-auto hyper-list-scrollbar">
            <DetailsPanel 
              file={actions.selectedDetailFile} 
              onClose={() => actions.setSelectedDetailFile(null)} 
              isLight={isLight} 
              onAddTag={actions.handleAddNodeTag} 
              onRemoveTag={actions.handleRemoveNodeTag}
              tags={actions.activeNodeTags} 
            />
          </div>
        )}

        <CreateFolderModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreateFolder} isLight={isLight} />
        <MoveFolderModal isOpen={actions.showMoveModal} onClose={() => { actions.setShowMoveModal(false); actions.setActiveMoveFile(null); actions.setActiveDirTarget(null); actions.setIsFolderMoveMode(false); actions.setIsFileCopyMode(false); }} directories={combinedData.directories} currentFolder={currentFolder} onConfirmMove={actions.handleUniversalRelocationCommit} isLight={isLight} />
        <ShareModal isOpen={actions.showShareModal} onClose={() => { actions.setShowShareModal(false); actions.setActiveShareFile(null); }} file={actions.activeShareFile} apiBase={API_BASE} isLight={isLight} />
        
        <UniversalPreview 
          isOpen={!!previewFile}
          file={previewFile || { url: '', name: '', mimeType: '' }}
          onClose={() => setPreviewFile(null)}
        />
        
      </div>
    </>
  );
}