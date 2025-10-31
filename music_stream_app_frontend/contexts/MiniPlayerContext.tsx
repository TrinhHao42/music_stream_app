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

  // Load sound when song changes
  useEffect(() => {
    if (currentSong?.url) {
      player.replace(currentSong.url);
    }
  }, [currentSong?.url]);

  const playSound = async () => {
    player.play();
  };

  const pauseSound = async () => {
    player.pause();
  };

  const stopSound = async () => {
    player.pause();
    player.seekTo(0);
  };

  const seekTo = async (positionMillis: number) => {
    const positionSeconds = positionMillis / 1000;
    player.seekTo(positionSeconds);
  };

  const skipForward = async (seconds: number = 10) => {
    const newPosition = Math.min((position / 1000) + seconds, duration / 1000);
    player.seekTo(newPosition);
  };

  const skipBackward = async (seconds: number = 10) => {
    const newPosition = Math.max((position / 1000) - seconds, 0);
    player.seekTo(newPosition);
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
