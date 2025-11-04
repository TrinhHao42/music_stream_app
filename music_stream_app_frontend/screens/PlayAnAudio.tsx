import { addSongToLibrary, addSongToPlaylist, getLibrary, getUserPlaylists } from '@/api/musicApi';
import { useAuth } from '@/contexts/AuthContext';
import { useMiniPlayer } from '@/contexts/MiniPlayerContext';
import Song from '@/types/Song';
import formatCompactNumber from '@/utils/FormatCompactNumber';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import Slider from '@react-native-community/slider';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, ImageBackground, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PlayAnAudio() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { 
    isMinimized, 
    setIsMinimized, 
    setCurrentSong, 
    currentSong,
    isPlaying, 
    position, 
    duration,
    playSound,
    pauseSound,
    seekTo,
    skipForward,
    skipBackward,
  } = useMiniPlayer();

  const [isLiked, setIsLiked] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [hasEnded, setHasEnded] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [playlistModalVisible, setPlaylistModalVisible] = useState(false);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  
  const { user } = useAuth();

  // Parse song from params với error handling
  if (!params.song) {
    // Redirect back if no song provided
    router.back();
    return null;
  }

  let song: Song;
  try {
    song = JSON.parse(params.song as string);
  } catch (error) {
    console.error('Error parsing song:', error);
    console.error('params.song:', params.song);
    router.back();
    return null;
  }

  // Helper function to format duration from seconds to MM:SS
  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Chuẩn bị dữ liệu từ song object
  const songData = {
    title: song.title,
    artist: Array.isArray(song.artist) ? song.artist.join(', ') : (song.artist || 'Unknown Artist'),
    url: song.audioUrl,
    image: song.coverUrl ? { uri: song.coverUrl } : require('../assets/images/Play an Audio/Image 58.png'),
    likes: formatCompactNumber(song.likes || 0),
    comments: '0',
    fullSong: song, // Lưu toàn bộ Song object
  };

  useEffect(() => {
    // Set current song when component mounts
    if (!currentSong || currentSong.url !== songData.url) {
      setCurrentSong(songData);
    }
  }, []);

  // Auto play when song is loaded and not already playing
  useEffect(() => {
    if (currentSong && duration > 0 && !isPlaying && !hasAutoPlayed) {
      playSound();
      setHasAutoPlayed(true);
    }
  }, [currentSong, duration, isPlaying, hasAutoPlayed]);

  // Update slider value when position changes (only if not dragging)
  useEffect(() => {
    if (!isDraggingSlider) {
      setSliderValue(position);
    }
    
    // Kiểm tra nếu audio đã kết thúc (position >= duration và duration > 0)
    if (duration > 0 && position >= duration - 100) { // -100ms để tránh lỗi rounding
      setHasEnded(true);
    } else if (hasEnded && position < duration - 1000) {
      setHasEnded(false);
    }
  }, [position, isDraggingSlider, duration, hasEnded]);

  // Expand when this screen is opened
  useEffect(() => {
    setIsMinimized(false);
  }, []);

  const handleMinimize = () => {
    setIsMinimized(true);
    router.back();
  };

  const togglePlayPause = async () => {
    if (isPlaying) {
      await pauseSound();
    } else {
      await playSound();
    }
  };

  const handleSkipForward = async () => {
    await skipForward(10);
  };

  const handleSkipBackward = async () => {
    await skipBackward(10);
  };

  const handleReplay = async () => {
    await seekTo(0);
    setHasEnded(false);
    await playSound();
  };

  const handleAddToLibrary = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login to add songs to library');
      return;
    }

    try {
      // Check if song already in library
      const library = await getLibrary(user.userId);
      if (library) {
        const alreadyInLibrary = library.favouriteSongs.some((s: Song) => s.songId === song.songId);
        
        if (alreadyInLibrary) {
          Alert.alert('Info', 'Song is already in your library');
          setMenuVisible(false);
          return;
        }
      }

      const success = await addSongToLibrary(user.userId, song.songId);
      if (success) {
        Alert.alert('Success', 'Song added to library');
        setMenuVisible(false);
      } else {
        Alert.alert('Error', 'Failed to add song to library');
      }
    } catch (error) {
      console.error('Error adding to library:', error);
      Alert.alert('Error', 'Failed to add song to library');
    }
  };

  const handleAddToPlaylistPress = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login to add songs to playlist');
      return;
    }

    setMenuVisible(false);
    setLoadingPlaylists(true);
    setPlaylistModalVisible(true);
    
    try {
      const userPlaylists = await getUserPlaylists(user.userId);
      setPlaylists(userPlaylists);
    } catch (error) {
      console.error('Error loading playlists:', error);
      Alert.alert('Error', 'Failed to load playlists');
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const handleSelectPlaylist = async (playlistId: string) => {
    setPlaylistModalVisible(false);
    
    try {
      const success = await addSongToPlaylist(playlistId, song.songId);
      if (success) {
        Alert.alert('Success', 'Song added to playlist');
      } else {
        Alert.alert('Error', 'Failed to add song to playlist');
      }
    } catch (error) {
      console.error('Error adding to playlist:', error);
      Alert.alert('Error', 'Failed to add song to playlist');
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getWaveformProgress = () => {
    if (duration === 0) return 0;
    return (position / duration) * 28; // 28 bars
  };

  return (
    <View style={styles.container}>
      {/* Background Image - Full Screen */}
      <ImageBackground 
        source={songData.image} 
        style={styles.backgroundImage}
        blurRadius={30}
      >
        {/* Overlay để làm tối background */}
        <View style={styles.overlay} />

        {/* Header với nút minimize */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleMinimize}>
            <Feather name="minimize-2" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Center Content */}
        <View style={styles.centerContent}>
          {/* Album Art */}
          <View style={styles.albumArtContainer}>
            <Image 
              source={songData.image} 
              style={styles.albumArt}
            />
          </View>

          {/* Song Info */}
          <View style={styles.songInfo}>
            <Text style={styles.songTitle}>{songData.title}</Text>
            <Text style={styles.songArtist}>{songData.artist}</Text>
          </View>

          {/* Waveform visualization */}
          <View style={styles.waveformContainer}>
            <View style={styles.waveform}>
              {[8, 15, 28, 40, 55, 70, 58, 45, 35, 42, 55, 68, 75, 60, 48, 35, 25, 18, 28, 40, 52, 65, 55, 42, 30, 20, 12, 8].map((height, index) => (
                <View
                  key={index}
                  style={[
                    styles.waveBar,
                    {
                      height,
                      backgroundColor: index < getWaveformProgress() ? '#fff' : 'rgba(255,255,255,0.3)',
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Progress Slider */}
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={isDraggingSlider ? sliderValue : position}
            onValueChange={(value) => {
              setIsDraggingSlider(true);
              setSliderValue(value);
            }}
            onSlidingStart={() => setIsDraggingSlider(true)}
            onSlidingComplete={(value) => {
              setIsDraggingSlider(false);
              if (duration > 0) {
                seekTo(value);
              }
            }}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="rgba(255,255,255,0.3)"
            thumbTintColor="#FFFFFF"
          />

          {/* Time */}
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomSection}>
          {/* Main Controls */}
          <View style={styles.controls}>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => setIsShuffle(!isShuffle)}
            >
              <Ionicons 
                name="shuffle" 
                size={24} 
                color={isShuffle ? '#1DB954' : '#fff'} 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.controlButton}
              onPress={handleSkipBackward}
            >
              <Ionicons name="play-back" size={32} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.playButton}
              onPress={hasEnded ? handleReplay : togglePlayPause}
            >
              {hasEnded ? (
                <AntDesign name="reload" size={36} color="#000" />
              ) : (
                <Ionicons 
                  name={isPlaying ? 'pause' : 'play'} 
                  size={36} 
                  color="#000" 
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.controlButton}
              onPress={handleSkipForward}
            >
              <Ionicons name="play-forward" size={32} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => setMenuVisible(true)}
            >
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
                color={isLiked ? '#FF1744' : '#fff'} 
              />
              <Text style={styles.socialText}>{songData.likes}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="chatbubble-outline" size={24} color="#fff" />
              <Text style={styles.socialText}>{songData.comments}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="share-social-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Modal */}
        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableOpacity 
            style={styles.menuOverlay}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          >
            <View style={styles.menuContent}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleAddToLibrary}
              >
                <Ionicons name="heart-outline" size={24} color="#11181C" />
                <Text style={styles.menuText}>Add to Library</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleAddToPlaylistPress}
              >
                <Ionicons name="add-circle-outline" size={24} color="#11181C" />
                <Text style={styles.menuText}>Add to Playlist</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, { borderBottomWidth: 0 }]}
                onPress={() => setMenuVisible(false)}
              >
                <Ionicons name="close-circle-outline" size={24} color="#E53935" />
                <Text style={[styles.menuText, { color: '#E53935' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Playlist Selection Modal */}
        <Modal
          visible={playlistModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setPlaylistModalVisible(false)}
        >
          <View style={styles.playlistModalOverlay}>
            <View style={styles.playlistModalContent}>
              <Text style={styles.playlistModalTitle}>Add to Playlist</Text>
              
              {loadingPlaylists ? (
                <ActivityIndicator size="large" color="#1ce5ff" />
              ) : (
                <FlatList
                  data={playlists}
                  keyExtractor={(item) => item.playlistId}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.playlistItem}
                      onPress={() => handleSelectPlaylist(item.playlistId)}
                    >
                      <Text style={styles.playlistItemName}>{item.playlistName}</Text>
                      <Text style={styles.playlistItemSongs}>{item.songs?.length || 0} songs</Text>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <Text style={styles.emptyPlaylistText}>No playlists found. Create one first!</Text>
                  }
                />
              )}
              
              <TouchableOpacity
                style={styles.closePlaylistBtn}
                onPress={() => setPlaylistModalVisible(false)}
              >
                <Text style={styles.closePlaylistBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  minimizeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 22,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    zIndex: 1,
  },
  albumArtContainer: {
    width: 280,
    height: 280,
    marginBottom: 30,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  albumArt: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  songInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  songTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  songArtist: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  waveformContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: 80,
    width: '100%',
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
  },
  slider: {
    width: '100%',
    height: 40,
    marginTop: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 40,
  },
  timeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  bottomSection: {
    paddingBottom: 40,
    zIndex: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 25,
  },
  controlButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 60,
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
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  menuContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E6E8EB',
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
  },
  playlistModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  playlistModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  playlistModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  playlistItem: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  playlistItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
  },
  playlistItemSongs: {
    fontSize: 13,
    color: '#687076',
    marginTop: 2,
  },
  emptyPlaylistText: {
    textAlign: 'center',
    color: '#687076',
    marginVertical: 20,
  },
  closePlaylistBtn: {
    marginTop: 16,
    backgroundColor: '#E6E8EB',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  closePlaylistBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
  },
});
