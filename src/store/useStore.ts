import { create } from 'zustand';

export interface Song {
  id: string; // YouTube Video ID
  title: string;
  artist: string;
  duration?: number;
  thumbnail?: string;
}

interface PlayerState {
  currentSong: Song | null;
  playlist: Song[];
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  lyrics: { time: number; text: string }[];
  
  setCurrentSong: (song: Song) => void;
  addToPlaylist: (song: Song) => void;
  removeFromPlaylist: (id: string) => void;
  setPlaying: (isPlaying: boolean) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (isMuted: boolean) => void;
  setLyrics: (lyrics: { time: number; text: string }[]) => void;
  nextSong: () => void;
  prevSong: () => void;
}

export const useStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  playlist: [],
  isPlaying: false,
  progress: 0,
  duration: 0,
  volume: 100,
  isMuted: false,
  lyrics: [],

  setCurrentSong: (song) => {
    set({ currentSong: song, isPlaying: true, progress: 0, lyrics: [] });
    // Update Discord RPC if in electron
    if (window.electronAPI) {
      window.electronAPI.updateDiscordRPC({
        title: song.title,
        artist: song.artist,
        isPlaying: true,
      });
    }
  },
  
  addToPlaylist: (song) => set((state) => ({ playlist: [...state.playlist, song] })),
  
  removeFromPlaylist: (id) => set((state) => ({ 
    playlist: state.playlist.filter(s => s.id !== id) 
  })),
  
  setPlaying: (isPlaying) => {
    set({ isPlaying });
    const { currentSong } = get();
    if (window.electronAPI && currentSong) {
      window.electronAPI.updateDiscordRPC({
        title: currentSong.title,
        artist: currentSong.artist,
        isPlaying,
      });
    }
  },
  
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  setMuted: (isMuted) => set({ isMuted }),
  setLyrics: (lyrics) => set({ lyrics }),
  
  nextSong: () => {
    const { currentSong, playlist } = get();
    if (!currentSong || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
    if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
      get().setCurrentSong(playlist[currentIndex + 1]);
    } else if (playlist.length > 0) {
      get().setCurrentSong(playlist[0]);
    }
  },
  
  prevSong: () => {
    const { currentSong, playlist } = get();
    if (!currentSong || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
    if (currentIndex > 0) {
      get().setCurrentSong(playlist[currentIndex - 1]);
    } else if (playlist.length > 0) {
      get().setCurrentSong(playlist[playlist.length - 1]);
    }
  },
}));

// Add types for electronAPI
declare global {
  interface Window {
    electronAPI?: {
      windowMinimize: () => void;
      windowMaximize: () => void;
      windowClose: () => void;
      updateDiscordRPC: (data: { title: string; artist: string; isPlaying: boolean }) => void;
      storeGet: (key: string) => Promise<any>;
      storeSet: (key: string, value: any) => Promise<void>;
    };
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}
