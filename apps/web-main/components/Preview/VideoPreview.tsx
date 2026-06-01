'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom'; // 🚀 FIX: Portal imported
import { PreviewHeader } from './PreviewHeader';
import Plyr from 'plyr';
import Hls from 'hls.js';
import 'plyr/dist/plyr.css';
import { api, API_URLS } from '@/lib/api'; 
import { Loader2, Settings2, Mic2, Subtitles, Sparkles, X } from 'lucide-react';

interface VideoPreviewProps {
  url: string;
  fileName: string;
  file?: any; 
  onClose: () => void;
}

export function VideoPreview({ url, fileName, file, onClose }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const playerRef = useRef<Plyr | null>(null);
  const timeRef = useRef<number>(0); 
  
  const [streamData, setStreamData] = useState({ streamUrl: '', captionsUrl: '' });
  const [status, setStatus] = useState<"LOADING" | "PROCESSING" | "READY" | "DIRECT">("LOADING");

  const [audioTracks, setAudioTracks] = useState<any[]>([]);
  const [currentAudio, setCurrentAudio] = useState<number>(0);
  const [subtitleTracks, setSubtitleTracks] = useState<any[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState<number>(-1);
  const [aiCaptionsActive, setAiCaptionsActive] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  const [plyrContainer, setPlyrContainer] = useState<HTMLElement | null>(null); // 🚀 FIX: Portal Target

  // ==========================================
  // 🧠 API HANDSHAKE
  // ==========================================
  useEffect(() => {
    let isMounted = true;
    let pollTimeoutId: NodeJS.Timeout;

    const checkStreamStatus = async () => {
      if (!isMounted) return;
      const isComplexVideo = fileName.toLowerCase().match(/\.(mkv|mp4|mov|webm)$/);
      
      if (!isComplexVideo || !file?.object_name) {
        setStreamData({ streamUrl: url, captionsUrl: '' });
        setStatus("DIRECT");
        return;
      }

      try {
        const res = await api.get(`${API_URLS.STORAGE}/storage/stream/info?object_key=${encodeURIComponent(file.object_name)}`);
        if (!isMounted) return;

        if (res.status === "READY") {
          setStreamData({
            streamUrl: res.stream_url,
            captionsUrl: `/api/captions?url=${encodeURIComponent(res.captions_url)}`
          });
          setStatus("READY");
        } else {
          setStreamData(prev => prev.streamUrl === url ? prev : { streamUrl: url, captionsUrl: '' });
          setStatus("PROCESSING");
          pollTimeoutId = setTimeout(checkStreamStatus, 5000); 
        }
      } catch (err) {
        if (!isMounted) return;
        setStreamData({ streamUrl: url, captionsUrl: '' });
        setStatus("DIRECT");
      }
    };

    checkStreamStatus();
    return () => { isMounted = false; clearTimeout(pollTimeoutId); };
  }, [url, fileName, file?.object_name]);

  // ==========================================
  // 🎬 MEDIA PLAYER ISOLATION CHAMBER
  // ==========================================
  useEffect(() => {
    if (!streamData.streamUrl) return; 
    
    const video = videoRef.current;
    if (!video) return;

    if (status === "READY" && streamData.captionsUrl) {
      const track = document.createElement('track');
      track.kind = 'captions';
      track.label = 'English (AI-Generated)';
      track.srclang = 'en';
      track.src = streamData.captionsUrl;
      video.appendChild(track);
    }

    const options = {
      controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen'],
      settings: ['speed'], // Removed quality from here to avoid duplicate logic
      autoplay: timeRef.current > 0, 
      muted: false, 
      clickToPlay: true,
    };

    let player: Plyr;

    if (streamData.streamUrl.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({ maxBufferLength: 30, enableWorker: false });
        hlsRef.current = hls;

        hls.loadSource(streamData.streamUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          player = new Plyr(video, options);
          playerRef.current = player;
          setPlyrContainer(player.elements.container); // 🚀 FIX: Save the container for the Portal
          
          if (timeRef.current > 0) {
              player.currentTime = timeRef.current;
              player.play();
          } else {
              player.on('play', () => { if (video.muted) video.muted = false; video.volume = 1.0; });
          }
        });

        hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (_, data) => setAudioTracks([...data.audioTracks]));
        hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (_, data) => setCurrentAudio(data.id));
        hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, (_, data) => setSubtitleTracks([...data.subtitleTracks]));
        hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, (_, data) => setCurrentSubtitle(data.id));

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        player = new Plyr(video, options);
        playerRef.current = player;
        setPlyrContainer(player.elements.container);
      }
    } else {
      video.src = streamData.streamUrl;
      player = new Plyr(video, options);
      playerRef.current = player;
      setPlyrContainer(player.elements.container);
      player.on('play', () => { if (video.muted) video.muted = false; video.volume = 1.0; });
    }

    const updateTime = () => { timeRef.current = video.currentTime; };
    video.addEventListener('timeupdate', updateTime);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
      if (player) { player.destroy(); playerRef.current = null; }
      if (video) { video.removeAttribute('src'); video.innerHTML = ''; video.load(); }
    };
  }, [streamData.streamUrl, status, streamData.captionsUrl]);

  // ==========================================
  // 🎛️ CUSTOM AUDIO & SUBTITLE CONTROLLERS
  // ==========================================
  const handleAudioSwitch = (trackId: number) => {
    if (hlsRef.current) { hlsRef.current.audioTrack = trackId; setCurrentAudio(trackId); }
  };

  const handleNativeSubtitleSwitch = (trackId: number) => {
    if (hlsRef.current) { hlsRef.current.subtitleTrack = trackId; setCurrentSubtitle(trackId); if (trackId !== -1) toggleAICaptions(false, false); }
  };

  const toggleAICaptions = (active: boolean, closeMenu: boolean = true) => {
    setAiCaptionsActive(active);
    if (active && hlsRef.current) { hlsRef.current.subtitleTrack = -1; setCurrentSubtitle(-1); }
    const video = videoRef.current;
    if (video && video.textTracks) {
      Array.from(video.textTracks).forEach(track => {
        if (track.label === 'English (AI-Generated)') track.mode = active ? 'showing' : 'hidden';
      });
    }
    if (closeMenu) setShowSettings(false);
  };

  useEffect(() => {
    if (status === "READY") setTimeout(() => toggleAICaptions(aiCaptionsActive, false), 800);
  }, [status, streamData.captionsUrl]);

  const formatAudioName = (track: any, index: number) => {
    let lang = track.language ? track.language.toUpperCase() : 'UNK';
    let baseName = track.name || '';
    if (baseName.toLowerCase().startsWith('audio_') || baseName === '' || lang === 'UNK') {
      return `Track ${index + 1} ${lang !== 'UNK' ? `(${lang})` : ''}`;
    }
    return baseName;
  };

  // 🚀 THE MAGIC: Hyper Sense UI that gets teleported inside Plyr!
  const hyperSensePortal = (
    <div className="hyper-sense-ui absolute top-4 right-4 md:top-8 md:right-8 z-[100] flex flex-col items-end transition-all duration-300">
       <button 
          onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }} 
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 shadow-2xl backdrop-blur-xl ${
            showSettings 
            ? "bg-white/10 border-white/20 text-white" 
            : "bg-black/40 border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:scale-105 active:scale-95"
          }`}
       >
          {showSettings ? <X className="w-4 h-4" /> : <Settings2 className="w-4 h-4" />}
          <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline-block">
            {showSettings ? 'Close Panel' : 'Hyper-Sense'}
          </span>
       </button>

       {showSettings && (
          <div 
             onClick={(e) => e.stopPropagation()} // Prevent clicking through to the video
             className="mt-3 bg-black/70 border border-white/10 backdrop-blur-2xl p-6 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-wrap gap-8 min-w-max animate-in slide-in-from-top-4 fade-in duration-300 origin-top-right max-w-[90vw] md:max-w-max"
          >
             {audioTracks.length > 0 && (
               <div className="flex flex-col gap-3 min-w-[140px]">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-1">
                     <Mic2 className="w-3.5 h-3.5 text-primary" />
                     <h3 className="text-white/60 text-[9px] font-black uppercase tracking-[0.15em]">Audio Stream</h3>
                  </div>
                  {audioTracks.map((track, i) => (
                     <button
                        key={`audio-${i}`}
                        onClick={() => handleAudioSwitch(i)}
                        className={`text-left text-xs px-4 py-2.5 rounded-xl font-medium transition duration-200 ${
                          currentAudio === i 
                          ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                          : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'
                        }`}
                     >
                        {formatAudioName(track, i)}
                     </button>
                  ))}
               </div>
             )}

             {subtitleTracks.length > 0 && (
               <div className="flex flex-col gap-3 min-w-[140px]">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-1">
                     <Subtitles className="w-3.5 h-3.5 text-emerald-400" />
                     <h3 className="text-white/60 text-[9px] font-black uppercase tracking-[0.15em]">Original Subs</h3>
                  </div>
                  <button
                     onClick={() => handleNativeSubtitleSwitch(-1)}
                     className={`text-left text-xs px-4 py-2.5 rounded-xl font-medium transition duration-200 ${
                       currentSubtitle === -1 
                       ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                       : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'
                     }`}
                  >
                     Disabled
                  </button>
                  {subtitleTracks.map((track, i) => (
                     <button
                        key={`sub-${i}`}
                        onClick={() => handleNativeSubtitleSwitch(i)}
                        className={`text-left text-xs px-4 py-2.5 rounded-xl font-medium transition duration-200 ${
                          currentSubtitle === i 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                          : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'
                        }`}
                     >
                        {track.name || `Sub ${i + 1} (${track.language || 'UNK'})`}
                     </button>
                  ))}
               </div>
             )}

             {streamData.captionsUrl && (
               <div className="flex flex-col gap-3 min-w-[160px]">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-1">
                     <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                     <h3 className="text-white/60 text-[9px] font-black uppercase tracking-[0.15em]">Neural Captions</h3>
                  </div>
                  <button
                     onClick={() => toggleAICaptions(false, false)}
                     className={`text-left text-xs px-4 py-2.5 rounded-xl font-medium transition duration-200 ${
                       !aiCaptionsActive 
                       ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                       : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'
                     }`}
                  >
                     Disabled
                  </button>
                  <button
                     onClick={() => toggleAICaptions(true, false)}
                     className={`text-left text-xs px-4 py-2.5 rounded-xl font-medium transition duration-200 ${
                       aiCaptionsActive 
                       ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                       : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'
                     }`}
                  >
                     English (Auto-Sync)
                  </button>
               </div>
             )}
          </div>
       )}
    </div>
  );

  return (
    <>
      <PreviewHeader fileName={fileName} onClose={onClose} />
      
      {/* 🚀 CSS OVERRIDES FOR FLOATING GLASS BOTTOM CONTROLS & SYNCED UI */}
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --plyr-color-main: #3b82f6; 
          --plyr-video-control-color-hover: #fff;
          --plyr-tooltip-background: rgba(0,0,0,0.8);
          --plyr-tooltip-color: #fff;
        }
        /* Floating Glass Bottom Controls */
        .plyr--video .plyr__controls {
          background: rgba(10, 10, 10, 0.5) !important;
          backdrop-filter: blur(24px) !important;
          -webkit-backdrop-filter: blur(24px) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 2rem !important;
          margin: 16px 24px 24px 24px !important;
          padding: 8px 16px !important;
          width: calc(100% - 48px) !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.6) !important;
          transition: transform 0.3s ease, opacity 0.3s ease !important;
        }
        /* Hide bottom shadow gradient */
        .plyr--video::after {
          display: none !important;
        }
        /* Sync our Custom Top Portal with Plyr's autohide feature */
        .plyr.plyr--hide-controls .hyper-sense-ui {
          opacity: 0;
          transform: translateY(-10px);
          pointer-events: none;
        }
        .plyr:not(.plyr--hide-controls) .hyper-sense-ui {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
      `}} />

      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8 overflow-hidden flex-col group">
        
        {status === "PROCESSING" && (
          <div className="absolute top-6 left-6 z-50 flex items-center gap-3 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-4">
             <div className="relative flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <div className="absolute inset-0 bg-primary/20 blur-md rounded-full"></div>
             </div>
             <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/90 font-black">
               Neural Sync Active
             </span>
          </div>
        )}

        <div className={`relative w-full max-w-6xl aspect-video rounded-[2.5rem] overflow-hidden bg-black/95 backdrop-blur-3xl shadow-[0_0_120px_rgba(0,0,0,0.5)] ring-1 ring-white/10 transition-all duration-1000 ${
          status === "LOADING" ? "opacity-0 scale-95 pointer-events-none absolute" : "opacity-100 scale-100"
        }`}>
          
          {/* 🚀 REACT PORTAL: Injects Hyper-Sense UI directly inside the video wrapper! */}
          {status === "READY" && plyrContainer && createPortal(hyperSensePortal, plyrContainer)}

          <video ref={videoRef} crossOrigin="anonymous" playsInline className="w-full h-full outline-none"></video>
          
        </div>
      </div>
    </>
  );
}