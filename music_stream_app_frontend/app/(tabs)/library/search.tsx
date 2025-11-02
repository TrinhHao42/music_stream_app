import { Album, Artist, Song } from '@/types';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDebounce } from 'use-debounce';

type SearchResult = Song | Album | Artist;

const SearchScreen = () => {
  const navigation = useNavigation();
  const inputSearchRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [debouncedSearchText] = useDebounce(searchText, 300);
  const [refreshing, setRefreshing] = useState(false);
  const [searchData, setSearchData] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (debouncedSearchText) {
      const filteredResults = searchData.filter(item =>
        item.type === 'artist' ? item.artistName :
          item.type === 'song' ? item.title :
            item.albumName
      );
      setResults(filteredResults);
    } else {
      setResults([]);
    }
  }, [debouncedSearchText]);

  const handleResetInput = () => {
    setSearchText('');
    inputSearchRef.current?.clear();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Re-filter results
    if (debouncedSearchText) {
      const filteredResults = searchData.filter(item =>
        item.type === 'artist' ? item.artistName :
          item.type === 'song' ? item.title :
            item.albumName
      );
      setResults(filteredResults);
    }
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>

        <View style={[styles.searchBox, isFocused && { borderColor: '#09bfd7' }]}>
          <TextInput
            ref={inputSearchRef}
            placeholder="Search"
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

      <FlatList
        data={results}
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
          <TouchableOpacity style={styles.row} activeOpacity={0.7}>
            <Text style={styles.title}>
              {
                item.type === 'artist' ? item.artistName :
                  item.type === 'song' ? item.title :
                    item.albumName
              }
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  backButton: {
    marginRight: 8,
  },

  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: '#f3f3f3',
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 12,
  },

  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },

  row: {
    flexDirection: 'row',
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },

  title: { fontSize: 15, color: 'gray' },
});

export default SearchScreen;
