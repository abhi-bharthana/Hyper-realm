"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useThemeStore } from "@/store/useThemeStore";

import { NavigationHeader } from "./NavigationHeader";
import { DirectoryCards } from "./DirectoryCards";
import { CreateFolderModal } from "./CreateFolderModal";
import { PreviewModal } from "./PreviewModal";
import { MoveFolderModal } from "./MoveFolderModal";
import { DetailsPanel } from "./DetailsPanel";
import { ShareModal } from "./ShareModal";

// 🎯 FIXED PATHS & CASING: Mapping modules directly to file-table-modules with strict uppercase configurations
import { FileListTableProps } from "./file-table-modules/types";
import { useDriveActions } from "./file-table-modules/useDriveActions";
import { FileExplorerView } from "./file-table-modules/FileExplorerView"; // Strict Capital 'F'

export function FileListTable({ isLight, searchQuery }: FileListTableProps) {
  const { theme } = useThemeStore();
  const [files, setFiles] = useState<any[]>([]);
  const [directories, setDirectories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState<string>(""); 
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [previewFile, setPreviewFile] = useState<any>(null);
  const [codeContent, setCodeContent] = useState<string>("");
  const [loadingCode, setLoadingCode] = useState(false);

  const USER_ID = "abhishek-babu-node";
  const API_BASE = "http://localhost:8001/api/v1/storage";
  const MINIO_GATEWAY = "http://localhost:7480/hyper-users-data";

  const loadClusterTopology = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/files?user_id=${USER_ID}&folder=${encodeURIComponent(currentFolder)}`);
      setFiles(res.data.files || []);
      setDirectories(res.data.directories || []);
      if (res.data.stats) {
        window.dispatchEvent(new CustomEvent("sync-storage-metrics", { detail: res.data.stats }));
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [currentFolder]);

  // Hooking the separated action triggers controller
  const actions = useDriveActions(USER_ID, API_BASE, currentFolder, loadClusterTopology);
  const filteredFiles = useMemo(() => files.filter(f => f.file_name.toLowerCase().includes(searchQuery.toLowerCase())), [files, searchQuery]);

  const handleCreateFolder = useCallback(async (folderName: string) => {
    try {
      await axios.post(`${API_BASE}/folder/create`, { user_id: USER_ID, folder_name: folderName, parent_path: currentFolder });
      loadClusterTopology();
    } catch (err) { console.error(err); }
  }, [currentFolder, loadClusterTopology]);

  const handleDirRename = useCallback(async (dirName: string) => {
    const newName = prompt("Enter new folder node title:", dirName);
    if (!newName || newName.trim() === "" || newName === dirName) return;
    try {
      await axios.post(`${API_BASE}/folder/manage`, { user_id: USER_ID, current_path: currentFolder ? `${currentFolder}/${dirName}` : dirName, new_path_name: currentFolder ? `${currentFolder}/${newName.trim()}` : newName.trim() });
      loadClusterTopology();
    } catch (err) { console.error(err); }
  }, [currentFolder, loadClusterTopology]);

  const handleDirDelete = useCallback(async (dirName: string) => {
    if (!confirm(`WARNING: Purge folder [${dirName}]?`)) return;
    try {
      await axios.delete(`${API_BASE}/folder/purge?user_id=${USER_ID}&folder_path=${encodeURIComponent(currentFolder ? `${currentFolder}/${dirName}` : dirName)}`);
      loadClusterTopology();
    } catch (err) { console.error(err); }
  }, [currentFolder, loadClusterTopology]);

  const handleDeleteNode = useCallback(async (objectKey: string) => {
    if (!confirm("Purge shard?")) return;
    setFiles(prev => prev.filter(f => f.object_name !== objectKey));
    if (actions.selectedDetailFile?.object_name === objectKey) actions.setSelectedDetailFile(null);
    try {
      await axios.delete(`${API_BASE}/asset/remove?user_id=${USER_ID}&object_key=${encodeURIComponent(objectKey)}`);
      loadClusterTopology();
    } catch (err) { console.error(err); loadClusterTopology(); }
  }, [actions, loadClusterTopology]);

  const handleOpenPreview = useCallback(async (file: any) => {
    setPreviewFile(file);
    const ext = file.file_name.split('.').pop()?.toLowerCase() || "";
    if (["json", "js", "ts", "tsx", "go", "py", "yaml", "md", "txt"].includes(ext)) {
      try {
        setLoadingCode(true);
        const res = await axios.get(`${MINIO_GATEWAY}/${file.object_name}`);
        setCodeContent(typeof res.data === 'object' ? JSON.stringify(res.data, null, 2) : res.data.toString());
      } catch (err) { setCodeContent("Failed to stream content."); } finally { setLoadingCode(false); }
    }
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

      {/* 🎯 FIXED: Fully wired to active remote tagging stream parameters */}
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

      <CreateFolderModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreateFolder} isLight={isLight} />
      <PreviewModal file={previewFile} codeContent={codeContent} loadingCode={loadingCode} onClose={() => { setPreviewFile(null); setCodeContent(""); }} gateway={MINIO_GATEWAY} primaryColor={theme?.primary} />
      <MoveFolderModal isOpen={actions.showMoveModal} onClose={() => { actions.setShowMoveModal(false); actions.setActiveMoveFile(null); actions.setActiveDirTarget(null); actions.setIsFolderMoveMode(false); actions.setIsFileCopyMode(false); }} directories={directories} currentFolder={currentFolder} onConfirmMove={actions.handleUniversalRelocationCommit} isLight={isLight} />
      <ShareModal isOpen={actions.showShareModal} onClose={() => { actions.setShowShareModal(false); actions.setActiveShareFile(null); }} file={actions.activeShareFile} apiBase={API_BASE} isLight={isLight} />
    </div>
  );
}