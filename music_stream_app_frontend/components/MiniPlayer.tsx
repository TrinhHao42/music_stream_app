import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMiniPlayer } from '../contexts/MiniPlayerContext';

export default function MiniPlayer() {
  const router = useRouter();
  const { 
    isMinimized, 
    setIsMinimized, 
    currentSong,
    isPlaying,
    playSound,
    pauseSound,
    position,
    duration,
    seekTo,
  } = useMiniPlayer();

  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);

  if (!isMinimized || !currentSong) {
    return null;
  }

  const handleExpand = () => {
    setIsMinimized(false);
    router.push({
      pathname: '/play-audio',
      params: {
        title: currentSong.title,
        artist: currentSong.artist,
      },
    });
  };

  const togglePlayPause = async (e: any) => {
    e.stopPropagation();
    if (isPlaying) {
      await pauseSound();
    } else {
      await playSound();
    }
  };

  return (
    <View style={[styles.container, { bottom: 90 }]}>
      {/* Progress bar - Draggable Slider */}
      <View style={styles.progressBarContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration || 1}
          value={isDraggingSlider ? sliderValue : position}
          onValueChange={(value) => {
            setSliderValue(value);
          }}
          onSlidingStart={() => {
            setIsDraggingSlider(true);
          }}
          onSlidingComplete={(value) => {
            seekTo(value);
            setIsDraggingSlider(false);
          }}
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
          thumbTintColor="transparent"
        />
      </View>

      <TouchableOpacity 
        style={styles.content} 
        onPress={handleExpand}
        activeOpacity={0.9}
      >
        <Image source={currentSong.image} style={styles.albumArt} />
        
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            Me • {currentSong.artist}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.iconButton}
          onPress={(e) => {
            e.stopPropagation();
            // Handle like action
          }}
        >
          <Ionicons name="heart-outline" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.iconButton}
          onPress={togglePlayPause}
        >
          <Ionicons 
            name={isPlaying ? 'pause' : 'play'} 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: '#333',
    zIndex: 1000,
  },
  progressBarContainer: {
    height: 20,
    backgroundColor: 'transparent',
    width: '100%',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  slider: {
    width: '100%',
    height: 20,
    margin: 0,
    padding: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 12,
  },
  albumArt: {
    width: 48,
    height: 48,
    borderRadius: 4,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  artist: {
    color: '#999',
    fontSize: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
