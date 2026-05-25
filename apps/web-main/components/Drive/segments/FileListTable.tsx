"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useThemeStore } from "@/store/useThemeStore";

import { NavigationHeader } from "./NavigationHeader";
import { DirectoryCards } from "./DirectoryCards";
import { FileRow } from "./FileRow";
import { CreateFolderModal } from "./CreateFolderModal";
import { PreviewModal } from "./PreviewModal";
import { MoveFolderModal } from "./MoveFolderModal";
import { DetailsPanel } from "./DetailsPanel";

interface FileListTableProps {
  isLight: boolean;
  viewMode?: 'grid' | 'list';
  searchQuery: string;
}

export function FileListTable({ isLight, searchQuery }: FileListTableProps) {
  const { theme } = useThemeStore();
  const [files, setFiles] = useState<any[]>([]);
  const [directories, setDirectories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState<string>(""); 
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 🎯 OPERATIONAL TRACKERS & STATE MACHINE
  const [activeMoveFile, setActiveMoveFile] = useState<any>(null);
  const [activeDirTarget, setActiveDirTarget] = useState<string | null>(null);
  const [isFolderMoveMode, setIsFolderMoveMode] = useState(false);
  const [isFileCopyMode, setIsFileCopyMode] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);

  // DIAGNOSTICS & TAGS STATES
  const [selectedDetailFile, setSelectedDetailFile] = useState<any>(null);
  const [fileTags, setFileTags] = useState<Record<string, string[]>>({});

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
    } catch (err) {
      console.error("Topology synchronization exception:", err);
    } finally {
      setLoading(false);
    }
  }, [currentFolder]);

  // REAL-TIME SEARCH OPTIMIZATION FILTER
  const filteredFiles = useMemo(() => {
    return files.filter(f => f.file_name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [files, searchQuery]);

  // 📁 CREATE FOLDER REFERENCE
  const handleCreateFolder = useCallback(async (folderName: string) => {
    try {
      await axios.post(`${API_BASE}/folder/create`, { user_id: USER_ID, folder_name: folderName, parent_path: currentFolder });
      loadClusterTopology();
    } catch (err) {
      console.error(err);
    }
  }, [currentFolder, loadClusterTopology]);

  // 📁 DIRECTORY RENAME PIPELINE
  const handleDirRename = useCallback(async (dirName: string) => {
    const newName = prompt("Enter new folder architecture node title:", dirName);
    if (!newName || newName.trim() === "" || newName === dirName) return;
    
    const currentPathStr = currentFolder ? `${currentFolder}/${dirName}` : dirName;
    const targetPathStr = currentFolder ? `${currentFolder}/${newName.trim()}` : newName.trim();
    
    try {
      await axios.post(`${API_BASE}/folder/manage`, { 
        user_id: USER_ID, 
        current_path: currentPathStr, 
        new_path_name: targetPathStr 
      });
      loadClusterTopology();
    } catch (err) {
      console.error("Directory mutation failure:", err);
    }
  }, [currentFolder, loadClusterTopology]);

  // 📁 DIRECTORY TREE PURGE TERMINATION (DEEP RECURSIVE DELETE)
  const handleDirDelete = useCallback(async (dirName: string) => {
    if (!confirm(`WARNING: This will purge folder [${dirName}] and ALL sub-contents. Continue?`)) return;
    
    const folderPathStr = currentFolder ? `${currentFolder}/${dirName}` : dirName;
    try {
      await axios.delete(`${API_BASE}/folder/purge?user_id=${USER_ID}&folder_path=${encodeURIComponent(folderPathStr)}`);
      loadClusterTopology();
    } catch (err) {
      console.error("Directory bulk purge failed:", err);
    }
  }, [currentFolder, loadClusterTopology]);

  // 🎯 UNIVERSAL PIPELINE MACHINE (Handles File Move, File Cross-Copy, and Folder Move anywhere)
  const handleUniversalRelocationCommit = useCallback(async (targetFolder: string) => {
    try {
      if (isFolderMoveMode && activeDirTarget) {
        // 🚀 BULK FOLDER MOVE
        const srcPath = currentFolder ? `${currentFolder}/${activeDirTarget}` : activeDirTarget;
        const destPath = targetFolder ? `${targetFolder}/${activeDirTarget}` : activeDirTarget;
        
        await axios.post(`${API_BASE}/folder/manage`, {
          user_id: USER_ID,
          current_path: srcPath,
          new_path_name: destPath
        });
      } else if (isFileCopyMode && activeMoveFile) {
        // 🚀 CROSS-DIRECTORY FILE COPY
        await axios.post(`${API_BASE}/asset/copy`, {
          user_id: USER_ID,
          src_object_key: activeMoveFile.object_name,
          target_folder: targetFolder,
          file_name: activeMoveFile.file_name
        });
      } else if (activeMoveFile) {
        // 🚀 FILE MOVE ANYWHERE
        await axios.post(`${API_BASE}/asset/move`, {
          user_id: USER_ID,
          src_object_key: activeMoveFile.object_name,
          target_folder: targetFolder,
          file_name: activeMoveFile.file_name
        });
      }

      // Clean up dynamic context variables
      setShowMoveModal(false);
      setActiveMoveFile(null);
      setActiveDirTarget(null);
      setIsFolderMoveMode(false);
      setIsFileCopyMode(false);
      loadClusterTopology();
    } catch (err) {
      console.error("Cross-relocation orchestration failed:", err);
      loadClusterTopology(); 
    }
  }, [isFolderMoveMode, isFileCopyMode, activeDirTarget, activeMoveFile, currentFolder, loadClusterTopology]);

  // OPTIMISTIC FILE DELETION ENGINE
  const handleDeleteNode = useCallback(async (objectKey: string) => {
    if (!confirm("Purge this shard reference?")) return;
    
    setFiles(prev => prev.filter(f => f.object_name !== objectKey));
    if (selectedDetailFile?.object_name === objectKey) {
      setSelectedDetailFile(null);
    }

    try {
      await axios.delete(`${API_BASE}/asset/remove?user_id=${USER_ID}&object_key=${encodeURIComponent(objectKey)}`);
      loadClusterTopology();
    } catch (err) {
      console.error("Purge fail, syncing back:", err);
      loadClusterTopology(); 
    }
  }, [selectedDetailFile, loadClusterTopology]);

  // FILE MUTATION / RENAME INTERACTION HANDLE
  const handleRenameAssetNode = useCallback(async (targetFile: any) => {
    const newName = prompt("Enter new filename with extension:", targetFile.file_name);
    if (!newName || newName.trim() === "" || newName === targetFile.file_name) return;

    try {
      await axios.post(`${API_BASE}/asset/rename`, {
        src_object_key: targetFile.object_name,
        new_name: newName.trim()
      });
      
      if (selectedDetailFile?.object_name === targetFile.object_name) {
        setSelectedDetailFile((prev: any) => prev ? { ...prev, file_name: newName.trim() } : null);
      }
      
      loadClusterTopology();
    } catch (err) {
      console.error("Asset mutation lifecycle failure:", err);
    }
  }, [selectedDetailFile, loadClusterTopology]);

  // NODE LOCAL TAG ALLOCATOR
  const handleAddNodeTag = useCallback((fileName: string, tag: string) => {
    setFileTags(prev => {
      const currentTags = prev[fileName] || [];
      if (currentTags.includes(tag)) return prev;
      return { ...prev, [fileName]: [...currentTags, tag] };
    });
  }, []);

  const handleOpenPreview = useCallback(async (file: any) => {
    setPreviewFile(file);
    const ext = file.file_name.split('.').pop()?.toLowerCase() || "";
    if (["json", "js", "ts", "tsx", "go", "py", "yaml", "md", "txt"].includes(ext)) {
      try {
        setLoadingCode(true);
        const res = await axios.get(`${MINIO_GATEWAY}/${file.object_name}`);
        setCodeContent(typeof res.data === 'object' ? JSON.stringify(res.data, null, 2) : res.data.toString());
      } catch (err) {
        setCodeContent("Failed to stream content buffer.");
      } finally {
        setLoadingCode(false);
      }
    }
  }, []);

  useEffect(() => {
    loadClusterTopology();
  }, [currentFolder, loadClusterTopology]);

  if (loading) return <div className={`text-[10px] font-mono p-12 text-center opacity-40 animate-pulse tracking-widest ${isLight ? 'text-slate-900' : 'text-white'}`}>SYNCHRONIZING TOPOLOGY...</div>;

  return (
    <div className="w-full flex-1 flex flex-col lg:flex-row gap-6 justify-start items-start layer-performance">
      
      {/* LEFT SECTION MESH: Directory list and files node table mapping */}
      <div className="flex-1 w-full flex flex-col justify-start">
        <NavigationHeader currentFolder={currentFolder} onNavigateBack={() => { const parts = currentFolder.split("/"); parts.pop(); setCurrentFolder(parts.join("/")); }} onCreateFolderClick={() => setShowCreateModal(true)} primaryColor={theme?.primary} isLight={isLight} />
        
        {/* Upgraded Directory Cards containing all new operational hooks */}
        <DirectoryCards 
          directories={directories} 
          onNavigate={(name) => setCurrentFolder(currentFolder ? `${currentFolder}/${name}` : name)} 
          onDirRename={handleDirRename}
          onDirDelete={handleDirDelete}
          onDirMove={(name) => {
            setActiveDirTarget(name);
            setIsFolderMoveMode(true);
            setIsFileCopyMode(false);
            setShowMoveModal(true);
          }}
          primaryColor={theme?.primary} 
          isLight={isLight} 
        />

        <div className="w-full flex-1 flex flex-col min-h-[300px]">
          <h3 className={`text-[9px] font-mono font-black uppercase tracking-[0.2em] mb-3 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>Committed Data Shards</h3>
          {filteredFiles.length === 0 ? (
            <div className={`w-full flex-1 min-h-[250px] border border-dashed rounded-[2rem] text-center flex flex-col items-center justify-center gap-3 p-8 ${isLight ? 'border-slate-200 bg-slate-50/50' : 'border-white/5 bg-white/[0.005]'}`}>
              <p className="text-[9px] font-mono uppercase tracking-widest opacity-40">No matching assets found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {filteredFiles.map((file) => (
                <FileRow 
                  key={file.id} 
                  file={file} 
                  onPreview={handleOpenPreview} 
                  onDelete={handleDeleteNode}
                  onMoveClick={(targetFile) => {
                    setActiveMoveFile(targetFile);
                    setIsFolderMoveMode(false);
                    setIsFileCopyMode(false);
                    setShowMoveModal(true);
                  }}
                  onCopyClick={(targetFile) => {
                    setActiveMoveFile(targetFile);
                    setIsFolderMoveMode(false);
                    setIsFileCopyMode(true); // Triggers copy routing flow inside the modal commit
                    setShowMoveModal(true);
                  }}
                  onRenameClick={handleRenameAssetNode}   
                  onDetailsClick={(targetFile) => setSelectedDetailFile(targetFile)} 
                  gatewayUrl={MINIO_GATEWAY} 
                  primaryColor={theme?.primary} 
                  isLight={isLight} 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION DIAGNOSTICS: Side-Panel */}
      {selectedDetailFile && (
        <DetailsPanel 
          file={selectedDetailFile}
          onClose={() => setSelectedDetailFile(null)}
          isLight={isLight}
          onAddTag={handleAddNodeTag}
          fileTags={fileTags}
        />
      )}

      {/* OVERLAYS SHUTTERS */}
      <CreateFolderModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreateFolder} isLight={isLight} />
      <PreviewModal file={previewFile} codeContent={codeContent} loadingCode={loadingCode} onClose={() => { setPreviewFile(null); setCodeContent(""); }} gateway={MINIO_GATEWAY} primaryColor={theme?.primary} />
      
      {/* UNIVERSAL ROUTING TREE MODAL */}
      <MoveFolderModal 
        isOpen={showMoveModal}
        onClose={() => { 
          setShowMoveModal(false); 
          setActiveMoveFile(null); 
          setActiveDirTarget(null);
          setIsFolderMoveMode(false);
          setIsFileCopyMode(false);
        }} 
        directories={directories}
        currentFolder={currentFolder}
        onConfirmMove={handleUniversalRelocationCommit}
        isLight={isLight}
      />
    </div>
  );
}