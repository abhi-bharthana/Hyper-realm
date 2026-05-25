"use client";

import { useState, useRef } from "react";
import { useThemeStore } from "@/store/useThemeStore";
import { UploadCloud, AlertTriangle, CheckCircle2, Pause, Play, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

interface UploadZoneProps {
  isLight: boolean;
  onUploadSuccess?: (newUsage: number) => void;
  currentFolder?: string; // 🎯 Mapped subfolder context
}

const CHUNK_SIZE = 5 * 1024 * 1024; 

export function UploadZone({ isLight, onUploadSuccess, currentFolder = "" }: UploadZoneProps) {
  const { theme } = useThemeStore();
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [chunkInfo, setChunkInfo] = useState({ current: 0, total: 0 });
  const [statusMsg, setStatusMsg] = useState("");
  
  // 🎯 PAUSE / RESUME TRACKING REF ENGINE
  const [isPaused, setIsPaused] = useState(false);
  const pausedRef = useRef(false);
  const uploadCancelledRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragActive(true);
    else if (e.type === "dragleave") setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };

  const togglePauseResume = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering file selection panel on click
    const nextPauseState = !isPaused;
    setIsPaused(nextPauseState);
    pausedRef.current = nextPauseState;
    if (!nextPauseState) setStatusMsg("Re-establishing channel stream...");
  };

  // 🚀 THE AXIOS 3-STEP RESUMABLE MULTIPART ENGINE
  const processFile = async (file: File) => {
    const maxLimitBytes = 5 * 1024 * 1024 * 1024; // 5GB
    if (file.size > maxLimitBytes) {
      setErrorMessage("5GB Storage Limit Exceeded!");
      setUploadStatus('error');
      return;
    }

    setFileName(file.name);
    setUploadStatus('uploading');
    setIsPaused(false);
    pausedRef.current = false;
    uploadCancelledRef.current = false;
    setProgress(0);
    setStatusMsg("Initializing secure handshake...");

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    setChunkInfo({ current: 0, total: totalChunks });

    const API_BASE = "http://localhost:8001/api/v1/storage";
    const USER_ID = "abhishek-babu-node"; 
    const headers = { "Authorization": "Bearer MOCK_HYPER_ID_JWT_TOKEN" };

    try {
      // ==========================================
      // STEP 1: RESUMABLE HANDSHAKE INITIALIZATION
      // ==========================================
      const initForm = new FormData();
      initForm.append("user_id", USER_ID);
      initForm.append("file_name", file.name);
      initForm.append("file_size", file.size.toString()); // Passing size to fetch Redis token hash
      initForm.append("prefix", currentFolder);

      const initRes = await axios.post(`${API_BASE}/upload/init`, initForm, { 
        headers: { ...headers, "Content-Type": "multipart/form-data" } 
      });
      
      const { upload_id, object_name, resume_from_part } = initRes.data;
      const startPart = resume_from_part || 0;

      if (startPart > 0) {
        setStatusMsg(`Active session cached. Resuming from part ${startPart + 1}...`);
      } else {
        setStatusMsg("Connection established. Streaming blocks...");
      }

      const uploadedParts: { PartNumber: number; ETag: string }[] = [];

      // ==========================================
      // STEP 2: LOOP & UPLOAD CHUNKS
      // ==========================================
      for (let i = 0; i < totalChunks; i++) {
        const partNum = i + 1;

        // 🚦 RESUME INTERCEPTION BYPASS
        if (partNum <= startPart) {
          const skipProgress = Math.round((partNum / totalChunks) * 100);
          setProgress(skipProgress);
          setChunkInfo({ current: partNum, total: totalChunks });
          continue;
        }

        // 🛑 SPIN LOCK WHEEL FOR STATE PAUSE DEFERRALS
        while (pausedRef.current) {
          setStatusMsg("Transmission deferred (PAUSED)");
          await new Promise((resolve) => setTimeout(resolve, 500));
          if (uploadCancelledRef.current) return;
        }

        setStatusMsg(`Streaming data shard ${partNum} / ${totalChunks}...`);

        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunkBlob = file.slice(start, end);

        const chunkForm = new FormData();
        chunkForm.append("upload_id", upload_id);
        chunkForm.append("object_name", object_name);
        chunkForm.append("part_number", partNum.toString());
        chunkForm.append("chunk", chunkBlob, file.name);

        const chunkRes = await axios.post(`${API_BASE}/upload/chunk`, chunkForm, { 
          headers: { ...headers, "Content-Type": "multipart/form-data" } 
        });
        
        uploadedParts.push({
          PartNumber: partNum,
          ETag: chunkRes.data.etag,
        });

        // Live stats tracking metrics updates
        setChunkInfo({ current: partNum, total: totalChunks });
        setProgress(Math.round((partNum / totalChunks) * 100));
      }

      // ==========================================
      // STEP 3: COMPLETE COMPOSITION SYNCHRONIZATION
      // ==========================================
      setStatusMsg("Assembling architecture shards...");
      
      const completeRes = await axios.post(
        `${API_BASE}/upload/complete?user_id=${USER_ID}&upload_id=${upload_id}&object_name=${encodeURIComponent(object_name)}&total_size=${file.size}`, 
        uploadedParts, 
        { headers: { ...headers, "Content-Type": "application/json" } }
      );

      if (completeRes.data.status === "Success" || completeRes.data.used_storage_bytes !== undefined) {
        setStatusMsg("Node Sync Complete!");
        setUploadStatus('success');
        
        if (onUploadSuccess && typeof completeRes.data.used_storage_bytes === "number") {
          onUploadSuccess(completeRes.data.used_storage_bytes);
        }
        
        window.dispatchEvent(new Event("refresh-assets"));
        setTimeout(() => setUploadStatus('idle'), 3000);
      } else {
        throw new Error(completeRes.data.error || "Failed to assemble file chunks");
      }

    } catch (err: any) {
      console.error("Multipart streaming failed:", err);
      setErrorMessage(err.response?.data?.error || "Pipeline stream disconnected");
      setUploadStatus('error');
    }
  };

  return (
    <div className="w-full mb-6">
      <input 
        ref={fileInputRef}
        type="file" 
        className="hidden" 
        onChange={handleFileInput}
        disabled={uploadStatus === 'uploading'}
      />

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => uploadStatus !== 'uploading' && fileInputRef.current?.click()}
        className={`w-full p-8 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center min-h-[190px] select-none transition-all duration-300 relative overflow-hidden ${
          uploadStatus !== 'uploading' ? 'cursor-pointer' : 'cursor-wait'
        } ${
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : isLight ? 'border-slate-300 bg-slate-50 hover:bg-slate-100/70' : 'border-white/10 bg-white/[0.01] hover:bg-white/[0.02]'
        }`}
        style={isDragActive ? { borderColor: theme?.primary } : {}}
      >
        <AnimatePresence mode="wait">
          {/* STATE 1: IDLE */}
          {uploadStatus === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center text-center gap-3"
            >
              <div className="p-4 rounded-full bg-primary/10 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" style={{ color: theme?.primary }} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider">Drag & Drop Asset Space</p>
                <p className="text-[9px] font-mono opacity-50 uppercase tracking-widest mt-0.5">Ceph Object Streaming Interface</p>
              </div>
            </motion.div>
          )}

          {/* STATE 2: UPLOADING (WITH PROGRESS + PAUSE TRIGGER CONTROLS) */}
          {uploadStatus === 'uploading' && (
            <motion.div 
              key="uploading"
              className="flex flex-col items-center text-center gap-3 w-full max-w-xs"
            >
              <div className="flex items-center justify-center relative mb-1">
                <Loader2 className="w-8 h-8 animate-spin text-primary" style={{ color: theme?.primary }} />
              </div>
              
              <div className="w-full">
                <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest mb-1.5">
                  <span className="opacity-70 truncate max-w-[140px] font-bold">{statusMsg}</span>
                  <span className="font-black text-xs" style={{ color: theme?.primary }}>{progress}%</span>
                </div>
                
                {/* Visual Progress Bar */}
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}>
                  <motion.div 
                    layoutId="uploadProgress"
                    className="h-full rounded-full"
                    style={{ backgroundColor: theme?.primary, width: `${progress}%` }}
                  />
                </div>
                
                <p className="text-[8px] font-mono opacity-50 uppercase tracking-widest mt-2">
                  Transmitting Chunk {chunkInfo.current} of {chunkInfo.total}
                </p>

                {/* INTERACTIVE CONTROLLER ACTIONS LAYER */}
                <button 
                  onClick={togglePauseResume}
                  className={`mt-3 px-4 py-1.5 rounded-xl font-mono text-[8px] uppercase tracking-widest flex items-center gap-1.5 border mx-auto transition-all active:scale-95 ${
                    isLight ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-zinc-900 border-white/5 hover:bg-white/5 text-white'
                  }`}
                >
                  {isPaused ? (
                    <> <Play className="w-2.5 h-2.5 fill-current text-emerald-400" /> Resume Stream </>
                  ) : (
                    <> <Pause className="w-2.5 h-2.5 fill-current text-amber-400" /> Pause Transfer </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* STATE 3: SUCCESS */}
          {uploadStatus === 'success' && (
            <motion.div 
              key="success"
              className="flex flex-col items-center text-center gap-3"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-bounce" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-emerald-500">Node Sync Complete</p>
                <p className="text-[9px] font-mono opacity-60 uppercase tracking-widest mt-0.5">{statusMsg}</p>
              </div>
            </motion.div>
          )}

          {/* STATE 4: ERROR */}
          {uploadStatus === 'error' && (
            <motion.div 
              key="error"
              className="flex flex-col items-center text-center gap-3"
            >
              <AlertTriangle className="w-10 h-10 text-red-500" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-red-500">{errorMessage}</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setUploadStatus('idle'); }}
                  className="text-[9px] font-mono uppercase tracking-widest underline mt-1 opacity-60 hover:opacity-100"
                >
                  Reset Pipeline
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}