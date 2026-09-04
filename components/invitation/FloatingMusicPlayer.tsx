'use client';

import React, { useState, useRef } from 'react';
import { Music, VolumeX } from 'lucide-react';

interface Props {
  musicUrl: string;
}

export default function FloatingMusicPlayer({ musicUrl }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log('Audio playback prevented by browser:', err));
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <audio ref={audioRef} loop preload="none">
        <source src={musicUrl} type="audio/mpeg" />
      </audio>

      <button
        onClick={togglePlay}
        aria-label={isPlaying ? 'Tạm dừng nhạc nền' : 'Phát nhạc nền'}
        className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-depth-md cursor-pointer border ${
          isPlaying
            ? 'bg-[#1F1B1C] text-white border-[#B76E79]/50 ring-4 ring-[#B76E79]/20'
            : 'bg-white/90 text-[#756B70] hover:text-[#1F1B1C] border-[#EAE4DF] hover:bg-white'
        }`}
      >
        <div
          className={`w-full h-full rounded-full flex items-center justify-center ${
            isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''
          }`}
        >
          {isPlaying ? (
            <Music className="w-5 h-5 text-[#E85B6A]" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </div>

        {/* Tooltip */}
        <span className="absolute bottom-full right-0 mb-2 px-2.5 py-1 rounded-lg bg-black/80 text-white text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-sm">
          {isPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
        </span>
      </button>
    </div>
  );
}
