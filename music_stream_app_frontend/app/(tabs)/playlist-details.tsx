import { getPlaylistById, getSongById, removeSongFromPlaylist } from '@/api/musicApi';
import { useAuth } from '@/contexts/AuthContext';
import Song from '@/types/Song';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Playlist = {
  playlistId: string;
  playlistName: string;
  userId: string;
  songs: string[];
};

const PlaylistDetailsLibraryScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ playlistId: string }>();
  const { user } = useAuth();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSongId, setLoadingSongId] = useState<string | null>(null);

  useEffect(() => {
    if (params.playlistId) {
      loadPlaylistAndSongs(params.playlistId);
    }
  }, [params.playlistId]);

  const loadPlaylistAndSongs = async (playlistId: string) => {
    setLoading(true);
    try {
      // Fetch full playlist data from backend
      const fullPlaylist = await getPlaylistById(playlistId);
      
      if (!fullPlaylist) {
        Alert.alert('Error', 'Playlist not found');
        router.back();
        return;
      }

      setPlaylist(fullPlaylist);
      
      if (fullPlaylist.songs && fullPlaylist.songs.length > 0) {
        // Fetch all songs
        const songPromises = fullPlaylist.songs.map((songId: string) => getSongById(songId));
        const fetchedSongs = await Promise.all(songPromises);
        setSongs(fetchedSongs.filter((s): s is Song => s !== null));
      } else {
        setSongs([]);
      }
    } catch (error) {
      console.error('Error loading playlist:', error);
      Alert.alert('Error', 'Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSong = async (songId: string) => {
    if (!playlist || !user) return;

    Alert.alert(
      'Remove Song',
      'Remove this song from playlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setLoadingSongId(songId);
            try {
              const success = await removeSongFromPlaylist(playlist.playlistId, songId);
              if (success) {
                setSongs((prevSongs) => prevSongs.filter((s) => s.songId !== songId));
                Alert.alert('Success', 'Song removed from playlist');
              } else {
                Alert.alert('Error', 'Failed to remove song');
              }
            } catch (error) {
              console.error('Error removing song:', error);
              Alert.alert('Error', 'Failed to remove song');
            } finally {
              setLoadingSongId(null);
            }
          },
        },
      ]
    );
  };

  const handleSongPress = (song: Song) => {
    router.push({
      pathname: '/song-details',
      params: { song: JSON.stringify(song) },
    } as never);
  };

  if (!playlist) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1ce5ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Playlist</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Playlist Info */}
      <View style={styles.playlistInfo}>
        <View style={styles.playlistIcon}>
          <Ionicons name="musical-notes" size={40} color="#fff" />
        </View>
        <Text style={styles.playlistName}>{playlist.playlistName}</Text>
        <Text style={styles.songCount}>{songs.length} songs</Text>
      </View>

      {/* Songs List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1ce5ff" />
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.songId}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.songItem}>
              <TouchableOpacity
                style={styles.songContent}
                onPress={() => handleSongPress(item)}
              >
                <Image
                  source={{ uri: item.coverUrl }}
                  style={styles.songImage}
                  contentFit="cover"
                />
                <View style={styles.songInfo}>
                  <Text style={styles.songTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.songArtist} numberOfLines={1}>
                    {Array.isArray(item.artist) ? item.artist.join(', ') : item.artist}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleRemoveSong(item.songId)}
                style={styles.removeBtn}
                disabled={loadingSongId === item.songId}
              >
                {loadingSongId === item.songId ? (
                  <ActivityIndicator size="small" color="#E53935" />
                ) : (
                  <Ionicons name="trash-outline" size={20} color="#E53935" />
                )}
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="musical-notes-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No songs in this playlist</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  playlistInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  playlistIcon: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#1ce5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  playlistName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  songCount: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  songContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  songImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 14,
    color: '#666',
  },
  removeBtn: {
    padding: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});

export default PlaylistDetailsLibraryScreen;
