import Entypo from '@expo/vector-icons/Entypo';
import { Image } from 'expo-image';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const playlists = [
  { id: '1', title: 'Ipsum sit nulla', artist: "Ashley Scott", songs: 12, image: require('../../assets/images/My Playlists/Image 110.png') },
  { id: '2', title: 'Occaecat aliq', artist: "Jose Garcia", songs: 4, image: require('../../assets/images/My Playlists/Image 111.png') },
  ];

export default function MyPlaylists() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Playlists</Text>
      <FlatList
        data={playlists}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} activeOpacity={0.8}>
            <Image source={item.image} style={styles.img} contentFit="cover" transition={0} cachePolicy="memory-disk" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.title}>{item.title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Text style={styles.subtitle}>{item.artist}</Text>
                <Entypo name="dot-single" size={24} color="gray" />
                <Text style={styles.subtitle}>{item.songs} songs</Text>
              </View>
            </View>
            <Entypo name="chevron-right" size={24} color="gray" />
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
        <Entypo name="plus" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', position: 'relative' },
  header: { fontSize: 22, fontWeight: '700', padding: 16 },
  row: { flexDirection: 'row', padding: 12, alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  img: { width: 64, height: 64, borderRadius: 8, backgroundColor: '#ddd' },
  title: { fontSize: 16, fontWeight: '600' },
  subtitle: { fontSize: 13, color: '#666' },
  addButton: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }
});
