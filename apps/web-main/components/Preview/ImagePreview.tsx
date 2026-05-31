'use client';
import { useState } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { PreviewHeader } from './PreviewHeader';

interface ImagePreviewProps {
  url: string;
  fileName: string;
  onClose: () => void;
}

export function ImagePreview({ url, fileName, onClose }: ImagePreviewProps) {
  const [zoom, setZoom] = useState(1);

  const imageControls = (
    <>
      <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full">
        <ZoomOut className="w-5 h-5" />
      </button>
      <span className="text-xs text-gray-400 font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
      <button onClick={() => setZoom(z => Math.min(z + 0.25, 3))} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full">
        <ZoomIn className="w-5 h-5" />
      </button>
    </>
  );

  return (
    <>
      <PreviewHeader fileName={fileName} onClose={onClose} rightControls={imageControls} />
      
      <div className="relative w-full h-full flex items-center justify-center p-12 overflow-hidden">
        <div style={{ transform: `scale(${zoom})` }} className="transition-transform duration-200 ease-out">
          <img 
            src={url} 
            alt={fileName}
            className="max-w-full max-h-[85vh] object-contain drop-shadow-2xl rounded-lg"
            draggable={false}
          />
        </div>
      </div>
    </>
  );
}