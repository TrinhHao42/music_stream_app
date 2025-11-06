import { addSongToLibrary, addSongToPlaylist, getLibrary, getPlaylistById, getSongById, getSongs, getUserPlaylists, removeSongFromPlaylist } from '@/api/musicApi';
import { useAuth } from '@/contexts/AuthContext';
import Song from '@/types/Song';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
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
  const { playlist: playlistParam, playlistId } = useLocalSearchParams<{ playlist?: string; playlistId?: string }>();
  const { user } = useAuth();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSongId, setLoadingSongId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendedSong, setRecommendedSong] = useState<Song | null>(null);
  
  // Modal states
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [allPlaylists, setAllPlaylists] = useState<Playlist[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<{
    addToFavorites: boolean;
    addToCurrentPlaylist: boolean;
    otherPlaylists: string[]; // array of playlist IDs
  }>({
    addToFavorites: false,
    addToCurrentPlaylist: false,
    otherPlaylists: [],
  });
  const [adding, setAdding] = useState(false);

  // Parse playlist JSON một lần nếu được truyền
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

  // Load songs khi playlist thay đổi (object có sẵn)
  const loadSongs = useCallback(async () => {
    if (!playlist) return;
    try {
      setLoading(true);
      if (!playlist.songs?.length) {
        setSongs([]);
        return;
      }
      const fetched = await Promise.all(playlist.songs.map((id) => getSongById(id)));
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

  const loadPlaylistAndSongs = useCallback(async (playlistId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading playlist with ID:', playlistId);
      
      // Fetch full playlist data from backend
      const fullPlaylist = await getPlaylistById(playlistId);
      
      console.log('Playlist data received:', fullPlaylist);
      
      if (!fullPlaylist) {
        console.error('Playlist not found');
        setError('Playlist not found');
        setLoading(false);
        setTimeout(() => {
          Alert.alert('Error', 'Playlist not found', [
            { text: 'OK', onPress: () => router.back() }
          ]);
        }, 100);
        return;
      }

      setPlaylist(fullPlaylist);
      
      if (fullPlaylist.songs && fullPlaylist.songs.length > 0) {
        // Fetch all songs
        console.log('Loading songs:', fullPlaylist.songs);
        const songPromises = fullPlaylist.songs.map((songId: string) => getSongById(songId));
        const fetchedSongs = await Promise.all(songPromises);
        setSongs(fetchedSongs.filter((s): s is Song => s !== null));
        setRecommendedSong(null); // Clear recommended song if playlist has songs
      } else {
        console.log('No songs in playlist');
        setSongs([]);
        // Load recommended song when playlist is empty
        try {
          const allSongs = await getSongs(0, 1); // Get first song
          if (allSongs && allSongs.length > 0) {
            setRecommendedSong(allSongs[0]);
          }
        } catch (error) {
          console.error('Error loading recommended song:', error);
        }
      }
    } catch (error: any) {
      console.error('Error loading playlist:', error);
      console.error('Error details:', error.response?.data || error.message);
      setError(error.message || 'Failed to load playlist');
      setTimeout(() => {
        Alert.alert('Error', 'Failed to load playlist', [
          { text: 'Try Again', onPress: () => loadPlaylistAndSongs(playlistId) },
          { text: 'Go Back', onPress: () => router.back() }
        ]);
      }, 100);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    if (playlistId) {
      loadPlaylistAndSongs(String(playlistId));
    }
  }, [playlistId, loadPlaylistAndSongs]);

  useFocusEffect(
    useCallback(() => {
      if (playlistId) {
        loadPlaylistAndSongs(String(playlistId));
      }
    }, [playlistId, loadPlaylistAndSongs])
  );

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
    if (playlistId) {
      loadPlaylistAndSongs(String(playlistId));
    } else {
      loadSongs();
    }
  }, [playlistId, loadPlaylistAndSongs, loadSongs]);

  if (!playlist) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1ce5ff" />
      </View>
    );
  }

  // Xử lý mở modal thêm bài hát
  const handleOpenAddModal = async () => {
    if (!user || !recommendedSong) return;
    
    setLoadingPlaylists(true);
    setAddModalVisible(true);
    
    try {
      // Load library để check favourite songs
      const library = await getLibrary(user.userId);
      const isFavorite = library?.favouriteSongs?.some(s => s.songId === recommendedSong.songId) || false;
      
      // Load all user playlists
      const userPlaylists = await getUserPlaylists(user.userId);
      
      // Check if song is in current playlist
      const isInCurrentPlaylist = playlist?.songs.includes(recommendedSong.songId) || false;
      
      // Filter out current playlist for "other playlists" section
      const otherPlaylists = userPlaylists.filter(p => p.playlistId !== playlist?.playlistId);
      setAllPlaylists(otherPlaylists);
      
      // Check which other playlists already contain this song
      const otherPlaylistsWithSong = otherPlaylists
        .filter(pl => pl.songs.includes(recommendedSong.songId))
        .map(pl => pl.playlistId);
      
      // Set initial selections based on current state
      setSelectedOptions({
        addToFavorites: isFavorite,
        addToCurrentPlaylist: isInCurrentPlaylist,
        otherPlaylists: otherPlaylistsWithSong,
      });
    } catch (error) {
      console.error('Error loading playlists:', error);
      // Reset selections if error
      setSelectedOptions({
        addToFavorites: false,
        addToCurrentPlaylist: false,
        otherPlaylists: [],
      });
    } finally {
      setLoadingPlaylists(false);
    }
  };

  // Toggle favorite option
  const toggleFavorite = () => {
    setSelectedOptions(prev => ({
      ...prev,
      addToFavorites: !prev.addToFavorites,
    }));
  };

  // Toggle current playlist option
  const toggleCurrentPlaylist = () => {
    setSelectedOptions(prev => ({
      ...prev,
      addToCurrentPlaylist: !prev.addToCurrentPlaylist,
    }));
  };

  // Toggle other playlist
  const toggleOtherPlaylist = (playlistId: string) => {
    setSelectedOptions(prev => {
      const isSelected = prev.otherPlaylists.includes(playlistId);
      return {
        ...prev,
        otherPlaylists: isSelected
          ? prev.otherPlaylists.filter(id => id !== playlistId)
          : [...prev.otherPlaylists, playlistId],
      };
    });
  };

  // Xử lý thêm bài hát vào các nơi đã chọn
  const handleAddSong = async () => {
    if (!user || !recommendedSong) return;

    const { addToFavorites, addToCurrentPlaylist, otherPlaylists } = selectedOptions;
    
    // Check if at least one option is selected
    if (!addToFavorites && !addToCurrentPlaylist && otherPlaylists.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một nơi để thêm bài hát');
      return;
    }

    setAdding(true);
    const results: string[] = [];
    let needReloadPlaylist = false;

    try {
      // Add to favorites
      if (addToFavorites) {
        try {
          const success = await addSongToLibrary(user.userId, recommendedSong.songId);
          if (success) {
            results.push('✓ Đã thêm vào bài hát yêu thích');
          } else {
            results.push('✗ Không thể thêm vào bài hát yêu thích');
          }
        } catch {
          results.push('✗ Lỗi khi thêm vào bài hát yêu thích');
        }
      }

      // Add to current playlist
      if (addToCurrentPlaylist && playlist) {
        try {
          const success = await addSongToPlaylist(playlist.playlistId, recommendedSong.songId);
          if (success) {
            results.push(`✓ Đã thêm vào "${playlist.playlistName}"`);
            needReloadPlaylist = true; // Đánh dấu cần reload
          } else {
            results.push(`✗ Không thể thêm vào "${playlist.playlistName}"`);
          }
        } catch {
          results.push(`✗ Lỗi khi thêm vào "${playlist.playlistName}"`);
        }
      }

      // Add to other playlists
      for (const playlistId of otherPlaylists) {
        const targetPlaylist = allPlaylists.find(p => p.playlistId === playlistId);
        if (targetPlaylist) {
          try {
            const success = await addSongToPlaylist(playlistId, recommendedSong.songId);
            if (success) {
              results.push(`✓ Đã thêm vào "${targetPlaylist.playlistName}"`);
            } else {
              results.push(`✗ Không thể thêm vào "${targetPlaylist.playlistName}"`);
            }
          } catch {
            results.push(`✗ Lỗi khi thêm vào "${targetPlaylist.playlistName}"`);
          }
        }
      }

      // Show results
      Alert.alert('Kết quả', results.join('\n'));
      setAddModalVisible(false);
      
      // Reload playlist nếu đã thêm vào current playlist thành công
      if (needReloadPlaylist && playlist) {
        console.log('Reloading playlist after adding song...');
        await loadPlaylistAndSongs(playlist.playlistId);
      }
    } catch (error) {
      console.error('Error adding song:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi thêm bài hát');
    } finally {
      setAdding(false);
    }
  };

  // Hiển thị loading khi đang tải lần đầu
  if (loading && !playlist) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Playlist</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1ce5ff" />
          <Text style={styles.loadingText}>Loading playlist...</Text>
        </View>
      </View>
    );
  }

  // Hiển thị error nếu có lỗi và không có playlist data
  if (error && !playlist) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Playlist</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#E53935" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => playlistId && loadPlaylistAndSongs(String(playlistId))}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Nếu vẫn không có playlist sau khi load xong, trở về
  if (!playlist) {
    return null;
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
          <Text style={styles.loadingText}>Loading songs...</Text>
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
              <Text style={styles.emptyText}>Chưa có bài hát nào được thêm vào</Text>
              
              {/* Recommended Song */}
              {recommendedSong && (
                <View style={styles.recommendSection}>
                  <View style={styles.recommendHeader}>
                    <Text style={styles.recommendTitle}>Gợi ý cho bạn</Text>
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={handleOpenAddModal}
                    >
                      <Ionicons name="add-circle" size={32} color="#1ce5ff" />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity 
                    style={styles.recommendedSongCard}
                    onPress={() => {
                      router.push({
                        pathname: '/song-details',
                        params: { song: JSON.stringify(recommendedSong) },
                      } as never);
                    }}
                  >
                    <Image
                      source={{ uri: recommendedSong.coverUrl }}
                      style={styles.recommendedSongImage}
                      contentFit="cover"
                    />
                    <View style={styles.recommendedSongInfo}>
                      <Text style={styles.recommendedSongTitle} numberOfLines={1}>
                        {recommendedSong.title}
                      </Text>
                      <Text style={styles.recommendedSongArtist} numberOfLines={1}>
                        {Array.isArray(recommendedSong.artist) 
                          ? recommendedSong.artist.join(', ') 
                          : recommendedSong.artist}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </TouchableOpacity>
                </View>
              )}
              
              {/* Search Button */}
              <TouchableOpacity 
                style={styles.searchButton}
                onPress={() => router.push('/(tabs)/search')}
              >
                <Ionicons name="search" size={20} color="#fff" />
                <Text style={styles.searchButtonText}>Tìm kiếm bài hát</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Add Song Modal */}
      <Modal
        visible={addModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm bài hát vào</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            {loadingPlaylists ? (
              <ActivityIndicator size="large" color="#1ce5ff" style={{ marginVertical: 20 }} />
            ) : (
              <ScrollView style={styles.modalContent}>
                {/* Add to Favorites */}
                <TouchableOpacity 
                  style={styles.optionItem}
                  onPress={toggleFavorite}
                >
                  <Ionicons 
                    name={selectedOptions.addToFavorites ? "checkbox" : "square-outline"} 
                    size={24} 
                    color={selectedOptions.addToFavorites ? "#1ce5ff" : "#999"} 
                  />
                  <Ionicons name="heart" size={20} color="#E53935" style={styles.optionIcon} />
                  <Text style={styles.optionText}>Bài hát yêu thích</Text>
                </TouchableOpacity>

                {/* Add to Current Playlist */}
                {playlist && (
                  <TouchableOpacity 
                    style={styles.optionItem}
                    onPress={toggleCurrentPlaylist}
                  >
                    <Ionicons 
                      name={selectedOptions.addToCurrentPlaylist ? "checkbox" : "square-outline"} 
                      size={24} 
                      color={selectedOptions.addToCurrentPlaylist ? "#1ce5ff" : "#999"} 
                    />
                    <Ionicons name="musical-notes" size={20} color="#1ce5ff" style={styles.optionIcon} />
                    <Text style={styles.optionText}>{playlist.playlistName}</Text>
                  </TouchableOpacity>
                )}

                {/* Other Playlists */}
                {allPlaylists.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Playlists khác</Text>
                    {allPlaylists.map((pl) => (
                      <TouchableOpacity 
                        key={pl.playlistId}
                        style={styles.optionItem}
                        onPress={() => toggleOtherPlaylist(pl.playlistId)}
                      >
                        <Ionicons 
                          name={selectedOptions.otherPlaylists.includes(pl.playlistId) ? "checkbox" : "square-outline"} 
                          size={24} 
                          color={selectedOptions.otherPlaylists.includes(pl.playlistId) ? "#1ce5ff" : "#999"} 
                        />
                        <Ionicons name="list" size={20} color="#666" style={styles.optionIcon} />
                        <Text style={styles.optionText}>{pl.playlistName}</Text>
                        <Text style={styles.modalSongCount}>({pl.songs?.length || 0})</Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </ScrollView>
            )}

            {/* Add Button */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setAddModalVisible(false)}
                disabled={adding}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddSong}
                disabled={adding}
              >
                {adding ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Thêm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#E53935',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#1ce5ff',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    marginBottom: 30,
  },
  recommendSection: {
    width: '100%',
    marginBottom: 20,
  },
  recommendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  addButton: {
    padding: 4,
  },
  recommendedSongCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  recommendedSongImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  recommendedSongInfo: {
    flex: 1,
  },
  recommendedSongTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  recommendedSongArtist: {
    fontSize: 14,
    color: '#666',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1ce5ff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 8,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  addModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  modalContent: {
    padding: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  optionIcon: {
    marginLeft: 8,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  modalSongCount: {
    fontSize: 14,
    color: '#999',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  confirmButton: {
    backgroundColor: '#1ce5ff',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default PlaylistDetailsLibraryScreen;
