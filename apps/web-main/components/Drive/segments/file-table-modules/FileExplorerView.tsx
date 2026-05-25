"use client";

import { FileRow } from "../FileRow";
import { StorageFile } from "./types";

interface FileExplorerViewProps {
  filteredFiles: StorageFile[];
  handleOpenPreview: (file: StorageFile) => void;
  handleDeleteNode: (key: string) => void;
  setActiveMoveFile: (file: StorageFile) => void;
  setIsFolderMoveMode: (b: boolean) => void;
  setIsFileCopyMode: (b: boolean) => void;
  setShowMoveModal: (b: boolean) => void;
  handleCopyAssetNode: (file: StorageFile) => void;
  handleRenameAssetNode: (file: StorageFile) => void;
  setSelectedDetailFile: (file: StorageFile) => void;
  setActiveShareFile: (file: StorageFile) => void;
  setShowShareModal: (b: boolean) => void;
  MINIO_GATEWAY: string;
  themePrimary?: string;
  isLight: boolean;
}

export function FileExplorerView({
  filteredFiles, handleOpenPreview, handleDeleteNode, setActiveMoveFile,
  setIsFolderMoveMode, setIsFileCopyMode, setShowMoveModal, handleCopyAssetNode,
  handleRenameAssetNode, setSelectedDetailFile, setActiveShareFile, setShowShareModal,
  MINIO_GATEWAY, themePrimary, isLight
}: FileExplorerViewProps) {
  return (
    <div className="w-full flex-1 flex flex-col min-h-[300px]">
      <h3 className={`text-[9px] font-mono font-black uppercase tracking-[0.2em] mb-3 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
        Committed Data Shards
      </h3>
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
              onMoveClick={(tf) => { setActiveMoveFile(tf); setIsFolderMoveMode(false); setIsFileCopyMode(false); setShowMoveModal(true); }}
              onCopyClick={handleCopyAssetNode}
              onRenameClick={handleRenameAssetNode}   
              onDetailsClick={(tf) => setSelectedDetailFile(tf)} 
              onShareClick={(tf) => { setActiveShareFile(tf); setShowShareModal(true); }}
              gatewayUrl={MINIO_GATEWAY} 
              primaryColor={themePrimary} 
              isLight={isLight} 
            />
          ))}
        </div>
      )}
    </div>
  );
}