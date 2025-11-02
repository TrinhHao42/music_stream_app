import { getAlbumById, getSongByName } from '@/api/musicApi';
import { Album } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const AlbumDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlbum = async () => {
      if (!params.albumId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const albumData = await getAlbumById(params.albumId as string);
        setAlbum(albumData);
      } catch (error) {
        console.error('Error fetching album:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbum();
  }, [params.albumId]);

  const handleSongPress = async (songTitle: string) => {
    try {
      const song = await getSongByName(songTitle);
      if (song) {
        router.push({
          pathname: '/play-audio',
          params: {
            song: JSON.stringify(song),
          },
        } as never);
      }
    } catch (error) {
      console.error('Error fetching song:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </View>
    );
  }

  if (!album) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#fff' }}>Album not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with gradient background */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Album Cover */}
        <View style={styles.albumCoverContainer}>
          <Image 
            source={album.image ? { uri: album.image } : require('@/assets/images/My Library/Image 101.png')}
            style={styles.albumCover}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
        </View>

        {/* Album Info */}
        <View style={styles.albumInfo}>
          <Text style={styles.albumTitle}>{album.albumName}</Text>
          
          <View style={styles.artistContainer}>
            <Text style={styles.artistName}>{album.artists.join(', ')}</Text>
          </View>

          <Text style={styles.albumMeta}>
            Album • {album.release}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={32} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={() => setIsDownloaded(!isDownloaded)}
          >
            <Ionicons 
              name={isDownloaded ? "arrow-down-circle" : "arrow-down-circle-outline"} 
              size={32} 
              color="#fff" 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-vertical" size={28} color="#fff" />
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          <TouchableOpacity 
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Ionicons name="sparkles" size={28} color="#1DB954" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.playButton}
            activeOpacity={0.8}
          >
            <Ionicons name="play" size={32} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Songs List */}
        <View style={styles.songsList}>
          {album.songs.map((song, index) => (
            <TouchableOpacity
              key={song.songId || index}
              style={styles.songItem}
              activeOpacity={0.7}
              onPress={() => handleSongPress(song.title)}
            >
              <View style={styles.songInfo}>
                <Text style={styles.songTitle} numberOfLines={1}>
                  {song.title}
                </Text>
                <Text style={styles.songArtist} numberOfLines={1}>
                  {album.artists.join(', ')}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.songMenuButton}
                activeOpacity={0.7}
              >
                <Ionicons name="ellipsis-vertical" size={20} color="#999" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom spacing for mini player */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5B8A8F',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingTop: 80,
  },
  albumCoverContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  albumCover: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  albumInfo: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  albumTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  artistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  artistImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  artistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  albumMeta: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 16,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  songsList: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    minHeight: 400,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 12,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  songMenuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AlbumDetailsScreen;
