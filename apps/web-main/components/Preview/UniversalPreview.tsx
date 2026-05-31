'use client';
import { useEffect } from 'react';
import { ImagePreview } from './ImagePreview';
import { VideoPreview } from './VideoPreview';
import { FallbackPreview } from './FallbackPreview';

interface UniversalPreviewProps {
  file: {
    url: string;
    name: string;
    mimeType: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function UniversalPreview({ file, isOpen, onClose }: UniversalPreviewProps) {
  // Prevent scrolling on background when preview is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const renderContent = () => {
    if (file.mimeType.startsWith('image/')) {
      return <ImagePreview url={file.url} fileName={file.name} onClose={onClose} />;
    }
    
    if (file.mimeType.startsWith('video/')) {
      return <VideoPreview url={file.url} fileName={file.name} onClose={onClose} />;
    }

    // Add PDF handling here later
    // if (file.mimeType === 'application/pdf') ...

    return <FallbackPreview fileName={file.name} onClose={onClose} />;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md transition-all duration-300 opacity-100 animate-in fade-in">
      {renderContent()}
    </div>
  );
}