'use client';
import { useEffect } from 'react';
import { ImagePreview } from './ImagePreview';
import { VideoPreview } from './VideoPreview';
import { AudioPreview } from './AudioPreview'; 
import { PdfPreview } from './PdfPreview';
import { DocPreview } from './DocPreview';
import { CsvPreview } from './CsvPreview';     // 🚀 NAYA
import { ZipPreview } from './ZipPreview';     // 🚀 NAYA
import { ThreeDPreview } from './ThreeDPreview'; // 🚀 NAYA
import { CodePreview } from './CodePreview';     // 🚀 NAYA
import { FallbackPreview } from './FallbackPreview';

interface UniversalPreviewProps {
  file: {
    url: string;
    name: string;
    mimeType: string;
    object_name?: string; 
    size?: number;          
    last_modified?: string; 
    [key: string]: any;     
  };
  isOpen: boolean;
  onClose: () => void;
}

export function UniversalPreview({ file, isOpen, onClose }: UniversalPreviewProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const renderContent = () => {
    const mime = file.mimeType.toLowerCase();
    const fileName = file.name.toLowerCase();

    // 🖼️ 1. IMAGE ENGINE
    if (mime.startsWith('image/')) {
      return <ImagePreview url={file.url} fileName={file.name} file={file} onClose={onClose} />;
    }
    
    // 🎬 2. VIDEO ENGINE
    if (mime.startsWith('video/')) {
      return <VideoPreview url={file.url} fileName={file.name} file={file} onClose={onClose} />;
    }

    // 🎵 3. AUDIO ENGINE
    if (mime.startsWith('audio/')) {
      return <AudioPreview url={file.url} fileName={file.name} file={file} onClose={onClose} />;
    }

    // 📄 4. PDF ENGINE
    if (mime === 'application/pdf') {
      return <PdfPreview url={file.url} fileName={file.name} file={file} onClose={onClose} />;
    }

    // 📝 5. DOCX ENGINE
    if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return <DocPreview url={file.url} fileName={file.name} file={file} onClose={onClose} />;
    }

    // 📊 6. CSV DATA MATRIX ENGINE
    if (mime === 'text/csv' || fileName.endsWith('.csv')) {
      return <CsvPreview url={file.url} fileName={file.name} file={file} onClose={onClose} />;
    }

    // 📦 7. ZIP ARCHIVE X-RAY ENGINE
    if (mime === 'application/zip' || mime === 'application/x-zip-compressed' || fileName.endsWith('.zip')) {
      return <ZipPreview url={file.url} fileName={file.name} file={file} onClose={onClose} />;
    }

    // 🧊 8. 3D HOLOGRAM ENGINE (.glb, .gltf)
    const is3DModel = mime === 'model/gltf-binary' || mime === 'model/gltf+json' || fileName.endsWith('.glb') || fileName.endsWith('.gltf');
    if (is3DModel) {
      return <ThreeDPreview url={file.url} fileName={file.name} file={file} onClose={onClose} />;
    }

    // 💻 9. CODE / HACKER-SPACE ENGINE (Fallback text detector)
    const textExtensions = ['.txt', '.json', '.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.md', '.css', '.html', '.env', '.sh', '.yaml', '.yml', '.xml', '.sql'];
    const isTextFile = mime.startsWith('text/') || mime === 'application/json' || textExtensions.some(ext => fileName.endsWith(ext));
    if (isTextFile) {
      return <CodePreview url={file.url} fileName={file.name} file={file} onClose={onClose} />;
    }

    // 📦 10. ULTRA-FALLBACK (For everything else like .exe, .dmg, etc.)
    return <FallbackPreview fileName={file.name} onClose={onClose} />;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md transition-all duration-300 opacity-100 animate-in fade-in">
      {renderContent()}
    </div>
  );
}