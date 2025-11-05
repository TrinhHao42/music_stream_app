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
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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

const LibraryScreen = () => {
  const categories = ['Playlists', 'Songs', 'Albums', 'Artists'];
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [creating, setCreating] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  // Library data
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    loadLibrary();
  }, [user]);

  const loadLibrary = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const library = await getLibrary(user.userId);
      if (library) {
        setSongs(library.favouriteSongs || []);
        setAlbums(library.favouriteAlbums || []);
        setArtists(library.favouriteArtists || []);
        setPlaylists(library.favouritePlaylists || []);
      }
    } catch (error) {
      console.error('Error loading library:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLibrary();
    setRefreshing(false);
  };

  const handleCreatePlaylist = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login to create playlist');
      return;
    }

    if (!playlistName.trim()) {
      Alert.alert('Error', 'Please enter playlist name');
      return;
    }

    setCreating(true);
    try {
      // Create playlist - backend will automatically add to library
      const newPlaylist = await createPlaylist({
        playlistName: playlistName.trim(),
        userId: user.userId,
        songs: [],
      });

      if (newPlaylist) {
        console.log('Playlist created:', newPlaylist);
        Alert.alert('Success', 'Playlist created successfully');
        setModalVisible(false);
        setPlaylistName('');
        await loadLibrary(); // Reload to show new playlist
      }
    } catch (error: any) {
      console.error('Error creating playlist:', error);
      Alert.alert('Error', error?.response?.data?.message || error.message || 'Failed to create playlist');
    } finally {
      setCreating(false);
    }
  };

  const handleRemoveSong = async (songId: string) => {
    if (!user) return;
    
    try {
      const success = await removeSongFromLibrary(user.userId, songId);
      if (success) {
        Alert.alert('Success', 'Song removed from library');
        await loadLibrary();
      } else {
        Alert.alert('Error', 'Failed to remove song');
      }
    } catch (error) {
      console.error('Error removing song:', error);
      Alert.alert('Error', 'Failed to remove song');
    }
  };

  const handleRemoveAlbum = async (albumId: string) => {
    if (!user) return;
    
    try {
      const success = await removeAlbumFromLibrary(user.userId, albumId);
      if (success) {
        Alert.alert('Success', 'Album removed from library');
        await loadLibrary();
      } else {
        Alert.alert('Error', 'Failed to remove album');
      }
    } catch (error) {
      console.error('Error removing album:', error);
      Alert.alert('Error', 'Failed to remove album');
    }
  };

  const handleRemoveArtist = async (artistId: string) => {
    if (!user) return;
    
    try {
      const success = await removeArtistFromLibrary(user.userId, artistId);
      if (success) {
        Alert.alert('Success', 'Artist removed from library');
        await loadLibrary();
      } else {
        Alert.alert('Error', 'Failed to remove artist');
      }
    } catch (error) {
      console.error('Error removing artist:', error);
      Alert.alert('Error', 'Failed to remove artist');
    }
  };

  const handleRemovePlaylist = async (playlistId: string) => {
    if (!user) return;
    
    try {
      const success = await removePlaylistFromLibrary(user.userId, playlistId);
      if (success) {
        Alert.alert('Success', 'Playlist removed from library');
        await loadLibrary();
      } else {
        Alert.alert('Error', 'Failed to remove playlist');
      }
    } catch (error) {
      console.error('Error removing playlist:', error);
      Alert.alert('Error', 'Failed to remove playlist');
    }
  };

  const renderContent = () => {
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

    switch (selectedCategory) {
      case 'Playlists':
        return (
          <FlatList
            data={playlists}
            renderItem={({ item }) => (
              <CartPlaylistItem
                playlist={item}
                showRemove={true}
                onRemove={() => handleRemovePlaylist(item.playlistId)}
              />
            )}
            keyExtractor={(item) => item.playlistId}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No playlists yet. Create one!</Text>
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          />
        );

      case 'Songs':
        return (
          <FlatList
            data={songs}
            renderItem={({ item }) => (
              <View style={styles.itemWithDelete}>
                <View style={{ flex: 1 }}>
                  <CartSongItem 
                    song={item} 
                    showAddToPlaylist={true}
                    showDownloaded={user !== null}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      'Remove Song',
                      `Remove "${item.title}" from library?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Remove', style: 'destructive', onPress: () => handleRemoveSong(item.songId) },
                      ]
                    );
                  }}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={20} color="#E53935" />
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item.songId}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No favourite songs yet</Text>
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          />
        );

      case 'Albums':
        return (
          <FlatList
            data={albums}
            renderItem={({ item }) => (
              <View style={styles.itemWithDelete}>
                <View style={{ flex: 1 }}>
                  <CartAlbumItem album={item} />
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      'Remove Album',
                      `Remove "${item.albumName}" from library?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Remove', style: 'destructive', onPress: () => handleRemoveAlbum(item.albumId) },
                      ]
                    );
                  }}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={20} color="#E53935" />
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item.albumId}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No favourite albums yet</Text>
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          />
        );

      case 'Artists':
        return (
          <FlatList
            data={artists}
            renderItem={({ item }) => (
              <View style={styles.itemWithDelete}>
                <View style={{ flex: 1 }}>
                  <CartArtistItem artist={item} />
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      'Unfollow Artist',
                      `Unfollow "${item.artistName}"?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Unfollow', style: 'destructive', onPress: () => handleRemoveArtist(item.artistId) },
                      ]
                    );
                  }}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={20} color="#E53935" />
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item.artistId}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No favourite artists yet</Text>
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          />
        );

      default:
        // Show all categories when nothing is selected
        return (
          <FlatList
            data={[
              { type: 'section', title: 'Playlists', data: playlists },
              { type: 'section', title: 'Songs', data: songs },
              { type: 'section', title: 'Albums', data: albums },
              { type: 'section', title: 'Artists', data: artists },
            ]}
            renderItem={({ item }: any) => {
              if (item.type === 'section') {
                if (item.data.length === 0) return null;
                
                return (
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>{item.title}</Text>
                    {item.title === 'Playlists' && item.data.slice(0, 3).map((playlist: any) => (
                      <View key={playlist.playlistId} style={styles.itemWithDelete}>
                        <View style={{ flex: 1 }}>
                          <CartPlaylistItem
                            playlist={playlist}
                            showRemove={false}
                          />
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            Alert.alert(
                              'Remove Playlist',
                              `Remove "${playlist.playlistName}" from library?`,
                              [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Remove', style: 'destructive', onPress: () => handleRemovePlaylist(playlist.playlistId) },
                              ]
                            );
                          }}
                          style={styles.deleteBtn}
                        >
                          <Ionicons name="trash-outline" size={20} color="#E53935" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    {item.title === 'Songs' && item.data.slice(0, 3).map((song: Song) => (
                      <View key={song.songId} style={styles.itemWithDelete}>
                        <View style={{ flex: 1 }}>
                          <CartSongItem
                            song={song}
                            showAddToPlaylist={true}
                            showDownloaded={user !== null}
                          />
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            Alert.alert(
                              'Remove Song',
                              `Remove "${song.title}" from library?`,
                              [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Remove', style: 'destructive', onPress: () => handleRemoveSong(song.songId) },
                              ]
                            );
                          }}
                          style={styles.deleteBtn}
                        >
                          <Ionicons name="trash-outline" size={20} color="#E53935" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    {item.title === 'Albums' && item.data.slice(0, 3).map((album: Album) => (
                      <View key={album.albumId} style={styles.itemWithDelete}>
                        <View style={{ flex: 1 }}>
                          <CartAlbumItem album={album} />
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            Alert.alert(
                              'Remove Album',
                              `Remove "${album.albumName}" from library?`,
                              [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Remove', style: 'destructive', onPress: () => handleRemoveAlbum(album.albumId) },
                              ]
                            );
                          }}
                          style={styles.deleteBtn}
                        >
                          <Ionicons name="trash-outline" size={20} color="#E53935" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    {item.title === 'Artists' && item.data.slice(0, 3).map((artist: Artist) => (
                      <View key={artist.artistId} style={styles.itemWithDelete}>
                        <View style={{ flex: 1 }}>
                          <CartArtistItem artist={artist} />
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            Alert.alert(
                              'Unfollow Artist',
                              `Unfollow "${artist.artistName}"?`,
                              [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Unfollow', style: 'destructive', onPress: () => handleRemoveArtist(artist.artistId) },
                              ]
                            );
                          }}
                          style={styles.deleteBtn}
                        >
                          <Ionicons name="trash-outline" size={20} color="#E53935" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    {item.data.length > 3 && (
                      <TouchableOpacity
                        style={styles.seeMoreBtn}
                        onPress={() => setSelectedCategory(item.title)}
                      >
                        <Text style={styles.seeMoreText}>See all {item.data.length} {item.title.toLowerCase()}</Text>
                        <Ionicons name="chevron-forward" size={16} color="#1ce5ff" />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              }
              return null;
            }}
            keyExtractor={(item, index) => `${item.title}-${index}`}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Your library is empty. Start adding your favorites!</Text>
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          />
        );
    }
  };

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
              activeOpacity={0.7}
              style={[
                styles.categoryBtn,
                selectedCategory === item && styles.categoryBtnActive,
              ]}
              onPress={() => setSelectedCategory(selectedCategory === item ? '' : item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item && styles.categoryTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
      </View>

      {/* Content */}
      {renderContent()}

      {/* Floating Add Button - show when Playlists tab selected or no tab selected */}
      {(selectedCategory === 'Playlists' || selectedCategory === '') && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <AntDesign name="plus" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Create Playlist Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
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
                {creating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.createBtnText}>Create</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#11181C',
  },
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
  categoryBtnActive: {
    backgroundColor: '#11181C',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#687076',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#687076',
    marginTop: 40,
    fontSize: 15,
  },
  itemWithDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  deleteBtn: {
    padding: 12,
  },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E6E8EB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#E6E8EB',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
  },
  createBtn: {
    backgroundColor: '#11181C',
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#11181C',
    marginBottom: 12,
  },
  seeMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 8,
    marginTop: 8,
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1ce5ff',
    marginRight: 4,
  },
});

export default LibraryScreen;
