import { getDownloadStreamUrl, getDownloadToken } from '@/api/musicApi';
import Song from '@/types/Song';
import formatCompactNumber from '@/utils/FormatCompactNumber';
import { Ionicons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function SongDetails() {
  const router = useRouter();
  const params = useLocalSearchParams<{ song: string }>();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

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
        <View style={{ width: 28 }} />
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
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
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
});
