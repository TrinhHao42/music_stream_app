import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function LaunchScreen() {
  const router = useRouter();
  return (
    <ImageBackground
      source={require("../assets/images/Launch-Screen/Image 30.png")}
      style={styles.bg}
      resizeMode="cover"
      blurRadius={2}
    >
      {/* Overlay tối */}
      <View style={styles.overlay} />

      {/* Container chính - căn giữa tất cả */}
      <View style={styles.mainContainer}>
        {/* Logo Spotify */}
        <View style={styles.spotifyLogo}>
          <FontAwesome name="spotify" size={60} color="#000" />
        </View>

        {/* Text chính */}
        <Text style={styles.mainText}>
          Millions of Songs.{"\n"}
          Free on Spotify.
        </Text>

        {/* Các nút đăng nhập */}
        <View style={styles.buttonsContainer}>
          {/* Nút Sign up free */}
          <TouchableOpacity
            style={styles.signupButton}
            activeOpacity={0.8}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.signupButtonText}>Sign up free</Text>
          </TouchableOpacity>
          
          {/* Link Log in */}
          <TouchableOpacity
            style={styles.loginLink}
            activeOpacity={0.7}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.loginLinkText}>Log in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    zIndex: 1,
  },
  spotifyLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  mainText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    lineHeight: 40,
    marginBottom: 40,
  },
  buttonsContainer: {
    width: "100%",
    gap: 12,
    marginTop: 20,
  },
  signupButton: {
    backgroundColor: "#1ED760",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  signupButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  socialButton: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  socialIcon: {
    position: "absolute",
    left: 16,
  },
  socialButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  loginLink: {
    paddingVertical: 8,
    alignItems: "center",
    marginTop: 8,
  },
  loginLinkText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
