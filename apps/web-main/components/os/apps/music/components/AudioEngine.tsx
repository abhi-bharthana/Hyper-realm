'use client';

import React, { useEffect, useRef } from 'react';
import { useMusicStore } from '@/store/useMusicStore';

export const AudioEngine = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // 🚀 FIX: Fetching updateTime instead of the old setProgress
  const { currentTrack, isPlaying, volume, updateTime, nextTrack } = useMusicStore();

  // 🎵 Handle Play/Pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  // 🔊 Handle Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // ⏱️ Handle Time Update (Syncs exact seconds with Zustand)
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      // 🚀 Passing actual seconds to the store
      updateTime(current, duration);
    }
  };

  if (!currentTrack) return null;

  return (
    <audio
      id="hyper-audio-element" // 👈 Added ID for easy seeking from controls
      ref={audioRef}
      src={currentTrack.audioUrl}
      onTimeUpdate={handleTimeUpdate}
      onEnded={nextTrack}
      className="hidden"
    />
  );
};