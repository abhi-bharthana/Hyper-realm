'use client';
import React, { useState, useRef, useEffect } from 'react';

// 🚀 FIX: Corrected import paths based on your actual directory structure
import CanvasStage from '@/components/3d-lab/components/viewer/CanvasStage'; 
import { useAssetUpload } from '@/components/3d-lab/hooks/useAssetUpload';
import { useGenerationQueue } from '@/components/3d-lab/hooks/useGenerationQueue'; 

import { UploadCloud, Box, Sparkles, Loader2 } from 'lucide-react';

export default function ThreeDLabApp() {
  const [activeModelUrl, setActiveModelUrl] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<File | null>(null);
  
  // State to hold Image for AI Generation
  const [generationAssetId, setGenerationAssetId] = useState<string | null>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadAsset, isUploading, uploadProgress } = useAssetUpload();
  
  // Connect Real-time WebSocket Queue
  const { status: genStatus, generatedUrl } = useGenerationQueue(generationAssetId);

  // 🪄 THE MAGIC: Automatically display the 3D model when AI finishes!
  useEffect(() => {
    if (genStatus === 'ready' && generatedUrl) {
      setActiveModelUrl(generatedUrl);
      setGenerationAssetId(null); // Reset queue
    } else if (genStatus === 'failed') {
      alert("❌ AI Generation failed. Try another image.");
      setGenerationAssetId(null);
    }
  }, [genStatus, generatedUrl]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => { setIsDragging(false); };

  const processFile = async (file: File) => {
    // 1. Agar 3D Model hai, toh seedha Phase 1 MVP logic (Local Preview)
    if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
      const blobUrl = URL.createObjectURL(file);
      setActiveModelUrl(blobUrl);
      setActiveFile(file);
    } 
    // 2. Agar Image hai, toh Phase 3 logic (Trigger AI Worker)
    else if (file.type.startsWith('image/')) {
      setActiveModelUrl(null); // Clear canvas
      const result = await uploadAsset(file); // MinIO mein image bhejo
      
      if (result.success && result.asset_id) {
        // ID set karte hi useGenerationQueue hook WebSocket connect kar lega
        setGenerationAssetId(result.asset_id); 
      } else {
        alert("❌ Image upload failed.");
      }
    } 
    else {
      alert('Sirf .glb, .gltf, .jpg, ya .png files hi allowed hain!');
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) processFile(e.target.files[0]);
  };

  return (
    <div className="flex flex-col h-full w-full bg-card text-card-foreground">
      {/* 🛠️ INTERNAL APP TOOLBAR */}
      <div className="h-14 border-b border-border/50 flex items-center justify-between px-6 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Box className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-sm">Hyper 3D Lab</h1>
            <p className="text-xs text-muted-foreground">AI Generation Pipeline Active</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileInput} 
            accept=".glb,.gltf,.jpg,.png,.jpeg" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={genStatus === 'processing'}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-sm disabled:opacity-50"
          >
            {genStatus === 'processing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            {genStatus === 'processing' ? 'Processing...' : 'Upload Image / 3D Model'}
          </button>
        </div>
      </div>

      {/* 🖼️ VIEWPORT AREA */}
      <div 
        className={`flex-1 relative transition-all duration-200 ${
          isDragging ? 'bg-primary/5 border-2 border-primary border-dashed m-4 rounded-xl' : ''
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {/* 1. STATE: Generating via AI */}
        {genStatus === 'processing' || isUploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
             <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
             <h2 className="text-xl font-semibold mb-2">
               {isUploading ? 'Uploading Image to MinIO...' : 'AI is sculpting your 3D Model...'}
             </h2>
             <p className="text-sm text-muted-foreground max-w-sm">
               Stable Fast 3D engine is running on GPU. This usually takes 3-5 seconds.
             </p>
          </div>
        ) : 
        /* 2. STATE: Empty Drop Zone */
        !activeModelUrl ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 mb-6 rounded-2xl bg-muted flex items-center justify-center border border-border">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Drop an Image to Generate 3D</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Drag a .png/.jpg file to use AI, or drop a .glb file to open the viewer.
            </p>
          </div>
        ) : (
        /* 3. STATE: 3D Render Ready */
          <div className="absolute inset-0">
            <CanvasStage modelUrl={activeModelUrl} />
            
            <div className="absolute bottom-6 right-6 flex gap-3">
              <button 
                className="px-4 py-2 bg-background/80 backdrop-blur-md border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors shadow-lg text-red-400"
                onClick={() => {
                  setActiveModelUrl(null);
                  setActiveFile(null);
                  setGenerationAssetId(null);
                }}
              >
                Clear Scene
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}