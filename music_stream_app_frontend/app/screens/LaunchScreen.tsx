import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LaunchScreen() {
  return (
    <ImageBackground source={require('../../assets/images/Launch Screen/Image 30.png')} style={styles.bg}>
      <Image source={require('../../assets/images/Launch Screen/Image 33.png')} style={styles.logo} />
      <Text style={{ textAlign: 'center', fontSize: 40, fontWeight: 'bold', marginTop: 'auto', lineHeight: 60, color: 'white' }}>
        Your music {"\n"}
        Your {"\n"}
        artists
      </Text>
      <View style={{ flexDirection: 'column', gap: 20, marginTop: 'auto', width: '100%' }}>
        <TouchableOpacity style={[styles.button, { backgroundColor: 'black' }]} activeOpacity={0.9}>
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>Create an account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: 'white' }]} activeOpacity={0.9}>
          <Text style={{ color: '#0ec1d8', textAlign: 'center', fontSize: 16 }}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, padding: 20, alignItems: 'center' },
  logo: { width: 80, height: 80, marginTop: 20 },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 25
  }
});
