import { addArtistToLibrary, addSongToLibrary, addSongToPlaylist, getAlbumByName, getSongByName, getUserPlaylists } from '@/api/musicApi';
import { useAuth } from '@/contexts/AuthContext';
import { Playlist, Song } from '@/types';
import Artist from '@/types/Artist';
import formatCompactNumber from '@/utils/FormatCompactNumber';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ArtistProfile() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingSongTitle, setLoadingSongTitle] = useState<string | null>(null);
  const [loadingAlbumName, setLoadingAlbumName] = useState<string | null>(null);
  const [followingArtist, setFollowingArtist] = useState(false);
  
  // States for menu and playlist modal
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistModalVisible, setPlaylistModalVisible] = useState(false);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);

  // Parse artist from params
  if (!params.artist) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#999' }}>Artist not found</Text>
        </View>
      </View>
    );
  }

  let artist: Artist;
  try {
    artist = JSON.parse(params.artist as string);
  } catch (error) {
    console.error('Error parsing artist:', error);
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#999' }}>Error loading artist</Text>
        </View>
      </View>
    );
  }

  const handleFollow = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login to follow artists');
      return;
    }

    if (isFollowing) {
      // Already following, could implement unfollow
      setIsFollowing(false);
      return;
    }

    setFollowingArtist(true);
    try {
      const success = await addArtistToLibrary(user.userId, artist.artistId);
      if (success) {
        setIsFollowing(true);
        Alert.alert('Success', 'Artist added to library');
      } else {
        Alert.alert('Error', 'Failed to follow artist');
      }
    } catch (error) {
      console.error('Error following artist:', error);
      Alert.alert('Error', 'Failed to follow artist');
    } finally {
      setFollowingArtist(false);
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
        {/* Artist Info */}
        <View style={styles.artistInfo}>
          <Image
            source={artist.artistImage ? { uri: artist.artistImage } : require('../../assets/images/Artist Profile/Image 63.png')}
            style={styles.avatar}
            contentFit="cover"
            transition={0}
            cachePolicy="memory-disk"
          />
          <Text style={styles.artistName}>{artist.artistName}</Text>
          <Text style={styles.followers}>{formatCompactNumber(artist.followers)} Followers</Text>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={isFollowing ? styles.followingButton : styles.followButton}
              onPress={handleFollow}
              disabled={followingArtist}
            >
              {followingArtist ? (
                <ActivityIndicator size="small" color={isFollowing ? "#4CAF50" : "#000"} />
              ) : (
                <Text style={isFollowing ? styles.followingText : styles.followText}>
                  {isFollowing ? 'Following' : 'Follow'}
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

        {/* Popular Songs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular</Text>
          {artist.songs && artist.songs.length > 0 ? (
            <FlatList
              data={artist.songs}
              scrollEnabled={false}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.songItem}
                  onPress={async () => {
                    setLoadingSongTitle(item.title);
                    try {
                      const fullSong = await getSongByName(item.title);
                      if (fullSong) {
                        router.push({
                          pathname: '/play-audio',
                          params: { song: JSON.stringify(fullSong) }
                        });
                      } else {
                        Alert.alert('Error', 'Song not found');
                      }
                    } catch (error) {
                      Alert.alert('Error', 'Failed to load song');
                      console.error('Error loading song:', error);
                    } finally {
                      setLoadingSongTitle(null);
                    }
                  }}
                  disabled={loadingSongTitle === item.title}
                >
                  <Image
                    source={item.coverUrl ? { uri: item.coverUrl } : require('../../assets/images/Artist Profile/Image 66.png')}
                    style={styles.songImage}
                    contentFit="cover"
                    transition={0}
                    cachePolicy="memory-disk"
                  />
                  <View style={styles.songInfo}>
                    <Text style={styles.songTitle}>{item.title}</Text>
                    <Text style={styles.songArtist}>{artist.artistName}</Text>
                  </View>
                  {loadingSongTitle === item.title ? (
                    <ActivityIndicator size="small" color="#666" />
                  ) : (
                    <TouchableOpacity
                      onPress={async () => {
                        setLoadingSongTitle(item.title);
                        const fullSong = await getSongByName(item.title);
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
              )}
              keyExtractor={(item, index) => `${item.title}-${index}`}
            />
          ) : (
            <Text style={styles.emptyText}>No songs available</Text>
          )}
        </View>

        {/* Albums */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Albums</Text>
          {artist.albums && artist.albums.length > 0 ? (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={artist.albums}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.albumCard}
                  onPress={async () => {
                    setLoadingAlbumName(item.albumName);
                    try {
                      const fullAlbum = await getAlbumByName(item.albumName);
                      if (fullAlbum) {
                        router.push({
                          pathname: '/album-details',
                          params: { album: JSON.stringify(fullAlbum) }
                        });
                      } else {
                        Alert.alert('Error', 'Album not found');
                      }
                    } catch (error) {
                      Alert.alert('Error', 'Failed to load album');
                      console.error('Error loading album:', error);
                    } finally {
                      setLoadingAlbumName(null);
                    }
                  }}
                  disabled={loadingAlbumName === item.albumName}
                >
                  <Image
                    source={item.image ? { uri: item.image } : require('../../assets/images/Artist Profile/Image 71.png')}
                    style={styles.albumImage}
                    contentFit="cover"
                    transition={0}
                    cachePolicy="memory-disk"
                  />
                  {loadingAlbumName === item.albumName && (
                    <View style={{ position: 'absolute', top: 70, left: 70 }}>
                      <ActivityIndicator size="small" color="#000" />
                    </View>
                  )}
                  <Text style={styles.albumTitle}>{item.albumName}</Text>
                  <Text style={styles.albumArtist}>{artist.artistName}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => `${item.albumName}-${index}`}
              contentContainerStyle={styles.albumList}
            />
          ) : (
            <Text style={styles.emptyText}>No albums available</Text>
          )}
        </View>
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
}

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
  artistInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 16,
  },
  artistName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  followers: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  followButton: {
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  followingButton: {
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#000',
  },
  followText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  followingText: {
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
  songMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playText: {
    fontSize: 12,
    color: '#666',
  },
  songDuration: {
    fontSize: 12,
    color: '#666',
  },
  dot: {
    fontSize: 14,
    color: '#999',
    marginHorizontal: 4,
  },
  albumList: {
    paddingRight: 16,
  },
  albumCard: {
    width: 160,
    marginRight: 12,
  },
  albumImage: {
    width: 160,
    height: 160,
    borderRadius: 12,
    marginBottom: 8,
  },
  albumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  albumArtist: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  aboutImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 8,
  },
  viewMore: {
    fontSize: 14,
    color: '#00B8D4',
    fontWeight: '600',
  },
  relatedCard: {
    width: 160,
    marginRight: 12,
  },
  relatedImage: {
    width: 160,
    height: 160,
    borderRadius: 12,
    marginBottom: 8,
  },
  relatedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  relatedArtist: {
    fontSize: 14,
    color: '#666',
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

