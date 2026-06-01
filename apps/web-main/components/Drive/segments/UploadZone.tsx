"use client";

import { useState, useRef } from "react";
import { useThemeStore } from "@/store/useThemeStore";
import { UploadCloud, AlertTriangle, CheckCircle2, Pause, Play, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api, API_URLS } from "@/lib/api"; 

interface UploadZoneProps {
  isLight: boolean;
  onUploadSuccess?: (newUsage: number) => void;
  currentFolder?: string; 
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
    e.stopPropagation(); 
    const nextPauseState = !isPaused;
    setIsPaused(nextPauseState);
    pausedRef.current = nextPauseState;
    if (!nextPauseState) setStatusMsg("Re-establishing channel stream...");
  };

  // 🚀 FIX: Added `retryCount` to strictly break infinite loops!
  const processFile = async (file: File, retryCount = 0) => {
    const maxLimitBytes = 5 * 1024 * 1024 * 1024; // 5GB
    if (file.size > maxLimitBytes) {
      setErrorMessage("5GB Storage Limit Exceeded!");
      setUploadStatus('error');
      return;
    }

    if (retryCount === 0) setFileName(file.name);
    setUploadStatus('uploading');
    setIsPaused(false);
    pausedRef.current = false;
    uploadCancelledRef.current = false;
    if (retryCount === 0) setProgress(0);
    setStatusMsg(retryCount > 0 ? "Bypassing dead cache... Initiating new stream!" : "Initializing secure handshake...");

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    setChunkInfo({ current: 0, total: totalChunks });

    const API_BASE = `${API_URLS.STORAGE}/storage`;
    const USER_ID = "abhishek-babu-node"; 

    try {
      // ==========================================
      // STEP 1: SMART HANDSHAKE INITIALIZATION
      // ==========================================
      const initForm = new FormData();
      initForm.append("user_id", USER_ID);
      
      // 🚀 CACHE-BUSTER MAGIC: Backend ko bewakoof banane ki ninja technique
      let backendFileName = file.name;
      if (retryCount > 0) {
          const parts = file.name.split('.');
          const ext = parts.pop();
          // Adds a tiny timestamp so the Go backend ignores its old Redis cache
          backendFileName = `${parts.join('.')}_rev${Date.now()}.${ext}`;
      }
      initForm.append("file_name", backendFileName);
      
      initForm.append("file_size", file.size.toString()); 
      initForm.append("prefix", currentFolder);

      const initRes = await api.raw(`${API_BASE}/upload/init`, { 
        method: "POST",
        body: initForm
      });
      if (!initRes.ok) throw new Error(await initRes.text());
      
      const initData = await initRes.json();
      
      const { upload_id, object_name, resume_from_part, file_id } = initData;
      const startPart = resume_from_part || 0;

      const cacheKey = `hyper_upload_parts_${file_id}`;
      let uploadedParts: { PartNumber: number; ETag: string }[] = [];

      // Only attempt to resume if we haven't actively busted the cache
      if (startPart > 0 && retryCount === 0) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) uploadedParts = JSON.parse(cached);
        setStatusMsg(`Active session cached. Resuming from part ${startPart + 1}...`);
      } else {
        setStatusMsg("Connection established. Streaming blocks...");
      }

      // ==========================================
      // STEP 2: LOOP & UPLOAD CHUNKS
      // ==========================================
      for (let i = 0; i < totalChunks; i++) {
        const partNum = i + 1;

        if (partNum <= startPart && retryCount === 0 && uploadedParts.find(p => p.PartNumber === partNum)) {
          const skipProgress = Math.round((partNum / totalChunks) * 100);
          setProgress(skipProgress);
          setChunkInfo({ current: partNum, total: totalChunks });
          continue;
        }

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
        chunkForm.append("file_id", file_id); 
        chunkForm.append("chunk", chunkBlob, file.name);

        const chunkRes = await api.raw(`${API_BASE}/upload/chunk`, { 
          method: "POST",
          body: chunkForm
        });

        // 🚀 LOOP BREAKER: Sirf EK baar retry karega
        if (!chunkRes.ok) {
           const errText = await chunkRes.text();
           if (retryCount < 1 && (chunkRes.status === 500 || errText.includes("does not exist") || errText.includes("rejected"))) {
               console.warn(`Zombie Session Detected. Flushing cache and tricking backend (Attempt ${retryCount + 1})...`);
               localStorage.removeItem(cacheKey);
               setTimeout(() => processFile(file, retryCount + 1), 1500); // Trigger Cache-Buster
               return; 
           }
           throw new Error(`Server Error: ${errText || chunkRes.status}`);
        }

        const chunkData = await chunkRes.json();
        
        uploadedParts.push({
          PartNumber: partNum,
          ETag: chunkData.etag,
        });

        localStorage.setItem(cacheKey, JSON.stringify(uploadedParts));

        setChunkInfo({ current: partNum, total: totalChunks });
        setProgress(Math.round((partNum / totalChunks) * 100));
      }

      // ==========================================
      // STEP 3: COMPLETE COMPOSITION SYNCHRONIZATION
      // ==========================================
      setStatusMsg("Assembling architecture shards...");
      
      const completeRes = await api.post(
        `${API_BASE}/upload/complete?user_id=${USER_ID}&upload_id=${upload_id}&object_name=${encodeURIComponent(object_name)}&total_size=${file.size}`, 
        uploadedParts
      );

      if (completeRes.status === "Success" || completeRes.used_storage_bytes !== undefined) {
        setStatusMsg("Node Sync Complete!");
        setUploadStatus('success');
        localStorage.removeItem(cacheKey); 
        
        if (onUploadSuccess && typeof completeRes.used_storage_bytes === "number") {
          onUploadSuccess(completeRes.used_storage_bytes);
        }
        
        window.dispatchEvent(new Event("refresh-assets"));
        setTimeout(() => setUploadStatus('idle'), 3000);
      } else {
        throw new Error(completeRes.error || "Failed to assemble file chunks");
      }

    } catch (err: any) {
      console.error("Multipart streaming failed:", err);
      let errMsg = "Pipeline stream disconnected";
      if (err.message) errMsg = err.message;
      setErrorMessage(errMsg);
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