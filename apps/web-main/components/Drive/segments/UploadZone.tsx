"use client";

import { useState, useRef } from "react";
import { useThemeStore } from "@/store/useThemeStore";
import { UploadCloud, File, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios"; // 🎯 Axios integration for stable chunking

interface UploadZoneProps {
  isLight: boolean;
  onUploadSuccess?: (newUsage: number) => void;
}

// 🎯 STANDARD S3 CHUNK SIZE: 5MB
const CHUNK_SIZE = 5 * 1024 * 1024; 

export function UploadZone({ isLight, onUploadSuccess }: UploadZoneProps) {
  const { theme } = useThemeStore();
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [chunkInfo, setChunkInfo] = useState({ current: 0, total: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // DRAG EVENTS
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

  // 🚀 THE AXIOS 3-STEP MULTIPART CHUNK PIPELINE
  const processFile = async (file: File) => {
    // 1. Quota Validation
    const maxLimitBytes = 5 * 1024 * 1024 * 1024; // 5GB
    if (file.size > maxLimitBytes) {
      setErrorMessage("5GB Storage Limit Exceeded!");
      setUploadStatus('error');
      return;
    }

    setFileName(file.name);
    setUploadStatus('uploading');
    setProgress(0);

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    setChunkInfo({ current: 0, total: totalChunks });

    const API_BASE = "http://localhost:8001/api/v1/storage";
    const USER_ID = "abhishek-babu-node"; // Identity Payload Map
    const headers = { "Authorization": "Bearer MOCK_HYPER_ID_JWT_TOKEN" };

    try {
      // ==========================================
      // STEP 1: INITIALIZE MULTIPART UPLOAD
      // ==========================================
      const initForm = new FormData();
      initForm.append("user_id", USER_ID);
      initForm.append("file_name", file.name);
      initForm.append("content_type", file.type || "application/octet-stream");

      const initRes = await axios.post(`${API_BASE}/upload/init`, initForm, { 
        headers: { ...headers, "Content-Type": "multipart/form-data" } 
      });
      const { upload_id, object_name } = initRes.data;
      
      // 🎯 THE CRITICAL FIX: Declaring the tracker array explicitly BEFORE the execution loop starts
      const uploadedParts: { PartNumber: number; ETag: string }[] = [];

      // ==========================================
      // STEP 2: LOOP & UPLOAD CHUNKS
      // ==========================================
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunkBlob = file.slice(start, end);

        const chunkForm = new FormData();
        chunkForm.append("upload_id", upload_id);
        chunkForm.append("object_name", object_name);
        chunkForm.append("part_number", (i + 1).toString());
        chunkForm.append("chunk", chunkBlob, file.name);

        const chunkRes = await axios.post(`${API_BASE}/upload/chunk`, chunkForm, { 
          headers: { ...headers, "Content-Type": "multipart/form-data" } 
        });
        
        // 🚀 Now this will seamlessly find the defined reference array scope!
        uploadedParts.push({
          PartNumber: i + 1,
          ETag: chunkRes.data.etag,
        });

        // Update UI Real-time
        setChunkInfo({ current: i + 1, total: totalChunks });
        setProgress(Math.round(((i + 1) / totalChunks) * 100));
      }

      // ==========================================
      // STEP 3: COMPLETE & MERGE MULTIPART
      // ==========================================
      const completeForm = new FormData();
      completeForm.append("user_id", USER_ID);
      completeForm.append("upload_id", upload_id);
      completeForm.append("object_name", object_name);
      completeForm.append("total_size", file.size.toString());

      // Pass the collected ETags arrays as JSON string blob for Go's BodyParser
      const partsBlob = new Blob([JSON.stringify(uploadedParts)], { type: "application/json" });
      completeForm.append("parts", partsBlob); 

      // In Go Fiber `c.BodyParser` will natively parse raw JSON. So we send a pure JSON POST instead of Form for Step 3 to ensure perfect parsing:
      const completeRes = await axios.post(`${API_BASE}/upload/complete?user_id=${USER_ID}&upload_id=${upload_id}&object_name=${encodeURIComponent(object_name)}&total_size=${file.size}`, 
        uploadedParts, // Array of {PartNumber, ETag} directly as JSON body
        { 
          headers: { ...headers, "Content-Type": "application/json" }
        }
      );

      if (completeRes.data.status === "Success") {
        setUploadStatus('success');
        if (onUploadSuccess) onUploadSuccess(completeRes.data.used_storage_bytes);
        
        // 🎯 FIX: Dispatch cross-component trigger event to live reload the FileListTable instantly!
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
      />

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => uploadStatus !== 'uploading' && fileInputRef.current?.click()}
        className={`w-full p-8 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center min-h-[180px] select-none transition-all duration-300 relative overflow-hidden ${
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

          {/* STATE 2: UPLOADING (CHUNK PROGRESS) */}
          {uploadStatus === 'uploading' && (
            <motion.div 
              key="uploading"
              className="flex flex-col items-center text-center gap-3 w-full max-w-xs"
            >
              <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mb-2" style={{ borderColor: theme?.primary, borderTopColor: 'transparent' }} />
              <div className="w-full">
                <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest mb-1.5">
                  <span className="opacity-70 truncate max-w-[120px]">{fileName}</span>
                  <span style={{ color: theme?.primary }}>{progress}%</span>
                </div>
                {/* Visual Progress Bar */}
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: theme?.primary }}
                  />
                </div>
                <p className="text-[8px] font-mono opacity-50 uppercase tracking-widest mt-2">
                  Transmitting Chunk {chunkInfo.current} of {chunkInfo.total}
                </p>
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
                <p className="text-[9px] font-mono opacity-60 uppercase tracking-widest mt-0.5">Chunks Assembled Successfully</p>
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