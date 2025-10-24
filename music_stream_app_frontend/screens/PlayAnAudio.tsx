import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PlayAnAudio() {
  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('../../assets/images/Play an Audio/Image 58.png')} style={styles.art} />
      <Text style={styles.title}>Track Title</Text>
      <Text style={styles.artist}>Artist Name</Text>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn}>
          <Text>⏮️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlBtn, styles.play]}>
          <Text style={{ color: 'white' }}>▶️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn}>
          <Text>⏭️</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  art: { width: 280, height: 280, borderRadius: 12, backgroundColor: '#eee' },
  title: { fontSize: 20, fontWeight: '700', marginTop: 16 },
  artist: { color: '#666', marginTop: 6 },
  controls: { flexDirection: 'row', marginTop: 24, alignItems: 'center' },
  controlBtn: { marginHorizontal: 18, padding: 12, borderRadius: 36, backgroundColor: '#f1f1f1' },
  play: { backgroundColor: '#111', paddingHorizontal: 22 },
});
