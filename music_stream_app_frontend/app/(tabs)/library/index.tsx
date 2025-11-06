import {
  createPlaylist,
  getLibrary,
  removeAlbumFromLibrary,
  removeArtistFromLibrary,
  removePlaylistFromLibrary,
  removeSongFromLibrary,
} from '@/api/musicApi';
import CartAlbumItem from '@/components/CartAlbumItem';
import CartArtistItem from '@/components/CartArtistItem';
import CartPlaylistItem from '@/components/CartPlaylistItem';
import CartSongItem from '@/components/CartSongItem';
import { useAuth } from '@/contexts/AuthContext';
import { Album, Artist, Song } from '@/types';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Playlist = {
  playlistId: string;
  playlistName: string;
  userId: string;
  songs: string[];
};

const CACHE_KEY = 'user_library_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

const LibraryScreen = () => {
  const categories = useMemo(() => ['Playlists', 'Songs', 'Albums', 'Artists'], []);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [creating, setCreating] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // === Cache Helpers ===
  const saveCache = async (data: any) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save library cache', error);
    }
  };

  const loadCache = async (): Promise<any | null> => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > CACHE_DURATION) {
        return null; // Cache hết hạn
      }
      return data;
    } catch (error) {
      console.warn('Failed to load library cache', error);
      return null;
    }
  };

  // === Load Library ===
  const loadLibrary = useCallback(
    async (forceRefresh = false) => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      if (!forceRefresh) {
        const cached = await loadCache();
        if (cached) {
          setSongs(cached.favouriteSongs || []);
          setAlbums(cached.favouriteAlbums || []);
          setArtists(cached.favouriteArtists || []);
          setPlaylists(cached.favouritePlaylists || []);
          setIsLoading(false);
        }
      }

      try {
        const library = await getLibrary(user.userId);
        if (library) {
          setSongs(library.favouriteSongs || []);
          setAlbums(library.favouriteAlbums || []);
          setArtists(library.favouriteArtists || []);
          setPlaylists(library.favouritePlaylists || []);
          await saveCache(library); // Cập nhật cache
        }
      } catch (error) {
        console.error('Error loading library:', error);
        if (forceRefresh) {
          Alert.alert('Error', 'Failed to refresh library');
        }
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [user]
  );

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadLibrary(true);
  };

  // === Create Playlist ===
  const handleCreatePlaylist = async () => {
    if (!user || !playlistName.trim()) {
      Alert.alert('Error', !user ? 'Please login' : 'Enter playlist name');
      return;
    }

    setCreating(true);
    try {
      const newPlaylist = await createPlaylist({
        playlistName: playlistName.trim(),
        userId: user.userId,
        songs: [],
      });

      if (newPlaylist) {
        Alert.alert('Success', 'Playlist created!');
        setModalVisible(false);
        setPlaylistName('');
        await loadLibrary(true); // Force reload
      }
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to create playlist');
    } finally {
      setCreating(false);
    }
  };

  // === Remove Handlers ===
  const createRemoveHandler = useCallback(
    (removeFn: (userId: string, id: string) => Promise<boolean>, successMsg: string) =>
      async (id: string) => {
        if (!user) return;
        try {
          const success = await removeFn(user.userId, id);
          if (success) {
            Alert.alert('Success', successMsg);
            await loadLibrary(true);
          }
        } catch (error) {
          Alert.alert('Error', `Failed to remove`);
        }
      },
    [user, loadLibrary]
  );

  const handleRemoveSong = createRemoveHandler(removeSongFromLibrary, 'Song removed');
  const handleRemoveAlbum = createRemoveHandler(removeAlbumFromLibrary, 'Album removed');
  const handleRemoveArtist = createRemoveHandler(removeArtistFromLibrary, 'Artist unfollowed');
  const handleRemovePlaylist = createRemoveHandler(removePlaylistFromLibrary, 'Playlist removed');

  // === Render Item Helpers ===
  const renderItemWithDelete = useCallback(
    (item: any, titleKey: string, onRemove: (id: string) => void, Component: any, props?: any, propKey?: string) => (
      <View style={styles.itemWithDelete}>
        <View style={{ flex: 1 }}>
          <Component {...{ [propKey || titleKey]: item, ...props }} />
        </View>
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              'Remove',
              `Remove "${item[titleKey]}"?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: () => onRemove(item[`${titleKey.replace('Name', '')}Id`]) },
              ]
            );
          }}
          style={styles.deleteBtn}
        >
          <Ionicons name="trash-outline" size={20} color="#E53935" />
        </TouchableOpacity>
      </View>
    ),
    []
  );

  // === Render Content ===
  const renderContent = useMemo(() => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1ce5ff" />
        </View>
      );
    }

    if (!user) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Please login to view your library</Text>
        </View>
      );
    }

    const dataMap: {
      [key: string]: {
        data: any[];
        titleKey: string;
        Component: React.ComponentType<any>;
        props?: any;
        propKey?: string; // Key to use when passing item to component
      };
    } = {
      Playlists: { 
        data: playlists, 
        titleKey: 'playlistName', 
        Component: CartPlaylistItem, 
        props: { showRemove: false, fromLibrary: true },
        propKey: 'playlist'
      },
      Songs: { 
        data: songs, 
        titleKey: 'title', 
        Component: CartSongItem, 
        props: { showAddToPlaylist: true, showDownloaded: true },
        propKey: 'song'
      },
      Albums: { 
        data: albums, 
        titleKey: 'albumName', 
        Component: CartAlbumItem,
        propKey: 'album'
      },
      Artists: { 
        data: artists, 
        titleKey: 'artistName', 
        Component: CartArtistItem,
        propKey: 'artist'
      },
    };

    if (selectedCategory) {
      const { data, titleKey, Component, props = {}, propKey } = dataMap[selectedCategory];
      const onRemoveMap: { [key: string]: ((id: string) => Promise<void>) | undefined } = {
        Playlists: handleRemovePlaylist,
        Songs: handleRemoveSong,
        Albums: handleRemoveAlbum,
        Artists: handleRemoveArtist,
      };
      const onRemove = onRemoveMap[selectedCategory];

      return (
        <FlatList
          data={data}
          renderItem={({ item }) => renderItemWithDelete(item, titleKey, onRemove!, Component, props, propKey)}
          keyExtractor={(item) => item[`${titleKey.replace('Name', '')}Id`]}
          ListEmptyComponent={<Text style={styles.emptyText}>No {selectedCategory.toLowerCase()} yet</Text>}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        />
      );
    }

    // Default: Show all sections
    const sections = categories.map((cat) => {
      const onRemoveMap: { [key: string]: ((id: string) => Promise<void>) | undefined } = {
        Playlists: handleRemovePlaylist,
        Songs: handleRemoveSong,
        Albums: handleRemoveAlbum,
        Artists: handleRemoveArtist,
      };
      
      return {
        title: cat,
        data: dataMap[cat].data.slice(0, 3),
        fullCount: dataMap[cat].data.length,
        titleKey: dataMap[cat].titleKey,
        Component: dataMap[cat].Component,
        props: dataMap[cat].props || {},
        propKey: dataMap[cat].propKey,
        onRemove: onRemoveMap[cat],
      };
    });

    return (
      <FlatList
        data={sections}
        renderItem={({ item }) => {
          if (item.data.length === 0) return null;

          return (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{item.title}</Text>
              {item.data.map((el: any) => (
                <View key={el[`${item.titleKey.replace('Name', '')}Id`]} style={styles.itemWithDelete}>
                  <View style={{ flex: 1 }}>
                    <item.Component {...{ [item.propKey || item.titleKey]: el, ...item.props }} />
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        'Remove',
                        `Remove "${el[item.titleKey]}"?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Remove', style: 'destructive', onPress: () => item.onRemove?.(el[`${item.titleKey.replace('Name', '')}Id`]) },
                        ]
                      );
                    }}
                    style={styles.deleteBtn}
                  >
                    <Ionicons name="trash-outline" size={20} color="#E53935" />
                  </TouchableOpacity>
                </View>
              ))}
              {item.fullCount > 3 && (
                <TouchableOpacity style={styles.seeMoreBtn} onPress={() => setSelectedCategory(item.title)}>
                  <Text style={styles.seeMoreText}>See all {item.fullCount} {item.title.toLowerCase()}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#1ce5ff" />
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        keyExtractor={(item) => item.title}
        ListEmptyComponent={<Text style={styles.emptyText}>Your library is empty. Start adding favorites!</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />
    );
  }, [
    isLoading,
    user,
    selectedCategory,
    playlists,
    songs,
    albums,
    artists,
    refreshing,
    handleRefresh,
    renderItemWithDelete,
    handleRemovePlaylist,
    handleRemoveSong,
    handleRemoveAlbum,
    handleRemoveArtist,
  ]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Library</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/library/search')}>
          <Ionicons name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={categories}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryBtn, selectedCategory === item && styles.categoryBtnActive]}
              onPress={() => setSelectedCategory(selectedCategory === item ? '' : item)}
            >
              <Text style={[styles.categoryText, selectedCategory === item && styles.categoryTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
      </View>

      {/* Content */}
      {renderContent}

      {/* FAB */}
      {(selectedCategory === 'Playlists' || !selectedCategory) && (
        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
          <AntDesign name="plus" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Create Playlist Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Playlist</Text>
            <TextInput
              style={styles.input}
              placeholder="Playlist name"
              value={playlistName}
              onChangeText={setPlaylistName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => {
                  setModalVisible(false);
                  setPlaylistName('');
                }}
                disabled={creating}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.createBtn]}
                onPress={handleCreatePlaylist}
                disabled={creating}
              >
                {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.createBtnText}>Create</Text>}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#11181C' },
  categoriesContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F5',
    marginRight: 8,
  },
  categoryBtnActive: { backgroundColor: '#11181C' },
  categoryText: { fontSize: 14, fontWeight: '600', color: '#687076' },
  categoryTextActive: { color: '#FFFFFF' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', color: '#687076', marginTop: 40, fontSize: 15 },
  itemWithDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  deleteBtn: { padding: 12 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#11181C',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '85%', maxWidth: 400 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#E6E8EB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#E6E8EB' },
  cancelBtnText: { fontSize: 16, fontWeight: '600', color: '#11181C' },
  createBtn: { backgroundColor: '#11181C' },
  createBtnText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  sectionContainer: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#11181C', marginBottom: 12 },
  seeMoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingVertical: 8, marginTop: 8 },
  seeMoreText: { fontSize: 14, fontWeight: '600', color: '#1ce5ff', marginRight: 4 },
});

export default LibraryScreen;