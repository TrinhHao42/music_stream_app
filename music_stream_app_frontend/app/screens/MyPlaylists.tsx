import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const playlists = [
  { id: '1', title: 'Playlist 1', image: require('../../assets/images/My Playlists/Image 110.png') },
  { id: '2', title: 'Playlist 2', image: require('../../assets/images/My Playlists/Image 111.png') },
  { id: '3', title: 'Playlist 3', image: require('../../assets/images/My Playlists/Image 110.png') },
  { id: '4', title: 'Playlist 4', image: require('../../assets/images/My Playlists/Image 111.png') },
  { id: '5', title: 'Playlist 5', image: require('../../assets/images/My Playlists/Image 110.png') },
];

export default function MyPlaylists() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>My Playlists</Text>
      <FlatList
        data={playlists}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} activeOpacity={0.8}>
            <Image source={item.image} style={styles.img} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>12 songs</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: '700', padding: 16 },
  row: { flexDirection: 'row', padding: 12, alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  img: { width: 64, height: 64, borderRadius: 8, backgroundColor: '#ddd' },
  title: { fontSize: 16, fontWeight: '600' },
  subtitle: { fontSize: 13, color: '#666' },
});
