"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { File } from "lucide-react";
import { useThemeStore } from "@/store/useThemeStore";

import { NavigationHeader } from "./NavigationHeader";
import { DirectoryCards } from "./DirectoryCards";
import { FileRow } from "./FileRow";
import { CreateFolderModal } from "./CreateFolderModal";
import { PreviewModal } from "./PreviewModal";

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentFolder]);

  // 🎯 REAL-TIME SEARCH OPTIMIZATION FILTER
  const filteredFiles = useMemo(() => {
    return files.filter(f => f.file_name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [files, searchQuery]);

  const handleCreateFolder = useCallback(async (folderName: string) => {
    try {
      await axios.post(`${API_BASE}/folder/create`, { user_id: USER_ID, folder_name: folderName, parent_path: currentFolder });
      loadClusterTopology();
    } catch (err) {
      console.error(err);
    }
  }, [currentFolder, loadClusterTopology]);

  // 🎯 OPTIMISTIC DELETION ENGINE
  const handleDeleteNode = useCallback(async (objectKey: string) => {
    if (!confirm("Purge this shard reference?")) return;
    
    // Instant UI hide action before waiting for server response!
    setFiles(prev => prev.filter(f => f.object_name !== objectKey));

    try {
      await axios.delete(`${API_BASE}/asset/remove?user_id=${USER_ID}&object_key=${encodeURIComponent(objectKey)}`);
      loadClusterTopology();
    } catch (err) {
      console.error("Purge fail, syncing back:", err);
      loadClusterTopology(); // Re-sync topology if crash occurs
    }
  }, [loadClusterTopology]);

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
    <div className="w-full flex-1 flex flex-col justify-start layer-performance">
      <NavigationHeader currentFolder={currentFolder} onNavigateBack={() => { const parts = currentFolder.split("/"); parts.pop(); setCurrentFolder(parts.join("/")); }} onCreateFolderClick={() => setShowCreateModal(true)} primaryColor={theme?.primary} isLight={isLight} />
      <DirectoryCards directories={directories} onNavigate={(name) => setCurrentFolder(currentFolder ? `${currentFolder}/${name}` : name)} primaryColor={theme?.primary} isLight={isLight} />

      <div className="w-full flex-1 flex flex-col min-h-[300px]">
        <h3 className={`text-[9px] font-mono font-black uppercase tracking-[0.2em] mb-3 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>Committed Data Shards</h3>
        {filteredFiles.length === 0 ? (
          <div className={`w-full flex-1 min-h-[250px] border border-dashed rounded-[2rem] text-center flex flex-col items-center justify-center gap-3 p-8 ${isLight ? 'border-slate-200 bg-slate-50/50' : 'border-white/5 bg-white/[0.005]'}`}>
            <p className="text-[9px] font-mono uppercase tracking-widest opacity-40">No matching assets found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {filteredFiles.map((file) => (
              <FileRow key={file.id} file={file} onPreview={handleOpenPreview} onDelete={handleDeleteNode} gatewayUrl={MINIO_GATEWAY} primaryColor={theme?.primary} isLight={isLight} />
            ))}
          </div>
        )}
      </div>

      <CreateFolderModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreateFolder} isLight={isLight} />
      <PreviewModal file={previewFile} codeContent={codeContent} loadingCode={loadingCode} onClose={() => { setPreviewFile(null); setCodeContent(""); }} gateway={MINIO_GATEWAY} primaryColor={theme?.primary} />
    </div>
  );
}