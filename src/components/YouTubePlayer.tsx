import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

export default function YouTubePlayer() {
  const { currentSong, isPlaying, volume, isMuted, setProgress, setDuration, nextSong } = useStore();
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressInterval = useRef<number | null>(null);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }

    function initPlayer() {
      if (!containerRef.current) return;
      
      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '100%',
        width: '100%',
        videoId: currentSong?.id || '',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          origin: window.location.origin,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (progressInterval.current) {
        window.clearInterval(progressInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (playerRef.current && playerRef.current.loadVideoById && currentSong) {
      playerRef.current.loadVideoById(currentSong.id);
    }
  }, [currentSong?.id]);

  useEffect(() => {
    if (!playerRef.current || !playerRef.current.playVideo) return;
    
    if (isPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!playerRef.current || !playerRef.current.setVolume) return;
    playerRef.current.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    if (!playerRef.current || !playerRef.current.mute) return;
    if (isMuted) {
      playerRef.current.mute();
    } else {
      playerRef.current.unMute();
    }
  }, [isMuted]);

  const onPlayerReady = (event: any) => {
    event.target.setVolume(volume);
    if (isMuted) event.target.mute();
    if (isPlaying) event.target.playVideo();
  };

  const onPlayerStateChange = (event: any) => {
    // YT.PlayerState.PLAYING = 1
    // YT.PlayerState.ENDED = 0
    if (event.data === 1) {
      setDuration(playerRef.current.getDuration());
      
      if (progressInterval.current) window.clearInterval(progressInterval.current);
      progressInterval.current = window.setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          setProgress(playerRef.current.getCurrentTime());
        }
      }, 500);
    } else if (event.data === 0) {
      nextSong();
    } else {
      if (progressInterval.current) window.clearInterval(progressInterval.current);
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-black z-0">
      <div 
        className="w-full h-full pointer-events-none"
        style={{ transform: 'scale(1.5)' }}
      >
        <div ref={containerRef} className="w-full h-full" />
      </div>
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
    </div>
  );
}
