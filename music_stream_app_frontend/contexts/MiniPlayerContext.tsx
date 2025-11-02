import Song from '@/types/Song';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface MiniPlayerContextType {
  isMinimized: boolean;
  setIsMinimized: (value: boolean) => void;
  currentSong: {
    title: string;
    artist: string;
    image: any;
    url: string;
    fullSong?: Song; // Lưu toàn bộ Song object
  } | null;
  setCurrentSong: (song: any) => void;
  closeMiniPlayer: () => Promise<void>;
  // Audio controls
  isPlaying: boolean;
  position: number;
  duration: number;
  playSound: () => Promise<void>;
  pauseSound: () => Promise<void>;
  stopSound: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  skipForward: (seconds: number) => Promise<void>;
  skipBackward: (seconds: number) => Promise<void>;
}

const MiniPlayerContext = createContext<MiniPlayerContextType>({
  isMinimized: false,
  setIsMinimized: () => {},
  currentSong: null,
  setCurrentSong: () => {},
  closeMiniPlayer: async () => {},
  isPlaying: false,
  position: 0,
  duration: 0,
  playSound: async () => {},
  pauseSound: async () => {},
  stopSound: async () => {},
  seekTo: async () => {},
  skipForward: async () => {},
  skipBackward: async () => {},
});

export const useMiniPlayer = () => useContext(MiniPlayerContext);

export const MiniPlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentSong, setCurrentSong] = useState<any>(null);
  const player = useAudioPlayer(currentSong?.url || '');
  const status = useAudioPlayerStatus(player);
  
  const isPlaying = status.playing;
  const position = status.currentTime * 1000; // Convert to milliseconds
  const duration = status.duration * 1000; // Convert to milliseconds

  // Load sound when song changes
  useEffect(() => {
    if (currentSong?.url) {
      player.replace(currentSong.url);
    }
  }, [currentSong?.url]);

  const playSound = async () => {
    try {
      player.play();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const pauseSound = async () => {
    try {
      player.pause();
    } catch (error) {
      console.error('Error pausing sound:', error);
    }
  };

  const stopSound = async () => {
    try {
      if (player && status.isLoaded) {
        player.pause();
        if (status.duration > 0) {
          player.currentTime = 0;
        }
      }
    } catch (error) {
      console.error('Error stopping sound:', error);
    }
  };

  const seekTo = async (positionMillis: number) => {
    try {
      if (player && status.isLoaded && status.duration > 0) {
        const positionSeconds = positionMillis / 1000;
        // Clamp position to valid range
        const clampedPosition = Math.max(0, Math.min(positionSeconds, status.duration));
        player.currentTime = clampedPosition;
      }
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const skipForward = async (seconds: number = 10) => {
    try {
      if (player && status.isLoaded && status.duration > 0) {
        const newPosition = Math.min(status.currentTime + seconds, status.duration);
        player.currentTime = newPosition;
      }
    } catch (error) {
      console.error('Error skipping forward:', error);
    }
  };

  const skipBackward = async (seconds: number = 10) => {
    try {
      if (player && status.isLoaded && status.duration > 0) {
        const newPosition = Math.max(status.currentTime - seconds, 0);
        player.currentTime = newPosition;
      }
    } catch (error) {
      console.error('Error skipping backward:', error);
    }
  };

  const closeMiniPlayer = async () => {
    await stopSound();
    setIsMinimized(false);
    setCurrentSong(null);
  };

  return (
    <MiniPlayerContext.Provider 
      value={{ 
        isMinimized, 
        setIsMinimized, 
        currentSong, 
        setCurrentSong,
        closeMiniPlayer,
        isPlaying,
        position,
        duration,
        playSound,
        pauseSound,
        stopSound,
        seekTo,
        skipForward,
        skipBackward,
      }}
    >
      {children}
    </MiniPlayerContext.Provider>
  );
};
