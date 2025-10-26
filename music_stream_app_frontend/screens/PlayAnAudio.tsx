import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PlayAnAudio() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Dữ liệu mẫu (có thể thay bằng params từ navigation)
  const songData = {
    title: params.title || 'FLOWER',
    artist: params.artist || 'Jessica Gonzalez',
    duration: params.duration || '3:08',
    currentTime: '0:06',
    image: require('../assets/images/Play an Audio/Image 58.png'),
    likes: '12K',
    comments: '450',
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <View style={styles.container}>
      {/* Background Image - Full Screen */}
      <ImageBackground 
        source={songData.image} 
        style={styles.backgroundImage}
        blurRadius={20}
      >
        {/* Overlay để làm tối background */}
        <View style={styles.overlay} />

        {/* Header với nút back và minimize */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="chevron-down" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerText}>Play</Text>
          </View>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="chevron-down" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Song Info */}
        <View style={styles.songInfo}>
          <Text style={styles.songTitle}>{songData.title}</Text>
          <Text style={styles.songArtist}>{songData.artist}</Text>
        </View>

        {/* Waveform visualization */}
        <View style={styles.waveformContainer}>
          <View style={styles.waveform}>
            {[10, 25, 45, 60, 75, 55, 40, 30, 45, 60, 80, 50, 35, 20].map((height, index) => (
              <View
                key={index}
                style={[
                  styles.waveBar,
                  {
                    height,
                    backgroundColor: index < 2 ? '#fff' : 'rgba(255,255,255,0.3)',
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Time */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{songData.currentTime}</Text>
          <Text style={styles.timeText}>{songData.duration}</Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="shuffle" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="play-skip-back" size={32} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.playButton}
            onPress={() => setIsPlaying(!isPlaying)}
          >
            <Ionicons 
              name={isPlaying ? 'pause' : 'play'} 
              size={40} 
              color="#000" 
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="play-skip-forward" size={32} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Social interactions */}
        <View style={styles.socialContainer}>
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => setIsLiked(!isLiked)}
          >
            <Ionicons 
              name={isLiked ? 'heart' : 'heart-outline'} 
              size={24} 
              color="#fff" 
            />
            <Text style={styles.socialText}>{songData.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="chatbubble-outline" size={24} color="#fff" />
            <Text style={styles.socialText}>{songData.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="share-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    zIndex: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  songInfo: {
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: 1,
  },
  songTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  songArtist: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
  },
  waveformContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: 1,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 60,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    zIndex: 1,
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 20,
    zIndex: 1,
  },
  controlButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#000',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingVertical: 30,
    zIndex: 1,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  socialText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
