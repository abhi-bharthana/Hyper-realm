'use client';

import { useEffect, useRef, useState } from 'react';
import { PreviewHeader } from './PreviewHeader';
import Plyr from 'plyr';
import Hls from 'hls.js';
import 'plyr/dist/plyr.css';
import { api } from '@/lib/api'; // Tera custom API wrapper

interface VideoPreviewProps {
  url: string;
  fileName: string;
  file?: any; // Pura file object pass kar dena pichle component se
  onClose: () => void;
}

export function VideoPreview({ url, fileName, file, onClose }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [captionsUrl, setCaptionsUrl] = useState<string>('');
  const [status, setStatus] = useState<"LOADING" | "PROCESSING" | "READY" | "DIRECT">("LOADING");

  useEffect(() => {
    const checkStreamStatus = async () => {
      const isComplexVideo = fileName.toLowerCase().match(/\.(mkv|mp4|mov|webm)$/);
      
      // Agar simple video hai or backend key nahi hai, direct play karo
      if (!isComplexVideo || !file?.object_name) {
        setStreamUrl(url);
        setStatus("DIRECT");
        return;
      }

      try {
        const res = await api.get(`/api/v1/storage/stream/info?object_key=${encodeURIComponent(file.object_name)}`);
        
        if (res.status === "READY") {
          setStreamUrl(res.stream_url);
          setCaptionsUrl(res.captions_url);
          setStatus("READY");
        } else {
          setStatus("PROCESSING");
          // Optionally: Yaha set interval laga sakte ho har 10 sec me check karne ke liye
        }
      } catch (err) {
        // Fallback to direct raw url on API fail
        setStreamUrl(url);
        setStatus("DIRECT");
      }
    };

    checkStreamStatus();
  }, [url, fileName, file?.object_name]);

  // Player Injector
  useEffect(() => {
    if (status === "LOADING" || status === "PROCESSING") return;
    
    const video = videoRef.current;
    if (!video) return;

    let player: Plyr;
    let hls: Hls;

    const options = {
      controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
      settings: ['captions', 'quality', 'speed'],
      captions: { active: true, update: true, language: 'en' }, // 🚀 Captions Auto-Enable
      autoplay: true,
      theme: '#3b82f6',
    };

    if (streamUrl.includes('.m3u8')) {
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          player = new Plyr(video, options);
        });
      }
    } else {
      player = new Plyr(video, options);
    }

    return () => {
      if (hls) hls.destroy();
      if (player) player.destroy();
    };
  }, [streamUrl, status]);

  return (
    <>
      <PreviewHeader fileName={fileName} onClose={onClose} />
      
      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12 overflow-hidden flex-col">
        
        {status === "PROCESSING" && (
          <div className="flex flex-col items-center justify-center gap-4 bg-black/50 backdrop-blur-md p-10 rounded-3xl border border-white/10 z-50">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white font-mono text-xs tracking-widest uppercase">
              Neural Engine is processing HLS & AI Captions...
            </p>
          </div>
        )}

        <div className={`relative w-full max-w-5xl rounded-2xl overflow-hidden bg-black/80 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-opacity duration-500 ${status === "PROCESSING" ? "opacity-0 hidden" : "opacity-100"}`}>
          
          <video ref={videoRef} crossOrigin="anonymous" playsInline className="w-full h-full outline-none">
             {/* Fallback load for raw mp4s */}
             {status === "DIRECT" && <source src={streamUrl} type="video/mp4" />}
             
             {/* 🚀 THE MAGIC: AI AUTO-CAPTIONS TRACK */}
             {status === "READY" && captionsUrl && (
               <track kind="captions" label="English (Auto-AI)" srcLang="en" src={captionsUrl} default />
             )}
          </video>
          
        </div>
      </div>
    </>
  );
}