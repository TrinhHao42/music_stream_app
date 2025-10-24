import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Animated, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const data = [
  { id: '1', title: 'Mer Waston', image: require('../../assets/images/My Library/Image 107.png'), type: 'artist' },
  { id: '2', title: 'FLOWER', image: require('../../assets/images/My Library/Image 101.png'), type: 'song' },
  { id: '3', title: 'Shape of You', image: require('../../assets/images/My Library/Image 102.png'), type: 'song' },
  { id: '4', title: 'Blinding  Lights', image: require('../../assets/images/My Library/Image 103.png'), type: 'album' },
  { id: '5', title: 'Levitating', image: require('../../assets/images/My Library/Image 104.png'), type: 'song' },
  { id: '6', title: 'Astronaut in the Ocean', image: require('../../assets/images/My Library/Image 105.png'), type: 'song' },
  { id: '7', title: 'Dynamite', image: require('../../assets/images/My Library/Image 106.png'), type: 'song' },
];

const categrories = ['Playlists', "New tag", "Songs", "Albums", "Artists"];

const MyLibrary = () => {
  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 }}>
        <Text style={styles.header}>My Library</Text>
        <TouchableOpacity>
          <Ionicons name="search-sharp" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <Animated.FlatList
        data={categrories}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.category} key={item} activeOpacity={0.5}>
            <Text>{item}</Text>
          </TouchableOpacity>
        )}
      />
      <FlatList
        data={data}
        contentContainerStyle={styles.floatList}
        numColumns={1}
        renderItem={({ item }) => {
          let icon;

          if (item.type === 'song') {
            icon = <AntDesign name="heart" size={24} color="#1ce5ff" />;
          } else if (item.type === 'album') {
            icon = <AntDesign name="right" size={24} color="black" />;
          } else if (item.type === 'artist') {
            icon = <View>
              <TouchableOpacity style={{ backgroundColor: 'black', borderRadius: 15, paddingHorizontal: 10, paddingVertical: 5 }}>
                <Text style={{ color: 'white' }}>Follow</Text>
              </TouchableOpacity>
            </View>
          }

          return (
            <TouchableOpacity style={styles.card} activeOpacity={0.8}>
              <Image source={item.image} style={styles.img} />
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
              </View>
              {icon}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: '700'},
  floatList: {
    flexDirection: 'column',
    gap: 16,
  },
  category: { marginRight: 15, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#eee', borderRadius: 20 },
  card: { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginVertical: 7 },
  img: { borderRadius: 8 },
  title: { fontSize: 17 },
});


export default MyLibrary;