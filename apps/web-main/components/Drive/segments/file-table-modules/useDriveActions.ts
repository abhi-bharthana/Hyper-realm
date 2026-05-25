"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import { StorageFile } from "./types";

export function useDriveActions(USER_ID: string, API_BASE: string, currentFolder: string, loadClusterTopology: () => void) {
  const [activeMoveFile, setActiveMoveFile] = useState<StorageFile | null>(null);
  const [activeDirTarget, setActiveDirTarget] = useState<string | null>(null);
  const [isFolderMoveMode, setIsFolderMoveMode] = useState(false);
  const [isFileCopyMode, setIsFileCopyMode] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);

  const [activeShareFile, setActiveShareFile] = useState<StorageFile | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const [selectedDetailFile, setSelectedDetailFile] = useState<StorageFile | null>(null);
  const [activeNodeTags, setActiveNodeTags] = useState<string[]>([]); // 🎯 FIXED: Direct track single array context instead of records

  // 🎯 FETCH: Load real tag strings straight from MinIO object nodes
  const fetchActiveAssetTags = useCallback(async (objectKey: string) => {
    try {
      const res = await axios.get(`${API_BASE}/asset/tags?object_key=${encodeURIComponent(objectKey)}`);
      setActiveNodeTags(res.data.tags || []);
    } catch (err) {
      console.error("Failed to sync tags from node:", err);
      setActiveNodeTags([]);
    }
  }, [API_BASE]);

  // 🎯 INTERCEPT SELECTION: When clicking diagnostic details panel, fetch its current tags instantly
  const handleSelectDetailFile = useCallback((file: StorageFile | null) => {
    setSelectedDetailFile(file);
    if (file) {
      fetchActiveAssetTags(file.object_name);
    } else {
      setActiveNodeTags([]);
    }
  }, [fetchActiveAssetTags]);

  const handleUniversalRelocationCommit = useCallback(async (targetFolder: string) => {
    try {
      if (isFolderMoveMode && activeDirTarget) {
        const srcPath = currentFolder ? `${currentFolder}/${activeDirTarget}` : activeDirTarget;
        const destPath = targetFolder ? `${targetFolder}/${activeDirTarget}` : activeDirTarget;
        await axios.post(`${API_BASE}/folder/manage`, { user_id: USER_ID, current_path: srcPath, new_path_name: destPath });
      } else if (isFileCopyMode && activeMoveFile) {
        await axios.post(`${API_BASE}/asset/copy`, { user_id: USER_ID, src_object_key: activeMoveFile.object_name, target_folder: targetFolder, file_name: activeMoveFile.file_name });
      } else if (activeMoveFile) {
        await axios.post(`${API_BASE}/asset/move`, { user_id: USER_ID, src_object_key: activeMoveFile.object_name, target_folder: targetFolder, file_name: activeMoveFile.file_name });
      }
      setShowMoveModal(false);
      setActiveMoveFile(null);
      setActiveDirTarget(null);
      setIsFolderMoveMode(false);
      setIsFileCopyMode(false);
      loadClusterTopology();
    } catch (err) {
      console.error(err);
      loadClusterTopology();
    }
  }, [isFolderMoveMode, isFileCopyMode, activeDirTarget, activeMoveFile, currentFolder, API_BASE, USER_ID, loadClusterTopology]);

  const handleCopyAssetNode = useCallback(async (targetFile: StorageFile) => {
    try {
      await axios.post(`${API_BASE}/asset/copy`, { user_id: USER_ID, src_object_key: targetFile.object_name, target_folder: currentFolder, file_name: targetFile.file_name });
      loadClusterTopology();
    } catch (err) { console.error(err); }
  }, [currentFolder, API_BASE, USER_ID, loadClusterTopology]);

  // 🎯 FIXED: Explicit user_id passing and exact object_name state sync mechanics
  const handleRenameAssetNode = useCallback(async (targetFile: StorageFile) => {
    const newName = prompt("Enter new filename with extension:", targetFile.file_name);
    if (!newName || newName.trim() === "" || newName === targetFile.file_name) return;
    
    // Compute targeted structural path descriptor up front
    const baseDir = targetFile.object_name.substring(0, targetFile.object_name.lastIndexOf("/"));
    const targetNewObjectKey = `${baseDir}/${newName.trim()}`;

    try {
      // Pass client identification to keep Redis list indexing tightly safe
      await axios.post(`${API_BASE}/asset/rename`, { 
        user_id: USER_ID,
        src_object_key: targetFile.object_name, 
        new_name: newName.trim() 
      });

      // Synchronize selection tracking so DetailsPanel hooks the brand new footprint immediately
      if (selectedDetailFile?.object_name === targetFile.object_name) {
        setSelectedDetailFile((prev: any) => prev ? { 
          ...prev, 
          file_name: newName.trim(), 
          object_name: targetNewObjectKey 
        } : null);
      }
      loadClusterTopology();
    } catch (err) { console.error(err); }
  }, [selectedDetailFile, API_BASE, USER_ID, loadClusterTopology]);

  // 🎯 SAVE: Commits tag modification array to Storage API backend natively
  const handleAddNodeTag = useCallback(async (objectKey: string, newTag: string) => {
    const uppercaseTag = newTag.trim().toUpperCase();
    if (activeNodeTags.includes(uppercaseTag)) return;

    const updatedTags = [...activeNodeTags, uppercaseTag];
    setActiveNodeTags(updatedTags); // Optimistic UI update

    try {
      await axios.post(`${API_BASE}/asset/tags`, {
        user_id: USER_ID,
        object_key: objectKey,
        tags: updatedTags
      });
    } catch (err) {
      console.error("Tag commit mapping failed:", err);
      fetchActiveAssetTags(objectKey); // Revert state to server on breakdown
    }
  }, [activeNodeTags, API_BASE, USER_ID, fetchActiveAssetTags]);

  // 🎯 REMOVE: Drop tag from node context array
  const handleRemoveNodeTag = useCallback(async (objectKey: string, tagToRemove: string) => {
    const updatedTags = activeNodeTags.filter(t => t !== tagToRemove);
    setActiveNodeTags(updatedTags);

    try {
      await axios.post(`${API_BASE}/asset/tags`, {
        user_id: USER_ID,
        object_key: objectKey,
        tags: updatedTags
      });
    } catch (err) {
      console.error("Tag removal transaction failed:", err);
      fetchActiveAssetTags(objectKey);
    }
  }, [activeNodeTags, API_BASE, USER_ID, fetchActiveAssetTags]);

  return {
    activeMoveFile, setActiveMoveFile,
    activeDirTarget, setActiveDirTarget,
    isFolderMoveMode, setIsFolderMoveMode,
    isFileCopyMode, setIsFileCopyMode,
    showMoveModal, setShowMoveModal,
    activeShareFile, setActiveShareFile,
    showShareModal, setShowShareModal,
    selectedDetailFile, setSelectedDetailFile: handleSelectDetailFile, // Mapped override helper
    activeNodeTags, handleAddNodeTag, handleRemoveNodeTag, // Export fresh parameters
    handleUniversalRelocationCommit,
    handleCopyAssetNode,
    handleRenameAssetNode
  };
}