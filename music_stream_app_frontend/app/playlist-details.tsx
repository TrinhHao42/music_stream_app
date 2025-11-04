import { getPlaylistById, getSongById, removeSongFromPlaylist } from '@/api/musicApi';
import CartSongItem from '@/components/CartSongItem';
import { useAuth } from '@/contexts/AuthContext';
import { Song } from '@/types';
import { Ionicons } from '@expo/vector-icons';
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

const PlaylistDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ playlistId: string }>();
  const { user } = useAuth();

  const [playlist, setPlaylist] = useState<any>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPlaylist();
  }, [params.playlistId]);

  const loadPlaylist = async () => {
    if (!params.playlistId) {
      Alert.alert('Error', 'Playlist not found');
      router.back();
      return;
    }

    setLoading(true);
    try {
      const playlistData = await getPlaylistById(params.playlistId);
      
      if (playlistData) {
        setPlaylist(playlistData);

        // Fetch all songs
        if (playlistData.songs && playlistData.songs.length > 0) {
          const songPromises = playlistData.songs.map((songId: string) => getSongById(songId));
          const fetchedSongs = await Promise.all(songPromises);
          setSongs(fetchedSongs.filter(s => s !== null) as Song[]);
        } else {
          setSongs([]);
        }
      }
    } catch (error) {
      console.error('Error loading playlist:', error);
      Alert.alert('Error', 'Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPlaylist();
    setRefreshing(false);
  };

  const handleRemoveSong = async (songId: string) => {
    if (!playlist) return;

    try {
      const success = await removeSongFromPlaylist(playlist.playlistId, songId);
      if (success) {
        Alert.alert('Success', 'Song removed from playlist');
        await loadPlaylist();
      } else {
        Alert.alert('Error', 'Failed to remove song');
      }
    } catch (error) {
      console.error('Error removing song:', error);
      Alert.alert('Error', 'Failed to remove song');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1ce5ff" />
        </View>
      </View>
    );
  }

  if (!playlist) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Playlist not found</Text>
        </View>
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
        <Text style={styles.playlistName}>{playlist.playlistName}</Text>
        <Text style={styles.playlistMeta}>
          {songs.length} {songs.length === 1 ? 'song' : 'songs'}
        </Text>
      </View>

      {/* Songs List */}
      <FlatList
        data={songs}
        renderItem={({ item }) => (
          <View style={styles.songItemContainer}>
            <View style={{ flex: 1 }}>
              <CartSongItem
                song={item}
                showAddToPlaylist={false}
                showDownloaded={user !== null}
              />
            </View>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Remove Song',
                  `Remove "${item.title}" from this playlist?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Remove',
                      style: 'destructive',
                      onPress: () => handleRemoveSong(item.songId),
                    },
                  ]
                );
              }}
              style={styles.removeBtn}
            >
              <Ionicons name="trash-outline" size={20} color="#E53935" />
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.songId}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No songs in this playlist yet</Text>
          </View>
        }
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#11181C',
  },
  playlistInfo: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  playlistName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#11181C',
    marginBottom: 8,
  },
  playlistMeta: {
    fontSize: 14,
    color: '#687076',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#E53935',
  },
  emptyText: {
    fontSize: 15,
    color: '#687076',
    textAlign: 'center',
  },
  songItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  removeBtn: {
    padding: 12,
  },
});

export default PlaylistDetailsScreen;
