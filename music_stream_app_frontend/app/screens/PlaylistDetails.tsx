import { FlatList, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';

const tracks = new Array(8).fill(0).map((_, i) => ({ id: String(i), title: `Track ${i + 1}`, duration: '3:2' + i }));

export default function PlaylistDetails() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../assets/images/Playlist Details - Audio Listing/Image 50.png')} style={styles.img} />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.title}>Chill Vibes</Text>
          <Text style={styles.subtitle}>20 tracks</Text>
        </View>
      </View>

      <FlatList
        data={tracks}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.index}>{index + 1}</Text>
            <Text style={styles.track}>{item.title}</Text>
            <Text style={styles.duration}>{item.duration}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  img: { width: 90, height: 90, borderRadius: 8, backgroundColor: '#eee' },
  title: { fontSize: 18, fontWeight: '700' },
  subtitle: { color: '#666' },
  row: { flexDirection: 'row', paddingVertical: 10, alignItems: 'center' },
  index: { width: 24, color: '#666' },
  track: { flex: 1 },
  duration: { color: '#666' },
});
