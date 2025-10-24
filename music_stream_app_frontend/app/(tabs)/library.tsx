import LibraryAlbumItem from '@/components/CartAlbumItem';
import LibraryArtistItem from '@/components/CartArtistItem';
import LibrarySongItem from '@/components/CartSongItem';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Animated, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Song = {
  id: string;
  title: string;
  image: any;
  artistName: string;
  views: number;
  duration: string;
  type: 'song';
};

type Album = {
  id: string;
  title: string;
  artistName: string;
  numOfSongs: number;
  image: any;
  type: 'album';
};

type Artist = {
  id: string;
  title: string;
  image: any;
  followers: number;
  type: 'artist';
};

type LibraryItem = Song | Album | Artist;

const LibraryScreen = () => {
  const data: LibraryItem[] = [
    {
      id: '1',
      title: 'Mer Waston',
      image: require('../../assets/images/My Library/Image 107.png'),
      followers: 2300000,
      type: 'artist',
    },
    {
      id: '2',
      title: 'FLOWER',
      image: require('../../assets/images/My Library/Image 101.png'),
      artistName: 'Jessica Gonzalez',
      views: 1000000,
      duration: '3:15',
      type: 'song',
    },
    {
      id: '3',
      title: 'Shape of You',
      image: require('../../assets/images/My Library/Image 102.png'),
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
      image: require('../../assets/images/My Library/Image 103.png'),
      type: 'album',
    },
    {
      id: '5',
      title: 'Levitating',
      image: require('../../assets/images/My Library/Image 104.png'),
      artistName: 'Anthony Taylor',
      views: 2000000,
      duration: '3:23',
      type: 'song',
    },
    {
      id: '6',
      title: 'Astronaut in the Ocean',
      image: require('../../assets/images/My Library/Image 105.png'),
      artistName: 'Pedro Moreno',
      views: 3000000,
      duration: '2:45',
      type: 'song',
    },
    {
      id: '7',
      title: 'Dynamite',
      image: require('../../assets/images/My Library/Image 106.png'),
      artistName: 'Elena Jimenez',
      views: 4000000,
      duration: '3:19',
      type: 'song',
    },
  ];

  const categories = ['Playlists', 'New tag', 'Songs', 'Albums', 'Artists'];

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>My Library</Text>
        <TouchableOpacity>
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

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.floatList}
        numColumns={1}
        renderItem={({ item }) => {
          switch (item.type) {
            case 'song':
              return (
                <LibrarySongItem
                  title={item.title}
                  artistName={item.artistName}
                  views={item.views}
                  duration={item.duration}
                  image={item.image}
                />
              );
            case 'album':
              return <LibraryAlbumItem title={item.title} artistName={item.artistName} numOfSongs={item.numOfSongs} image={item.image} />;
            case 'artist':
              return (
                <LibraryArtistItem
                  name={item.title}
                  image={item.image}
                  followers={item.followers}
                />
              );
            default:
              return null;
          }
        }}
      />
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
  floatList: {
    flexDirection: 'column',
    gap: 16,
  },
  categoryList: {
    padding: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  category: {
    marginRight: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#eee',
    borderRadius: 19,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LibraryScreen;
