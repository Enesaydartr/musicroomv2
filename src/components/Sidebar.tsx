import React, { useState, useEffect } from 'react';
import { useStore, Song } from '../store/useStore';
import { Search, Plus, Play, Trash2, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const { playlist, currentSong, setCurrentSong, addToPlaylist, removeFromPlaylist } = useStore();

  // Load playlist from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('enestify-playlist');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.forEach((song: Song) => addToPlaylist(song));
      } catch (e) {
        console.error('Failed to parse playlist', e);
      }
    }
  }, []);

  // Save playlist to localStorage on change
  useEffect(() => {
    localStorage.setItem('enestify-playlist', JSON.stringify(playlist));
  }, [playlist]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      if (!apiKey || apiKey === 'YOUR_YOUTUBE_API_KEY') {
        // Mock results if no API key
        setSearchResults([
          { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', artist: 'Rick Astley', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/default.jpg' },
          { id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', artist: 'Queen', thumbnail: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/default.jpg' },
          { id: 'kJQP7kiw5Fk', title: 'Despacito', artist: 'Luis Fonsi', thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/default.jpg' },
        ]);
        setIsSearching(false);
        return;
      }

      const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(searchQuery)}&type=video&videoCategoryId=10&key=${apiKey}`);
      const data = await res.json();
      
      if (data.items) {
        const results: Song[] = data.items.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
          artist: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails.default.url,
        }));
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-12 left-6 z-30 p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={cn(
        "absolute top-0 left-0 bottom-0 w-80 bg-black/80 backdrop-blur-2xl border-r border-white/10 z-20 flex flex-col transition-transform duration-300 ease-in-out pt-24",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        
        {/* Search */}
        <div className="p-6 border-b border-white/10">
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text" 
              placeholder="Şarkı veya sanatçı ara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder:text-white/50 focus:outline-none focus:border-white/50 transition-colors"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
          </form>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="p-4">
              <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3 px-2">Sonuçlar</h3>
              <div className="space-y-1">
                {searchResults.map(song => (
                  <div key={`search-${song.id}`} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <img src={song.thumbnail} alt="" className="w-10 h-10 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{song.title}</p>
                      <p className="text-white/50 text-xs truncate">{song.artist}</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                      <button onClick={() => setCurrentSong(song)} className="p-1.5 text-white hover:bg-white/20 rounded-md">
                        <Play size={16} />
                      </button>
                      <button onClick={() => addToPlaylist(song)} className="p-1.5 text-white hover:bg-white/20 rounded-md">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Playlist */}
          <div className="p-4">
            <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3 px-2">Çalma Listesi</h3>
            {playlist.length === 0 ? (
              <p className="text-white/30 text-sm px-2">Listeniz boş. Arama yaparak şarkı ekleyin.</p>
            ) : (
              <div className="space-y-1">
                {playlist.map((song, idx) => (
                  <div 
                    key={`playlist-${song.id}-${idx}`} 
                    className={cn(
                      "group flex items-center gap-3 p-2 rounded-lg transition-colors",
                      currentSong?.id === song.id ? "bg-white/20" : "hover:bg-white/10"
                    )}
                  >
                    <img src={song.thumbnail} alt="" className="w-10 h-10 rounded object-cover" />
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setCurrentSong(song)}>
                      <p className={cn("text-sm truncate", currentSong?.id === song.id ? "text-white font-medium" : "text-white/80")}>
                        {song.title}
                      </p>
                      <p className="text-white/50 text-xs truncate">{song.artist}</p>
                    </div>
                    <button 
                      onClick={() => removeFromPlaylist(song.id)} 
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:bg-white/20 rounded-md transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
