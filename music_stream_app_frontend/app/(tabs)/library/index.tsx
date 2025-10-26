import CartAlbumItem from '@/components/CartAlbumItem';
import CartArtistItem from '@/components/CartArtistItem';
import CartSongItem from '@/components/CartSongItem';
import { Album, Artist, Song } from '@/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

type LibraryItem = Song | Album | Artist;

const LibraryScreen = () => {
  const categories = ['Playlists', 'New tag', 'Songs', 'Albums', 'Artists'];
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const handleRefreshing = () => {
    setRefreshing(true);

    const timeout = setTimeout(() => {
      setRefreshing(false);
    }, 1000);

    return () => clearTimeout(timeout);
  };

  const data: LibraryItem[] = [
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

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      const timeout = setTimeout(() => setIsLoading(false), 1000);
      return () => clearTimeout(timeout);
    }, [])
  );

  const router = useRouter();

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

        <Animated.FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.category} activeOpacity={0.6}>
              <Text style={{ fontWeight: 'bold' }}>{item}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#09bfd7" />
        </View>
      ) : (
        <FlatList
          data={data}
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
              case 'song':
                return (
                  <CartSongItem
                    title={item.title}
                    artistName={item.artistName}
                    views={item.views}
                    duration={item.duration}
                    image={item.image}
                  />
                );
              case 'album':
                return (
                  <CartAlbumItem
                    title={item.title}
                    artistName={item.artistName}
                    numOfSongs={item.numOfSongs}
                    image={item.image}
                  />
                );
              case 'artist':
                return (
                  <CartArtistItem
                    name={item.name }
                    image={item.image}
                    followers={item.followers}
                  />
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

  floatList: {
    paddingBottom: 20,
    gap: 16,
  },
});

export default LibraryScreen;
