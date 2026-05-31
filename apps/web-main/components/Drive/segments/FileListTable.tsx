"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "@/lib/api"; 
import { useThemeStore } from "@/store/useThemeStore";

import { NavigationHeader } from "./NavigationHeader";
import { DirectoryCards } from "./DirectoryCards";
import { CreateFolderModal } from "./CreateFolderModal";
import { MoveFolderModal } from "./MoveFolderModal";
import { DetailsPanel } from "./DetailsPanel";
import { ShareModal } from "./ShareModal";

// 🚀 NAYA IMPORT: Apna naya Universal Preview System import kiya hai
import { UniversalPreview } from "../../Preview/UniversalPreview"; 

import { FileListTableProps } from "./file-table-modules/types";
import { useDriveActions } from "./file-table-modules/useDriveActions";
import { FileExplorerView } from "./file-table-modules/FileExplorerView"; 

// MIME Type Helper in case backend backend miss kar de
const getMimeTypeFromExt = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  const mimeMap: Record<string, string> = {
    // 🖼️ Graphics & Images
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
    ico: 'image/x-icon', bmp: 'image/bmp', tiff: 'image/tiff',
    
    // 🎬 Cinematic & Video Shards
    mp4: 'video/mp4', webm: 'video/webm', ogg: 'video/ogg',
    mov: 'video/quicktime', mkv: 'video/x-matroska', avi: 'video/x-msvideo',
    wmv: 'video/x-ms-wmv', flv: 'video/x-flv', m3u8: 'application/x-mpegURL',
    
    // 🎵 Audio & Acoustics (Lossless & Standard)
    mp3: 'audio/mpeg', wav: 'audio/wav', flac: 'audio/flac',
    m4a: 'audio/mp4', aac: 'audio/aac', oga: 'audio/ogg',

    // 📄 Docs & Workspaces
    pdf: 'application/pdf',
    doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    rtf: 'application/rtf', csv: 'text/csv',

    // 💻 FusionCore & Dev Files 
    txt: 'text/plain', md: 'text/markdown', html: 'text/html', css: 'text/css', 
    js: 'text/javascript', ts: 'application/typescript', tsx: 'text/tsx',
    json: 'application/json', xml: 'application/xml', yaml: 'text/yaml', yml: 'text/yaml',
    py: 'text/x-python', go: 'text/x-go', c: 'text/x-c', cpp: 'text/x-c++', 
    java: 'text/x-java-source', rs: 'text/rust', sh: 'application/x-sh',

    // 📦 Archives & Clusters
    zip: 'application/zip', rar: 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed', tar: 'application/x-tar', gz: 'application/gzip',

    // 🧊 3D Models (For Neural Canvas later)
    obj: 'model/obj', gltf: 'model/gltf+json', glb: 'model/gltf-binary'
  };

  // Agar extension map mein mil gaya toh wo do, warna default octet-stream (unknown binary)
  return mimeMap[ext] || 'application/octet-stream';
};

