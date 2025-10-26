import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Album from '../../types/Album';
import Artist from '../../types/Artist';
import Song from '../../types/Song';

// Dữ liệu mẫu
const mockSongs: Song[] = [
  { id: 1, title: 'In The Stars', artist: { id: 1, name: 'Benson Boone', flowers: 500, image: '' }, duration: 200, views: 1000000, image: '' },
  { id: 2, title: 'Me illum id aliquip', artist: { id: 2, name: 'Artist A', flowers: 300, image: '' }, duration: 180, views: 800000, image: '' },
  { id: 3, title: 'Me lorem', artist: { id: 3, name: 'Artist B', flowers: 200, image: '' }, duration: 210, views: 600000, image: '' },
];

const mockArtists: Artist[] = [
  { id: 1, name: 'Me Gonzalez', flowers: 500, image: '' },
  { id: 2, name: 'Me irure esse', flowers: 300, image: '' },
  { id: 3, name: 'Me Exercitation', flowers: 400, image: '' },
  { id: 4, name: 'Me Sint aliquip', flowers: 250, image: '' },
];

const mockAlbums: Album[] = [
  { id: 1, title: 'Me', artist: { id: 1, name: 'Jessica Gonzalez', flowers: 500, image: '' }, numsOfSongs: 12, image: '' },
];

const SearchScreen = () => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');

  // Lọc kết quả dựa trên text tìm kiếm
  const filteredResults = () => {
    if (!searchText) {
      return { songs: [], artists: [], albums: [] };
    }

    const lowerText = searchText.toLowerCase();
    
    const filteredSongs = mockSongs.filter(song => 
      song.title.toLowerCase().includes(lowerText) || 
      song.artist.name.toLowerCase().includes(lowerText)
    );

    const filteredArtists = mockArtists.filter(artist => 
      artist.name.toLowerCase().includes(lowerText)
    );

    const filteredAlbums = mockAlbums.filter(album => 
      album.title.toLowerCase().includes(lowerText) || 
      album.artist.name.toLowerCase().includes(lowerText)
    );

    return {
      songs: filteredSongs,
      artists: filteredArtists,
      albums: filteredAlbums,
    };
  };

  const results = filteredResults();
  const hasResults = results.songs.length > 0 || results.artists.length > 0 || results.albums.length > 0;

  const renderSong = (item: Song) => (
    <TouchableOpacity style={styles.resultItem} activeOpacity={0.7}>
      <Ionicons name="musical-notes" size={20} color="#9333EA" />
      <View style={styles.resultTextContainer}>
        <Text style={styles.resultTitle}>{item.title}</Text>
        <Text style={styles.resultSubtitle}>{item.artist.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderArtist = (item: Artist) => (
    <TouchableOpacity style={styles.resultItem} activeOpacity={0.7}>
      <Ionicons name="person" size={20} color="#9333EA" />
      <View style={styles.resultTextContainer}>
        <Text style={styles.resultTitle}>{item.name}</Text>
        <Text style={styles.resultSubtitle}>Artist</Text>
      </View>
    </TouchableOpacity>
  );

  const renderAlbum = (item: Album) => (
    <TouchableOpacity style={styles.resultItem} activeOpacity={0.7}>
      <Ionicons name="albums" size={20} color="#9333EA" />
      <View style={styles.resultTextContainer}>
        <Text style={styles.resultTitle}>{item.title}</Text>
        <Text style={styles.resultSubtitle}>{item.artist.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={[styles.searchBox, isFocused && styles.searchBoxFocused]}>
        <Ionicons name="search" size={20} color="#8E8E93" />
        <TextInput
          placeholder="Tìm kiếm bài hát, nghệ sĩ..."
          style={styles.input}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')} activeOpacity={0.6}>
            <Ionicons name="close-circle" size={24} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      {/* Kết quả tìm kiếm */}
      {searchText.length > 0 && hasResults && (
        <FlatList
          data={[
            ...results.songs.map(s => ({ type: 'song' as const, data: s })),
            ...results.artists.map(a => ({ type: 'artist' as const, data: a })),
            ...results.albums.map(a => ({ type: 'album' as const, data: a })),
          ]}
          keyExtractor={(item, index) => `${item.type}-${item.data.id}-${index}`}
          contentContainerStyle={styles.resultsContainer}
          renderItem={({ item }) => {
            if (item.type === 'song') return renderSong(item.data);
            if (item.type === 'artist') return renderArtist(item.data);
            if (item.type === 'album') return renderAlbum(item.data);
            return null;
          }}
        />
      )}

      {/* Không có kết quả */}
      {searchText.length > 0 && !hasResults && (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Không tìm thấy kết quả</Text>
          <Text style={styles.emptySubtext}>Thử tìm kiếm với từ khóa khác</Text>
        </View>
      )}

      {/* Gợi ý khi chưa nhập gì */}
      {searchText.length === 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Gợi ý tìm kiếm</Text>
          <FlatList
            data={['Me', 'me illum id aliquip', 'me lorem', 'Me Gonzalez', 'Me irure esse']}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.suggestionItem} 
                onPress={() => setSearchText(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => `suggestion-${index}`}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  searchBox: {
    margin: 16,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBoxFocused: {
    borderColor: '#9333EA',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  resultsContainer: {
    paddingHorizontal: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#666',
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 15,
    color: '#333',
  },
});

export default SearchScreen;