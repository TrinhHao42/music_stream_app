import { FlatList, Image, StyleSheet, Text, View } from 'react-native';

const data = [
  { id: '1', title: 'Song 1', image: require('../../assets/images/My Library/Image 101.png') },
  { id: '2', title: 'Song 2', image: require('../../assets/images/My Library/Image 102.png') },
  { id: '3', title: 'Song 3', image: require('../../assets/images/My Library/Image 103.png') },
  { id: '4', title: 'Song 4', image: require('../../assets/images/My Library/Image 104.png') },
  { id: '5', title: 'Song 5', image: require('../../assets/images/My Library/Image 105.png') },
  { id: '6', title: 'Song 6', image: require('../../assets/images/My Library/Image 106.png') },
];

export default function MyLibrary() {
  return (
    <>
      <Text style={styles.header}>My Library</Text>
      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16 }}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={item.image} style={styles.img} />
            <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
          </View>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: '700', padding: 16 },
  card: { flex: 1, margin: 8, alignItems: 'center' },
  img: { width: 150, height: 150, borderRadius: 8, backgroundColor: '#eee' },
  title: { marginTop: 8, fontSize: 14 },
});
