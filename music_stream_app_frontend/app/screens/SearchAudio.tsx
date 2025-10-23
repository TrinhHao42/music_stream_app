import { FlatList, Image, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

const results = new Array(6).fill(0).map((_, i) => ({ id: String(i), title: `Result ${i + 1}`, image: require('../../assets/images/Search Audio/Search Audio.png') }));

export default function SearchAudio() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput placeholder="Search" style={styles.input} />
      </View>

      <FlatList
        data={results}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image source={item.image} style={styles.img} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>Artist Name</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchBox: { padding: 12 },
  input: { backgroundColor: '#f3f3f3', padding: 10, borderRadius: 8 },
  row: { flexDirection: 'row', paddingVertical: 10, alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  img: { width: 56, height: 56, borderRadius: 6 },
  title: { fontWeight: '600' },
  subtitle: { color: '#666' },
});
