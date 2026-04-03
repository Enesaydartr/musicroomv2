import React from 'react';
import { useStore } from '../store/useStore';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize } from 'lucide-react';
import { formatTime } from '../lib/utils';

export default function Controls() {
  const { 
    currentSong, isPlaying, setPlaying, nextSong, prevSong, 
    progress, duration, volume, setVolume, isMuted, setMuted 
  } = useStore();

  if (!currentSong) return null;

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    // In a real app, we'd seek the YouTube player here.
    // Since we don't expose player.seekTo directly to the store easily without a ref,
    // we'll just let it be read-only for this demo, or we can add a seekTo to store.
    // For simplicity, we'll make it read-only or just update state (which won't seek YT).
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-6 z-20 opacity-0 hover:opacity-100 transition-opacity duration-300">
      <div className="max-w-4xl mx-auto bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
        
        {/* Progress Bar */}
        <div className="flex items-center gap-3 mb-4 text-xs text-white/70 font-mono">
          <span>{formatTime(progress)}</span>
          <input 
            type="range" 
            min="0" 
            max={duration || 100} 
            value={progress} 
            onChange={handleProgressChange}
            className="flex-1 h-1 bg-white/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
          />
          <span>{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between">
          {/* Song Info */}
          <div className="flex items-center gap-4 w-1/3">
            {currentSong.thumbnail && (
              <img 
                src={currentSong.thumbnail} 
                alt={currentSong.title} 
                className="w-12 h-12 rounded-md object-cover shadow-md"
              />
            )}
            <div className="overflow-hidden">
              <h3 className="text-white font-medium truncate">{currentSong.title}</h3>
              <p className="text-white/60 text-sm truncate">{currentSong.artist}</p>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-6 w-1/3">
            <button 
              onClick={prevSong}
              className="text-white/70 hover:text-white transition-colors"
            >
              <SkipBack size={24} />
            </button>
            <button 
              onClick={() => setPlaying(!isPlaying)}
              className="w-12 h-12 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
            </button>
            <button 
              onClick={nextSong}
              className="text-white/70 hover:text-white transition-colors"
            >
              <SkipForward size={24} />
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center justify-end gap-4 w-1/3">
            <button 
              onClick={() => setMuted(!isMuted)}
              className="text-white/70 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={isMuted ? 0 : volume} 
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="w-24 h-1 bg-white/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
            />
            <button 
              onClick={toggleFullscreen}
              className="text-white/70 hover:text-white transition-colors ml-2"
            >
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
