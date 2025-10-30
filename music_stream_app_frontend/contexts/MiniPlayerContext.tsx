import { Audio } from 'expo-av';
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
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  // Setup audio mode
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });
  }, []);

  // Load sound when song changes
  useEffect(() => {
    if (currentSong?.url) {
      loadSound();
    }
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [currentSong?.url]);

  const loadSound = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: currentSong.url },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      
      setSound(newSound);
    } catch (error) {
      console.error('Error loading sound:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      
      // Auto stop when finished
      if (status.didJustFinish) {
        setIsPlaying(false);
      }
    }
  };

  const playSound = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const pauseSound = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      setPosition(0);
    }
  };

  const seekTo = async (positionMillis: number) => {
    if (sound) {
      await sound.setPositionAsync(positionMillis);
    }
  };

  const skipForward = async (seconds: number = 10) => {
    if (sound) {
      const newPosition = Math.min(position + seconds * 1000, duration);
      await sound.setPositionAsync(newPosition);
    }
  };

  const skipBackward = async (seconds: number = 10) => {
    if (sound) {
      const newPosition = Math.max(position - seconds * 1000, 0);
      await sound.setPositionAsync(newPosition);
    }
  };

  return (
    <MiniPlayerContext.Provider 
      value={{ 
        isMinimized, 
        setIsMinimized, 
        currentSong, 
        setCurrentSong,
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
