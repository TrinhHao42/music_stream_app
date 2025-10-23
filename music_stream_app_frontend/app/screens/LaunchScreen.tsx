import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LaunchScreen() {
  return (
      <ImageBackground source={require('../../assets/images/Launch Screen/Image 33.png')} style={styles.bg} imageStyle={{ borderRadius: 20 }}>
        <View style={styles.inner}>
          <Text style={styles.title}>Welcome to Music</Text>
          <Text style={styles.subtitle}>Unlimited music selections</Text>
          <TouchableOpacity style={styles.button} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Get started</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  bg: { flex: 1, justifyContent: 'center', padding: 24 },
  inner: { backgroundColor: 'rgba(0,0,0,0.35)', padding: 20, borderRadius: 12 },
  title: { color: 'white', fontSize: 28, fontWeight: '700', marginBottom: 6 },
  subtitle: { color: 'white', fontSize: 16, marginBottom: 16 },
  button: { backgroundColor: '#00bcd4', paddingVertical: 12, borderRadius: 24, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '600' },
});
