import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function LyricsOverlay() {
  const { currentSong, progress, lyrics, setLyrics } = useStore();
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);

  useEffect(() => {
    if (!currentSong) return;

    const fetchLyrics = async () => {
      try {
        const query = encodeURIComponent(`${currentSong.artist} ${currentSong.title}`);
        const res = await fetch(`https://lrclib.net/api/get?track_name=${encodeURIComponent(currentSong.title)}&artist_name=${encodeURIComponent(currentSong.artist)}`);
        
        if (!res.ok) {
          // Fallback search if exact match fails
          const searchRes = await fetch(`https://lrclib.net/api/search?q=${query}`);
          if (searchRes.ok) {
            const data = await searchRes.json();
            if (data && data.length > 0 && data[0].syncedLyrics) {
              parseAndSetLyrics(data[0].syncedLyrics);
              return;
            }
          }
          setLyrics([]);
          return;
        }

        const data = await res.json();
        if (data.syncedLyrics) {
          parseAndSetLyrics(data.syncedLyrics);
        } else {
          setLyrics([]);
        }
      } catch (error) {
        console.error('Failed to fetch lyrics:', error);
        setLyrics([]);
      }
    };

    fetchLyrics();
  }, [currentSong?.id]);

  const parseAndSetLyrics = (lrc: string) => {
    const lines = lrc.split('\n');
    const parsed = lines.map(line => {
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const milliseconds = parseInt(match[3], 10);
        const time = minutes * 60 + seconds + milliseconds / (match[3].length === 3 ? 1000 : 100);
        return { time, text: match[4].trim() };
      }
      return null;
    }).filter((l): l is {time: number, text: string} => l !== null && l.text !== '');
    
    setLyrics(parsed);
  };

  useEffect(() => {
    if (lyrics.length === 0) {
      setCurrentLineIndex(-1);
      return;
    }

    // Find the current line based on progress
    let index = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (progress >= lyrics[i].time) {
        index = i;
      } else {
        break;
      }
    }
    setCurrentLineIndex(index);
  }, [progress, lyrics]);

  if (!currentSong || lyrics.length === 0 || currentLineIndex === -1) return null;

  const currentLine = lyrics[currentLineIndex]?.text;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 px-12">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentLineIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <h1 
            className="text-5xl md:text-7xl font-bold text-white tracking-tight"
            style={{ 
              textShadow: '0 0 20px rgba(255,255,255,0.5), 0 4px 8px rgba(0,0,0,0.8)' 
            }}
          >
            {currentLine}
          </h1>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
