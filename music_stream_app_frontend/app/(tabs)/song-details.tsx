import { addSongToLibrary, addSongToPlaylist, getDownloadStreamUrl, getDownloadToken, getLibrary, getUserPlaylists } from '@/api/musicApi';
import { useAuth } from '@/contexts/AuthContext';
import Song from '@/types/Song';
import formatCompactNumber from '@/utils/FormatCompactNumber';
import { Ionicons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Playlist = {
  playlistId: string;
  playlistName: string;
  userId: string;
  songs: string[];
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function SongDetails() {
  const router = useRouter();
  const params = useLocalSearchParams<{ song: string }>();
  const { isPremium, user } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  
  // Modal states
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<{
    addToFavorites: boolean;
    playlists: string[]; // array of playlist IDs
  }>({
    addToFavorites: false,
    playlists: [],
  });
  const [adding, setAdding] = useState(false);

  // Parse song from params
  if (!params.song) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#999' }}>Song not found</Text>
        </View>
      </View>
    );
  }

  let song: Song;
  try {
    song = JSON.parse(params.song as string);
  } catch (error) {
    console.error('Error parsing song:', error);
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#999' }}>Error loading song</Text>
        </View>
      </View>
    );
  }

  const handlePlaySong = () => {
    router.push({
      pathname: '/play-audio',
      params: { song: JSON.stringify(song) }
    });
  };

  // Xử lý mở modal thêm bài hát
  const handleOpenAddModal = async () => {
    if (!user) {
      Alert.alert('Login required', 'Please sign in to add songs');
      return;
    }
    
    setLoadingPlaylists(true);
    setAddModalVisible(true);
    
    try {
      // Load library để check favourite songs
      const library = await getLibrary(user.userId);
      const isFavorite = library?.favouriteSongs?.some(s => s.songId === song.songId) || false;
      
      // Load all user playlists
      const userPlaylists = await getUserPlaylists(user.userId);
      setPlaylists(userPlaylists);
      
      // Check which playlists already contain this song
      const playlistsWithSong = userPlaylists
        .filter(pl => pl.songs.includes(song.songId))
        .map(pl => pl.playlistId);
      
      // Set initial selections based on current state
      setSelectedOptions({
        addToFavorites: isFavorite,
        playlists: playlistsWithSong,
      });
    } catch (error) {
      console.error('Error loading playlists:', error);
      // Reset selections if error
      setSelectedOptions({
        addToFavorites: false,
        playlists: [],
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

  // Toggle playlist
  const togglePlaylist = (playlistId: string) => {
    setSelectedOptions(prev => {
      const isSelected = prev.playlists.includes(playlistId);
      return {
        ...prev,
        playlists: isSelected
          ? prev.playlists.filter(id => id !== playlistId)
          : [...prev.playlists, playlistId],
      };
    });
  };

  // Xử lý thêm bài hát vào các nơi đã chọn
  const handleAddSong = async () => {
    if (!user) return;

    const { addToFavorites, playlists: selectedPlaylists } = selectedOptions;
    
    // Check if at least one option is selected
    if (!addToFavorites && selectedPlaylists.length === 0) {
      Alert.alert('Notice', 'Please select at least one destination');
      return;
    }

    setAdding(true);
    const results: string[] = [];

    try {
      // Add to favorites
      if (addToFavorites) {
        try {
          const success = await addSongToLibrary(user.userId, song.songId);
          if (success) {
            results.push('✓ Added to favourites');
          } else {
            results.push('✗ Failed to add to favourites');
          }
        } catch {
          results.push('✗ Error adding to favourites');
        }
      }

      // Add to playlists
      for (const playlistId of selectedPlaylists) {
        const targetPlaylist = playlists.find(p => p.playlistId === playlistId);
        if (targetPlaylist) {
          try {
            const success = await addSongToPlaylist(playlistId, song.songId);
            if (success) {
              results.push(`✓ Added to "${targetPlaylist.playlistName}"`);
            } else {
              results.push(`✗ Failed to add to "${targetPlaylist.playlistName}"`);
            }
          } catch {
            results.push(`✗ Error adding to "${targetPlaylist.playlistName}"`);
          }
        }
      }

      // Show results
      Alert.alert('Result', results.join('\n'));
      setAddModalVisible(false);
    } catch (error) {
      console.error('Error adding song:', error);
      Alert.alert('Error', 'An error occurred while adding the song');
    } finally {
      setAdding(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      // Get download token
      const tokenResponse = await getDownloadToken(song.songId);
      if (!tokenResponse) {
        Alert.alert('Error', 'Failed to get download token');
        setIsDownloading(false);
        return;
      }

      // Get download URL
      const downloadUrl = getDownloadStreamUrl(tokenResponse.token);

      // Create file
      const fileName = `${song.title.replace(/[^a-z0-9]/gi, '_')}.mp3`;
      const file = new File(Paths.document, fileName);

      // Check if file already exists
      const fileExists = file.exists;
      if (fileExists) {
        Alert.alert(
          'File Exists',
          'This song has already been downloaded. Do you want to download it again?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setIsDownloading(false) },
            {
              text: 'Re-download',
              onPress: async () => {
                await file.delete();
                await downloadFile(downloadUrl, file);
              }
            }
          ]
        );
        return;
      }

      await downloadFile(downloadUrl, file);
    } catch (error) {
      console.error('Error downloading song:', error);
      Alert.alert('Error', 'Failed to download song');
      setIsDownloading(false);
    }
  };

  const downloadFile = async (downloadUrl: string, file: File) => {
    try {
      // Download file using fetch
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);

          // Write to file
          await file.write(uint8Array);

          Alert.alert('Success', 'Song downloaded successfully!');
          console.log('Downloaded to:', file.uri);
        } catch (error) {
          console.error('Write error:', error);
          Alert.alert('Error', 'Failed to save file');
        } finally {
          setIsDownloading(false);
          setDownloadProgress(0);
        }
      };

      reader.readAsArrayBuffer(blob);
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download file');
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Song Details</Text>
        <TouchableOpacity onPress={handleOpenAddModal}>
          <Ionicons name="add-circle" size={28} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Song Cover */}
        <View style={styles.coverContainer}>
          <Image
            source={song.coverUrl ? { uri: song.coverUrl } : require('@/assets/images/Home - Audio Listing/Image 36.png')}
            style={styles.coverImage}
            contentFit="cover"
            transition={0}
            cachePolicy="memory-disk"
          />
        </View>

        {/* Song Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.songTitle}>{song.title}</Text>
          <Text style={styles.artistName}>
            {Array.isArray(song.artist) ? song.artist.join(', ') : song.artist || 'Unknown Artist'}
          </Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="play" size={16} color="#666" />
              <Text style={styles.statText}>{formatCompactNumber(song.listens || 0)} plays</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="heart" size={16} color="#666" />
              <Text style={styles.statText}>{formatCompactNumber(song.likes || 0)} likes</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time" size={16} color="#666" />
              <Text style={styles.statText}>{formatDuration(song.duration)}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlaySong}
            >
              <Ionicons name="play" size={24} color="#fff" />
              <Text style={styles.playButtonText}>Play</Text>
            </TouchableOpacity>

            {
              isPremium && (
                <TouchableOpacity
                  style={[styles.downloadButton, isDownloading && styles.downloadingButton]}
                  onPress={handleDownload}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <>
                      <Ionicons name="hourglass" size={24} color="#000" />
                      <Text style={styles.downloadButtonText}>
                        {downloadProgress > 0 ? `${Math.round(downloadProgress)}%` : 'Downloading...'}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="download" size={24} color="#000" />
                      <Text style={styles.downloadButtonText}>Download</Text>
                    </>
                  )}
                </TouchableOpacity>
              )
            }
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

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
              <Text style={styles.modalTitle}>Add to</Text>
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
                  <Text style={styles.optionText}>Favourites</Text>
                </TouchableOpacity>

                {/* Playlists */}
                {playlists.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Playlists</Text>
                    {playlists.map((pl) => (
                      <TouchableOpacity 
                        key={pl.playlistId}
                        style={styles.optionItem}
                        onPress={() => togglePlaylist(pl.playlistId)}
                      >
                        <Ionicons 
                          name={selectedOptions.playlists.includes(pl.playlistId) ? "checkbox" : "square-outline"} 
                          size={24} 
                          color={selectedOptions.playlists.includes(pl.playlistId) ? "#1ce5ff" : "#999"} 
                        />
                        <Ionicons name="list" size={20} color="#666" style={styles.optionIcon} />
                        <Text style={styles.optionText}>{pl.playlistName}</Text>
                        <Text style={styles.modalSongCount}>({pl.songs?.length || 0})</Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}

                {playlists.length === 0 && !loadingPlaylists && (
                  <Text style={styles.emptyText}>No playlists yet. Create a new one!</Text>
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
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddSong}
                disabled={adding}
              >
                {adding ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Add</Text>
                )}
              </TouchableOpacity>
            </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  coverContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  coverImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
  },
  infoContainer: {
    paddingHorizontal: 20,
  },
  songTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  artistName: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 30,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  playButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8,
  },
  downloadingButton: {
    backgroundColor: '#E0E0E0',
  },
  downloadButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  detailsSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
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
  modalSongCount: {
    fontSize: 14,
    color: '#999',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
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
