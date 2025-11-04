import { Ionicons } from '@expo/vector-icons';
import { Directory, File, Paths } from 'expo-file-system';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type DownloadedSong = {
  file: File;
  name: string;
  size: number;
};

export default function DownloadedSongs() {
  const router = useRouter();
  const [songs, setSongs] = useState<DownloadedSong[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDownloadedSongs();
  }, []);

  const loadDownloadedSongs = async () => {
    try {
      setIsLoading(true);
      const directory = new Directory(Paths.document);
      
      // List all files in directory
      const files = await directory.list();
      
      // Filter only mp3 files
      const mp3Files = files.filter(item => item.name.endsWith('.mp3') && item instanceof File);
      
      // Get file info
      const songList: DownloadedSong[] = mp3Files.map(item => {
        const file = item as File;
        return {
          file: file,
          name: file.name.replace('.mp3', '').replace(/_/g, ' '),
          size: file.size || 0,
        };
      });

      setSongs(songList);
    } catch (error) {
      console.error('Error loading downloaded songs:', error);
      Alert.alert('Error', 'Failed to load downloaded songs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSong = (song: DownloadedSong) => {
    Alert.alert(
      'Delete Song',
      `Are you sure you want to delete "${song.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await song.file.delete();
              Alert.alert('Success', 'Song deleted successfully');
              loadDownloadedSongs(); // Reload list
            } catch (error) {
              console.error('Error deleting song:', error);
              Alert.alert('Error', 'Failed to delete song');
            }
          }
        }
      ]
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Downloaded Songs</Text>
        <TouchableOpacity onPress={loadDownloadedSongs}>
          <Ionicons name="refresh" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      ) : songs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="musical-notes-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No downloaded songs</Text>
          <Text style={styles.emptySubtext}>
            Download songs to listen offline
          </Text>
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.file.uri}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.songItem}>
              <View style={styles.songIconContainer}>
                <Ionicons name="musical-note" size={24} color="#9333EA" />
              </View>
              
              <View style={styles.songInfo}>
                <Text style={styles.songName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.songDetails}>
                  {formatFileSize(item.size)}
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteSong(item)}
              >
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* Stats Footer */}
      {songs.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {songs.length} {songs.length === 1 ? 'song' : 'songs'} downloaded
          </Text>
          <Text style={styles.footerText}>
            Total: {formatFileSize(songs.reduce((sum, song) => sum + song.size, 0))}
          </Text>
        </View>
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  songIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  songInfo: {
    flex: 1,
  },
  songName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  songDetails: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#F9F9F9',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});