export function FileListTable({ isLight, searchQuery }: FileListTableProps) {
  const { theme } = useThemeStore();
  const [files, setFiles] = useState<any[]>([]);
  const [directories, setDirectories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState<string>(""); 
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 🚀 NAYA STATE: Unified preview file state
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string; mimeType: string } | null>(null);

  const USER_ID = "abhishek-babu-node"; // (Mocked for now)
  const API_BASE = "/api/v1/storage"; 
  const MINIO_GATEWAY = "http://localhost:7480/hyper-users-data";

  const loadClusterTopology = useCallback(async () => {
    try {
      const data = await api.get(`${API_BASE}/files?user_id=${USER_ID}&folder=${encodeURIComponent(currentFolder)}`);
      
      setFiles(data.files || []);
      setDirectories(data.directories || []);
      if (data.stats) {
        window.dispatchEvent(new CustomEvent("sync-storage-metrics", { detail: data.stats }));
      }
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  }, [currentFolder]);

  const actions = useDriveActions(USER_ID, API_BASE, currentFolder, loadClusterTopology);
  const filteredFiles = useMemo(() => files.filter(f => f.file_name.toLowerCase().includes(searchQuery.toLowerCase())), [files, searchQuery]);

  const handleCreateFolder = useCallback(async (folderName: string) => {
    try {
      await api.post(`${API_BASE}/folder/create`, { user_id: USER_ID, folder_name: folderName, parent_path: currentFolder });
      loadClusterTopology();
    } catch (err) { console.error(err); }
  }, [currentFolder, loadClusterTopology]);

  const handleDirRename = useCallback(async (dirName: string) => {
    const newName = prompt("Enter new folder node title:", dirName);
    if (!newName || newName.trim() === "" || newName === dirName) return;
    try {
      await api.post(`${API_BASE}/folder/manage`, { user_id: USER_ID, current_path: currentFolder ? `${currentFolder}/${dirName}` : dirName, new_path_name: currentFolder ? `${currentFolder}/${newName.trim()}` : newName.trim() });
      loadClusterTopology();
    } catch (err) { console.error(err); }
  }, [currentFolder, loadClusterTopology]);

  const handleDirDelete = useCallback(async (dirName: string) => {
    if (!confirm(`WARNING: Purge folder [${dirName}]?`)) return;
    try {
      await api.delete(`${API_BASE}/folder/purge?user_id=${USER_ID}&folder_path=${encodeURIComponent(currentFolder ? `${currentFolder}/${dirName}` : dirName)}`);
      loadClusterTopology();
    } catch (err) { console.error(err); }
  }, [currentFolder, loadClusterTopology]);

  const handleDeleteNode = useCallback(async (objectKey: string) => {
    if (!confirm("Purge shard?")) return;
    setFiles(prev => prev.filter(f => f.object_name !== objectKey));
    if (actions.selectedDetailFile?.object_name === objectKey) actions.setSelectedDetailFile(null);
    try {
      await api.delete(`${API_BASE}/asset/remove?user_id=${USER_ID}&object_key=${encodeURIComponent(objectKey)}`);
      loadClusterTopology();
    } catch (err) { console.error(err); loadClusterTopology(); }
  }, [actions, loadClusterTopology]);

  // 🚀 NAYA: Cleaned-up Preview Trigger Logic
  const handleOpenPreview = useCallback((file: any) => {
    const fileUrl = `${MINIO_GATEWAY}/${file.object_name}`;
    const mimeType = file.content_type || getMimeTypeFromExt(file.file_name);

    setPreviewFile({
      url: fileUrl,
      name: file.file_name,
      mimeType: mimeType
    });
  }, []);

  useEffect(() => { loadClusterTopology(); }, [currentFolder, loadClusterTopology]);

  if (loading) return <div className="text-[10px] font-mono p-12 text-center opacity-40 animate-pulse tracking-widest text-white">SYNCHRONIZING TOPOLOGY...</div>;

  return (
    <div className="w-full flex-1 flex flex-col lg:flex-row gap-6 justify-start items-start layer-performance">
      <div className="flex-1 w-full flex flex-col justify-start">
        <NavigationHeader currentFolder={currentFolder} onNavigateBack={() => { const parts = currentFolder.split("/"); parts.pop(); setCurrentFolder(parts.join("/")); }} onCreateFolderClick={() => setShowCreateModal(true)} primaryColor={theme?.primary} isLight={isLight} />
        <DirectoryCards directories={directories} onNavigate={(name) => setCurrentFolder(currentFolder ? `${currentFolder}/${name}` : name)} onDirRename={handleDirRename} onDirDelete={handleDirDelete} onDirMove={(name) => { actions.setActiveDirTarget(name); actions.setIsFolderMoveMode(true); actions.setIsFileCopyMode(false); actions.setShowMoveModal(true); }} primaryColor={theme?.primary} isLight={isLight} />

        <FileExplorerView 
          filteredFiles={filteredFiles} handleOpenPreview={handleOpenPreview} handleDeleteNode={handleDeleteNode}
          setActiveMoveFile={actions.setActiveMoveFile} setIsFolderMoveMode={actions.setIsFolderMoveMode}
          setIsFileCopyMode={actions.setIsFileCopyMode} setShowMoveModal={actions.setShowMoveModal}
          handleCopyAssetNode={actions.handleCopyAssetNode} handleRenameAssetNode={actions.handleRenameAssetNode}
          setSelectedDetailFile={actions.setSelectedDetailFile} setActiveShareFile={actions.setActiveShareFile}
          setShowShareModal={actions.setShowShareModal} MINIO_GATEWAY={MINIO_GATEWAY} themePrimary={theme?.primary} isLight={isLight}
        />
      </div>

      {actions.selectedDetailFile && (
        <DetailsPanel 
          file={actions.selectedDetailFile} 
          onClose={() => actions.setSelectedDetailFile(null)} 
          isLight={isLight} 
          onAddTag={actions.handleAddNodeTag} 
          onRemoveTag={actions.handleRemoveNodeTag}
          tags={actions.activeNodeTags} 
        />
      )}

      {/* Basic Modals */}
      <CreateFolderModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreateFolder} isLight={isLight} />
      <MoveFolderModal isOpen={actions.showMoveModal} onClose={() => { actions.setShowMoveModal(false); actions.setActiveMoveFile(null); actions.setActiveDirTarget(null); actions.setIsFolderMoveMode(false); actions.setIsFileCopyMode(false); }} directories={directories} currentFolder={currentFolder} onConfirmMove={actions.handleUniversalRelocationCommit} isLight={isLight} />
      <ShareModal isOpen={actions.showShareModal} onClose={() => { actions.setShowShareModal(false); actions.setActiveShareFile(null); }} file={actions.activeShareFile} apiBase={API_BASE} isLight={isLight} />
      
      {/* 🚀 NAYA: Apna Brand-new Universal Preview Inject Kar Diya Yahan */}
      <UniversalPreview 
        isOpen={!!previewFile}
        file={previewFile || { url: '', name: '', mimeType: '' }}
        onClose={() => setPreviewFile(null)}
      />
      
    </div>
  );
}