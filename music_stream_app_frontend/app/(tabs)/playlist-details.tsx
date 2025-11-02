import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getSongs } from '@/api/musicApi';
import { Song } from '@/types';

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

export default function PlaylistDetails() {
  const router = useRouter();
  const params = useLocalSearchParams<{ title: string; subtitle?: string }>();
  const [songs, setSongs] = useState<Song[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const data = await getSongs(0, 50);
      setSongs(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const totalDuration = songs.reduce((sum, song) => sum + song.duration, 0);
  const totalDurationStr = formatDuration(totalDuration);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Playlist Info */}
      <View style={styles.playlistInfo}>
        <View style={styles.playlistImageContainer}>
          <View style={styles.playlistImagePlaceholder}>
            <Ionicons name="musical-notes" size={60} color="#9333EA" />
          </View>
        </View>
        <View style={styles.playlistDetails}>
          <Text style={styles.playlistTitle}>{params.title || 'Top 50'}</Text>
          <View style={styles.playlistMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>{songs.length} songs</Text>
            </View>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.metaText}>{totalDurationStr}</Text>
          </View>
          <Text style={styles.description}>{params.subtitle || 'Daily chart-toppers update'}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="shuffle" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.playButton}>
          <Ionicons name="play" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Songs List */}
      <FlatList
        data={songs}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#9333EA"
            colors={['#9333EA']}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.songItem}
            onPress={() => router.push({ pathname: '/play-audio', params: { song: JSON.stringify(item) } })}
          >
            <Image source={item.coverUrl ? { uri: item.coverUrl } : require('../../assets/images/Home - Audio Listing/Image 36.png')} style={styles.songImage} contentFit="cover" transition={0} cachePolicy="memory-disk" />
            <View style={styles.songInfo}>
              <Text style={styles.songTitle}>{item.title}</Text>
              <Text style={styles.songArtist}>{item.artist.join(', ')}</Text>
            </View>
            <View style={styles.songMeta}>
              <View style={styles.playInfo}>
                <Ionicons name="play" size={12} color="#666" />
                <Text style={styles.playText}>{formatNumber(item.listens)}</Text>
              </View>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.songDuration}>{formatDuration(item.duration)}</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.songId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16 },
  playlistInfo: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 20 },
  playlistImageContainer: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  playlistImage: { width: 150, height: 150, borderRadius: 12 },
  playlistImagePlaceholder: { width: 150, height: 150, borderRadius: 12, backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center' },
  playlistDetails: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  playlistTitle: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 8 },
  playlistMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 14, color: '#666' },
  dot: { fontSize: 14, color: '#999', marginHorizontal: 8 },
  description: { fontSize: 12, color: '#999' },
  actionButtons: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16, gap: 12 },
  actionButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  playButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', marginLeft: 'auto' },
  listContent: { paddingBottom: 100 },
  songItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  songImage: { width: 56, height: 56, borderRadius: 8 },
  songInfo: { flex: 1 },
  songTitle: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 4 },
  songArtist: { fontSize: 14, color: '#666' },
  songMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  playInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  playText: { fontSize: 12, color: '#666' },
  songDuration: { fontSize: 12, color: '#666' },
});

