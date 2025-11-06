import { getSongById, removeSongFromPlaylist } from '@/api/musicApi';
import { useAuth } from '@/contexts/AuthContext';
import Song from '@/types/Song';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
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
  const { playlist: playlistParam } = useLocalSearchParams<{ playlist: string }>();
  const { user } = useAuth();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSongId, setLoadingSongId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  /** ✅ Chỉ parse playlist 1 lần */
  useEffect(() => {
    if (!playlistParam) return;
    try {
      const parsed = JSON.parse(playlistParam);
      setPlaylist(parsed);
    } catch (err) {
      console.error('Invalid playlist param:', err);
      Alert.alert('Error', 'Invalid playlist data');
    }
  }, [playlistParam]);

  /** ✅ Load songs khi playlist thay đổi */
  useEffect(() => {
    if (!playlist) return;
    loadSongs();
  }, [playlist]);

  /** ✅ Dùng useCallback để tránh re-render */
  const loadSongs = useCallback(async () => {
    if (!playlist) return;
    try {
      setLoading(true);
      if (!playlist.songs?.length) {
        setSongs([]);
        return;
      }

      const fetched = await Promise.all(
        playlist.songs.map((id) => getSongById(id))
      );

      const validSongs = fetched.filter((s): s is Song => s != null);
      setSongs(validSongs);
    } catch (err) {
      console.error('Error loading songs:', err);
      Alert.alert('Error', 'Failed to load playlist songs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [playlist]);

  /** ✅ Xóa bài hát */
  const handleRemoveSong = async (songId: string) => {
    if (!playlist || !user) return;

    Alert.alert('Remove Song', 'Remove this song from playlist?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setLoadingSongId(songId);
          try {
            const success = await removeSongFromPlaylist(
              playlist.playlistId,
              songId
            );
            if (success) {
              setSongs((prev) => prev.filter((s) => s.songId !== songId));
            } else {
              Alert.alert('Error', 'Failed to remove song');
            }
          } catch (err) {
            console.error('Remove song error:', err);
            Alert.alert('Error', 'Failed to remove song');
          } finally {
            setLoadingSongId(null);
          }
        },
      },
    ]);
  };

  /** ✅ Chuyển sang song details */
  const handleSongPress = (song: Song) => {
    router.push({
      pathname: '/song-details',
      params: { song: JSON.stringify(song) },
    } as never);
  };

  /** ✅ Refresh */
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadSongs();
  }, [loadSongs]);

  if (!playlist) {
    return (
      <View style={styles.center}>
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

      {/* Songs */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1ce5ff" />
        </View>
      ) : (
        <FlatList
          data={songs}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
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
                    {Array.isArray(item.artist)
                      ? item.artist.join(', ')
                      : item.artist}
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
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  playlistInfo: { alignItems: 'center', paddingVertical: 24 },
  playlistIcon: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#1ce5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  playlistName: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 8 },
  songCount: { fontSize: 14, color: '#666' },
  listContent: { padding: 16 },
  songItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  songContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  songImage: { width: 56, height: 56, borderRadius: 8, marginRight: 12 },
  songInfo: { flex: 1 },
  songTitle: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 4 },
  songArtist: { fontSize: 14, color: '#666' },
  removeBtn: { padding: 12 },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 16 },
});

export default PlaylistDetailsLibraryScreen;
