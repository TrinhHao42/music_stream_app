import CartAlbumItem from '@/components/CartAlbumItem';
import CartArtistItem from '@/components/CartArtistItem';
import CartSongItem from '@/components/CartSongItem';
import { Album, Artist, Song } from '@/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

type LibraryItem = Song | Album | Artist | Playlist;

type Playlist = {
  id: string;
  title: string;
  image: any;
  songCount: number;
  type: 'playlist';
};

const LibraryScreen = () => {
  const categories = ['Playlists', 'New tag', 'Songs', 'Albums', 'Artists'];
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const handleRefreshing = () => {
    setRefreshing(true);

    const timeout = setTimeout(() => {
      setRefreshing(false);
    }, 1000);

    return () => clearTimeout(timeout);
  };

  const data: LibraryItem[] = [
    {
      id: 'p1',
      title: 'Top 50 - Canada',
      image: require('@/assets/images/Playlist Details - Audio Listing/Image 50.png'),
      songCount: 50,
      type: 'playlist',
    },
    {
      id: 'p2',
      title: 'My Favorites',
      image: require('@/assets/images/My Library/Image 101.png'),
      songCount: 24,
      type: 'playlist',
    },
    {
      id: '1',
      name: 'Mer Waston',
      image: require('@/assets/images/My Library/Image 107.png'),
      followers: 2300000,
      type: 'artist',
    },
    {
      id: '2',
      title: 'FLOWER',
      image: require('@/assets/images/My Library/Image 101.png'),
      artistName: 'Jessica Gonzalez',
      views: 1000000,
      duration: '3:15',
      type: 'song',
    },
    {
      id: '3',
      title: 'Shape of You',
      image: require('@/assets/images/My Library/Image 102.png'),
      artistName: 'Anthony Taylor',
      views: 1500000,
      duration: '4:24',
      type: 'song',
    },
    {
      id: '4',
      title: 'Blinding Lights',
      artistName: 'Ashley Scott',
      numOfSongs: 4,
      image: require('@/assets/images/My Library/Image 103.png'),
      type: 'album',
    },
    {
      id: '5',
      title: 'Levitating',
      image: require('@/assets/images/My Library/Image 104.png'),
      artistName: 'Anthony Taylor',
      views: 2000000,
      duration: '3:23',
      type: 'song',
    },
    {
      id: '6',
      title: 'Astronaut in the Ocean',
      image: require('@/assets/images/My Library/Image 105.png'),
      artistName: 'Pedro Moreno',
      views: 3000000,
      duration: '2:45',
      type: 'song',
    },
    {
      id: '7',
      title: 'Dynamite',
      image: require('@/assets/images/My Library/Image 106.png'),
      artistName: 'Elena Jimenez',
      views: 4000000,
      duration: '3:19',
      type: 'song',
    },
  ];

  const router = useRouter();

  // Filter data based on selected category
  const getFilteredData = () => {
    if (!selectedCategory) {
      return data; // Show all items when no filter is selected
    }
    
    switch (selectedCategory) {
      case 'Playlists':
        return data.filter((item) => item.type === 'playlist');
      case 'Songs':
        return data.filter((item) => item.type === 'song');
      case 'Albums':
        return data.filter((item) => item.type === 'album');
      case 'Artists':
        return data.filter((item) => item.type === 'artist');
      case 'New tag':
        // Filter items added recently (you can customize this logic)
        return data.slice(0, 3); // Example: show first 3 items
      default:
        return data; // Show all items
    }
  };

  const filteredData = getFilteredData();

  // Handle category selection - toggle if already selected
  const handleCategoryPress = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null); // Deselect if already selected
    } else {
      setSelectedCategory(category);
    }
  };

  // Clear filter
  const handleClearFilter = () => {
    setSelectedCategory(null);
  };

  const handleItemPress = (item: LibraryItem) => {
    switch (item.type) {
      case 'playlist':
        router.push('/playlist-details' as never);
        break;
      case 'song':
        router.push({
          pathname: '/play-audio',
          params: {
            title: item.title,
            artist: item.artistName,
            duration: item.duration,
          },
        } as never);
        break;
      case 'album':
        router.push('/album-details' as never);
        break;
      case 'artist':
        router.push('/artist-profile' as never);
        break;
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>My Library</Text>
          <TouchableOpacity
            onPress={() => router.push('library/search' as never)}
          >
            <Ionicons name="search-sharp" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          {selectedCategory && (
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={handleClearFilter}
              activeOpacity={0.6}
            >
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          )}
          
          <FlatList
            data={selectedCategory ? [selectedCategory] : categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[
                  styles.category,
                  selectedCategory === item && styles.categorySelected
                ]} 
                activeOpacity={0.6}
                onPress={() => handleCategoryPress(item)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === item && styles.categoryTextSelected
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
          />
        </View>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#09bfd7" />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => handleRefreshing()}
              colors={['#09bfd7']}
              tintColor="#09bfd7"
            />
          }
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.floatList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            switch (item.type) {
              case 'playlist':
                return (
                  <TouchableOpacity
                    style={styles.playlistItem}
                    onPress={() => handleItemPress(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.playlistImageContainer}>
                      <Image source={item.image} style={styles.playlistImage} />
                    </View>
                    <View style={styles.playlistInfo}>
                      <Text style={styles.playlistTitle}>{item.title}</Text>
                      <Text style={styles.playlistCount}>{item.songCount} songs</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </TouchableOpacity>
                );
              case 'song':
                return (
                  <TouchableOpacity onPress={() => handleItemPress(item)}>
                    <CartSongItem
                      title={item.title}
                      artistName={item.artistName}
                      views={item.views}
                      duration={item.duration}
                      image={item.image}
                    />
                  </TouchableOpacity>
                );
              case 'album':
                return (
                  <TouchableOpacity onPress={() => handleItemPress(item)}>
                    <CartAlbumItem
                      title={item.title}
                      artistName={item.artistName}
                      numOfSongs={item.numOfSongs}
                      image={item.image}
                    />
                  </TouchableOpacity>
                );
              case 'artist':
                return (
                  <TouchableOpacity onPress={() => handleItemPress(item)}>
                    <CartArtistItem
                      name={item.name}
                      image={item.image}
                      followers={item.followers}
                    />
                  </TouchableOpacity>
                );
              default:
                return null;
            }
          }}
          ListHeaderComponentStyle={{ marginBottom: 10 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  header: { fontSize: 22, fontWeight: '700' },

  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  clearButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  categoryList: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    height: 60,
    alignItems: 'center',
  },
  category: {
    marginRight: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#eee',
    borderRadius: 19,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categorySelected: {
    backgroundColor: '#1DB954',
  },
  categoryText: {
    fontWeight: 'bold',
    color: '#333',
  },
  categoryTextSelected: {
    color: '#fff',
  },

  floatList: {
    paddingBottom: 20,
    gap: 16,
  },

  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: '#fff',
  },
  playlistImageContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  playlistImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  playlistCount: {
    fontSize: 14,
    color: '#666',
  },
});

export default LibraryScreen;
