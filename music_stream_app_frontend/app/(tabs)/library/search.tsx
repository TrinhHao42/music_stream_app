import { getLibrary } from '@/api/musicApi';
import { useAuth } from '@/contexts/AuthContext';
import { Album, Artist, Song } from '@/types';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDebounce } from 'use-debounce';

type SearchResultItem = 
  | (Song & { type: 'song' })
  | (Album & { type: 'album' })
  | (Artist & { type: 'artist' })
  | ({ playlistId: string; playlistName: string; userId: string; songs: string[] } & { type: 'playlist' });

const SearchScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const inputSearchRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [debouncedSearchText] = useDebounce(searchText, 300);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [libraryData, setLibraryData] = useState<SearchResultItem[]>([]);

  // Load library data on mount
  useEffect(() => {
    loadLibraryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Filter results when search text changes
  useEffect(() => {
    if (debouncedSearchText.trim()) {
      const query = debouncedSearchText.toLowerCase();
      const filteredResults = libraryData.filter(item => {
        if (item.type === 'song') {
          return item.title?.toLowerCase().includes(query) || 
                 item.artist?.some(a => a.toLowerCase().includes(query));
        } else if (item.type === 'album') {
          return item.albumName?.toLowerCase().includes(query) || 
                 item.artists?.some(a => a.toLowerCase().includes(query));
        } else if (item.type === 'artist') {
          return item.artistName?.toLowerCase().includes(query);
        } else if (item.type === 'playlist') {
          return item.playlistName?.toLowerCase().includes(query);
        }
        return false;
      });
      setResults(filteredResults);
    } else {
      setResults([]);
    }
  }, [debouncedSearchText, libraryData]);

  const loadLibraryData = async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const library = await getLibrary(user.userId);
      
      if (library) {
        const allItems: SearchResultItem[] = [
          ...(library.favouriteSongs || []).map(song => ({ ...song, type: 'song' as const })),
          ...(library.favouriteAlbums || []).map(album => ({ ...album, type: 'album' as const })),
          ...(library.favouriteArtists || []).map(artist => ({ ...artist, type: 'artist' as const })),
          ...(library.favouritePlaylists || []).map(playlist => ({ ...playlist, type: 'playlist' as const })),
        ];
        setLibraryData(allItems);
      }
    } catch (error) {
      console.error('Error loading library:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetInput = () => {
    setSearchText('');
    inputSearchRef.current?.clear();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLibraryData();
    setRefreshing(false);
  };

  const handleItemPress = (item: SearchResultItem) => {
    if (item.type === 'song') {
      router.push({
        pathname: '/(tabs)/song-details',
        params: { song: JSON.stringify(item) },
      } as any);
    } else if (item.type === 'album') {
      router.push({
        pathname: '/(tabs)/album-details',
        params: { album: JSON.stringify(item) },
      } as any);
    } else if (item.type === 'artist') {
      router.push({
        pathname: '/(tabs)/artist-profile',
        params: { artist: JSON.stringify(item) },
      } as any);
    } else if (item.type === 'playlist') {
      router.push({
        pathname: '/(tabs)/library/playlist-details',
        params: { playlistId: item.playlistId },
      } as any);
    }
  };

  const getItemTitle = (item: SearchResultItem): string => {
    if (item.type === 'song') return item.title || 'Unknown Song';
    if (item.type === 'album') return item.albumName || 'Unknown Album';
    if (item.type === 'artist') return item.artistName || 'Unknown Artist';
    if (item.type === 'playlist') return item.playlistName || 'Unknown Playlist';
    return '';
  };

  const getItemSubtitle = (item: SearchResultItem): string => {
    if (item.type === 'song') return item.artist?.join(', ') || 'Unknown Artist';
    if (item.type === 'album') return item.artists?.join(', ') || 'Unknown Artist';
    if (item.type === 'artist') return 'Artist';
    if (item.type === 'playlist') return `${item.songs?.length || 0} songs`;
    return '';
  };

  const getItemImage = (item: SearchResultItem): string | null => {
    if (item.type === 'song') return item.coverUrl || null;
    if (item.type === 'album') return item.image || null;
    if (item.type === 'artist') return item.artistImage || null;
    return null;
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#9333EA" />
        <Text style={{ marginTop: 12, color: '#687076' }}>Loading library...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>

        <View style={[styles.searchBox, isFocused && { borderColor: '#667EEA' }]}>
          <Ionicons name="search" size={20} color="#8E8E93" style={{ marginRight: 8 }} />
          <TextInput
            ref={inputSearchRef}
            placeholder="Search in your library"
            autoFocus={true}
            style={styles.input}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            value={searchText}
            onChangeText={setSearchText}
          />

          {searchText.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={handleResetInput}
            >
              <Entypo name="cross" size={24} color="black" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {searchText.trim() === '' ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Search your library</Text>
          <Text style={styles.emptySubtitle}>
            Find songs, albums, artists, and playlists
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="sad-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptySubtitle}>
            Try searching with different keywords
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, index) => {
            if (item.type === 'song') return `song-${item.songId}-${index}`;
            if (item.type === 'album') return `album-${item.albumId}-${index}`;
            if (item.type === 'artist') return `artist-${item.artistId}-${index}`;
            if (item.type === 'playlist') return `playlist-${item.playlistId}-${index}`;
            return `item-${index}`;
          }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
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
              style={styles.resultItem} 
              activeOpacity={0.7}
              onPress={() => handleItemPress(item)}
            >
              <View style={styles.imageContainer}>
                {getItemImage(item) ? (
                  <Image
                    source={{ uri: getItemImage(item)! }}
                    style={[
                      styles.itemImage,
                      item.type === 'artist' && { borderRadius: 30 }
                    ]}
                    contentFit="cover"
                    transition={0}
                    cachePolicy="memory-disk"
                  />
                ) : (
                  <View style={[
                    styles.imagePlaceholder,
                    item.type === 'artist' && { borderRadius: 30 }
                  ]}>
                    <Ionicons 
                      name={
                        item.type === 'song' ? 'musical-note' :
                        item.type === 'album' ? 'disc' :
                        item.type === 'artist' ? 'person' :
                        'list'
                      } 
                      size={24} 
                      color="#9CA3AF" 
                    />
                  </View>
                )}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {getItemTitle(item)}
                </Text>
                <View style={styles.subtitleRow}>
                  <Text style={styles.itemType}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </Text>
                  <Text style={styles.itemSubtitle} numberOfLines={1}>
                    • {getItemSubtitle(item)}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingTop: 50,
    backgroundColor: '#fff',
  },

  backButton: {
    marginRight: 8,
    padding: 4,
  },

  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  input: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    color: '#000',
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },

  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },

  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },

  imageContainer: {
    width: 60,
    height: 60,
  },

  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },

  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },

  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },

  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  itemType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667EEA',
    textTransform: 'capitalize',
  },

  itemSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
});

export default SearchScreen;
