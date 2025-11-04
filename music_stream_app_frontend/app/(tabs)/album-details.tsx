import { addAlbumToLibrary, addSongToLibrary, addSongToPlaylist, getSongByName, getUserPlaylists } from '@/api/musicApi';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { Album, Playlist, Song } from '@/types';

const AlbumDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ album: string }>();
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loadingSongTitle, setLoadingSongTitle] = useState<string | null>(null);
  const [savingAlbum, setSavingAlbum] = useState(false);
  
  // States for menu and playlist modal
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistModalVisible, setPlaylistModalVisible] = useState(false);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);

  // Parse album from params
  if (!params.album) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#999' }}>Album not found</Text>
        </View>
      </View>
    );
  }

  let album: Album;
  try {
    album = JSON.parse(params.album as string);
  } catch (error) {
    console.error('Error parsing album:', error);
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#999' }}>Error loading album</Text>
        </View>
      </View>
    );
  }

  const handleSongPress = async (songTitle: string) => {
    setLoadingSongTitle(songTitle);
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
    } finally {
      setLoadingSongTitle(null);
    }
  };

  const handleSaveAlbum = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login to save albums');
      return;
    }

    if (isSaved) {
      // Already saved, could implement unsave here
      return;
    }

    setSavingAlbum(true);
    try {
      const success = await addAlbumToLibrary(user.userId, album.albumId);
      if (success) {
        setIsSaved(true);
        Alert.alert('Success', 'Album added to library');
      } else {
        Alert.alert('Error', 'Failed to add album to library');
      }
    } catch (error) {
      console.error('Error saving album:', error);
      Alert.alert('Error', 'Failed to add album to library');
    } finally {
      setSavingAlbum(false);
    }
  };

  const handleShowMenu = async (song: Song) => {
    setSelectedSong(song);
    setMenuVisible(true);
  };

  const handleAddToLibrary = async () => {
    setMenuVisible(false);
    if (!user || !selectedSong) {
      Alert.alert('Error', 'Please login to add songs to library');
      return;
    }

    try {
      const success = await addSongToLibrary(user.userId, selectedSong.songId);
      if (success) {
        Alert.alert('Success', 'Song added to library');
      } else {
        Alert.alert('Error', 'Failed to add song to library');
      }
    } catch (error) {
      console.error('Error adding song to library:', error);
      Alert.alert('Error', 'Failed to add song to library');
    }
  };

  const handleAddToPlaylistPress = async () => {
    setMenuVisible(false);
    if (!user) {
      Alert.alert('Error', 'Please login to add songs to playlist');
      return;
    }

    setLoadingPlaylists(true);
    setPlaylistModalVisible(true);
    try {
      const userPlaylists = await getUserPlaylists(user.userId);
      setPlaylists(userPlaylists);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      Alert.alert('Error', 'Failed to load playlists');
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const handleSelectPlaylist = async (playlist: Playlist) => {
    setPlaylistModalVisible(false);
    if (!selectedSong) return;

    try {
      const success = await addSongToPlaylist(playlist.playlistId, selectedSong.songId);
      if (success) {
        Alert.alert('Success', 'Song added to playlist');
      } else {
        Alert.alert('Error', 'Failed to add song to playlist');
      }
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      Alert.alert('Error', 'Failed to add song to playlist');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Album Info */}
        <View style={styles.albumInfo}>
          <Image 
            source={album.image ? { uri: album.image } : require('@/assets/images/My Library/Image 101.png')}
            style={styles.albumCover}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
          <Text style={styles.albumTitle}>{album.albumName}</Text>
          <Text style={styles.artistName}>
            {Array.isArray(album.artists) ? album.artists.join(', ') : 'Unknown Artist'}
          </Text>
          <Text style={styles.albumMeta}>
            Album • {album.songs?.length || 0} songs • {album.release}
          </Text>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={isSaved ? styles.savedButton : styles.saveButton}
              onPress={handleSaveAlbum}
              disabled={savingAlbum}
            >
              {savingAlbum ? (
                <ActivityIndicator size="small" color={isSaved ? "#4CAF50" : "#000"} />
              ) : (
                <Text style={isSaved ? styles.savedText : styles.saveText}>
                  {isSaved ? 'Saved' : 'Save'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="shuffle" size={24} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.playButton}>
              <Ionicons name="play" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Songs List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Songs</Text>
          {album.songs && album.songs.length > 0 ? (
            album.songs.map((songEmbedded, index) => (
              <TouchableOpacity 
                key={songEmbedded.songId || index}
                style={styles.songItem}
                onPress={() => handleSongPress(songEmbedded.title)}
                disabled={loadingSongTitle === songEmbedded.title}
              >
                <Image 
                  source={songEmbedded.coverUrl ? { uri: songEmbedded.coverUrl } : require('@/assets/images/My Library/Image 101.png')} 
                  style={styles.songImage} 
                  contentFit="cover" 
                  transition={0} 
                  cachePolicy="memory-disk" 
                />
                <View style={styles.songInfo}>
                  <Text style={styles.songTitle}>{songEmbedded.title}</Text>
                  <Text style={styles.songArtist}>
                    {Array.isArray(album.artists) ? album.artists[0] : 'Unknown Artist'}
                  </Text>
                </View>
                {loadingSongTitle === songEmbedded.title ? (
                  <ActivityIndicator size="small" color="#666" />
                ) : (
                  <TouchableOpacity
                    onPress={async () => {
                      setLoadingSongTitle(songEmbedded.title);
                      const fullSong = await getSongByName(songEmbedded.title);
                      setLoadingSongTitle(null);
                      if (fullSong) {
                        handleShowMenu(fullSong);
                      }
                    }}
                  >
                    <Ionicons name="ellipsis-vertical" size={20} color="#666" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No songs available</Text>
          )}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuModal}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleAddToLibrary}
            >
              <Ionicons name="heart-outline" size={24} color="#000" />
              <Text style={styles.menuText}>Add to Library</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleAddToPlaylistPress}
            >
              <Ionicons name="list" size={24} color="#000" />
              <Text style={styles.menuText}>Add to Playlist</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Playlist Selection Modal */}
      <Modal
        visible={playlistModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPlaylistModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.playlistModal}>
            <View style={styles.playlistHeader}>
              <Text style={styles.playlistTitle}>Select Playlist</Text>
              <TouchableOpacity onPress={() => setPlaylistModalVisible(false)}>
                <Ionicons name="close" size={28} color="#000" />
              </TouchableOpacity>
            </View>
            {loadingPlaylists ? (
              <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
            ) : (
              <FlatList
                data={playlists}
                keyExtractor={(item) => item.playlistId}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.playlistItem}
                    onPress={() => handleSelectPlaylist(item)}
                  >
                    <Text style={styles.playlistItemText}>{item.playlistName}</Text>
                    <Text style={styles.playlistItemSongs}>{item.songs.length} songs</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No playlists found</Text>
                }
              />
            )}
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  albumInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  albumCover: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  albumTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  artistName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  albumMeta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  saveButton: {
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  savedButton: {
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#000',
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  savedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  songImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
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
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#000',
  },
  playlistModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  playlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  playlistTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  playlistItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  playlistItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  playlistItemSongs: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default AlbumDetailsScreen;

