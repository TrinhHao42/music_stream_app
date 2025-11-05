import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";

import { getAlbums, getArtists, getSongs } from "@/api/musicApi";
import { Album, Artist, Song } from "@/types";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [albums, setAlbums] = useState<Album[]>([]);
  const [forYouSongs, setForYouSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [albumsData, songsData, artistsData] = await Promise.all([
        getAlbums(),
        getSongs(0, 4),
        getArtists(0, 6),
      ]);
      setAlbums(albumsData);
      setForYouSongs(songsData);
      setArtists(artistsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Nếu chưa đăng nhập, hiển thị avatar mặc định
  const avatarSource = isLoggedIn
    ? require("@/assets/images/logo/user-line.png")
    : require("@/assets/images/logo/Frame1.png");

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require("@/assets/images/logo/Frame1.png")}
            style={styles.logo}
          />
          {isLoggedIn ? (
            <View>
              <Text style={styles.greeting}>Hello there,</Text>
              <Text
                
                style={styles.userName}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {user?.userName || "User"}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push("/launch" as any)}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.headerRight}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
          <TouchableOpacity
            onPress={() => router.push(isLoggedIn ? "/user" : "/launch")}
          >
            <Image
              source={avatarSource}
              style={styles.avatar}
              contentFit="cover"
              transition={0}
              cachePolicy="memory-disk"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8E8E93" />
        <TextInput
          placeholder="What you want to listen to"
          placeholderTextColor="#8E8E93"
          style={styles.searchInput}
        />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#9333EA"]}
            tintColor="#9333EA"
          />
        }
      >
        {/* Suggestions for you */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>For you</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {forYouSongs.map((song) => (
              <TouchableOpacity
                key={song.songId}
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: "/song-details",
                    params: { song: JSON.stringify(song) },
                  })
                }
              >
                <Image
                  source={
                    song.coverUrl
                      ? { uri: song.coverUrl }
                      : require("../../assets/images/Home - Audio Listing/Image 36.png")
                  }
                  style={styles.cardImage}
                  contentFit="cover"
                  transition={0}
                  cachePolicy="memory-disk"
                />
                <View style={styles.cardOverlay}>
                  <Text style={styles.cardTitle}>{song.title}</Text>
                  <Text style={styles.cardArtist}>
                    {song.artist?.[0] ?? "Unknown"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Charts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Charts</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            <TouchableOpacity
              style={[styles.chartCard, { backgroundColor: "#E8D5FF" }]}
              onPress={() =>
                router.push({
                  pathname: "/top-details",
                  params: {
                    title: "Top 50 - Canada",
                    subtitle: "Daily chart-toppers update",
                  },
                })
              }
            >
              <Text style={styles.chartNumber}>Top 50</Text>
              <Text style={styles.chartCountry}>Canada</Text>
              <Text style={styles.chartSubtitle}>
                Daily chart-toppers update
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chartCard, { backgroundColor: "#E0F2FE" }]}
              onPress={() =>
                router.push({
                  pathname: "/top-details",
                  params: {
                    title: "Top 50 - Global",
                    subtitle: "Daily chart-toppers update",
                  },
                })
              }
            >
              <Text style={styles.chartNumber}>Top 50</Text>
              <Text style={styles.chartCountry}>Global</Text>
              <Text style={styles.chartSubtitle}>
                Daily chart-toppers update
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chartCard, { backgroundColor: "#FEF3C7" }]}
              onPress={() =>
                router.push({
                  pathname: "/top-details",
                  params: {
                    title: "Top 50 - Trending",
                    subtitle: "Daily chart-toppers update",
                  },
                })
              }
            >
              <Text style={styles.chartNumber}>Top 50</Text>
              <Text style={styles.chartCountry}>Trending</Text>
              <Text style={styles.chartSubtitle}>
                Daily chart-toppers update
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Trending albums */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending albums</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {albums.map((alb) => (
              <TouchableOpacity
                key={alb.albumId}
                style={styles.albumCard}
                onPress={() =>
                  router.push({
                    pathname: "/album-details",
                    params: { album: JSON.stringify(alb) },
                  })
                }
              >
                <Image
                  source={
                    alb.image
                      ? { uri: alb.image }
                      : require("../../assets/images/Home - Audio Listing/Image 40.png")
                  }
                  style={styles.albumImage}
                  contentFit="cover"
                  transition={0}
                  cachePolicy="memory-disk"
                />
                <Text style={styles.albumTitle}>{alb.albumName}</Text>
                <Text style={styles.albumArtist}>
                  {alb.artists?.[0] ?? "Unknown"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Popular artists */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular artists</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {artists.map((artist) => (
              <TouchableOpacity
                key={artist.artistId}
                style={styles.artistCard}
                onPress={() =>
                  router.push({
                    pathname: "/artist-profile",
                    params: { artist: JSON.stringify(artist) },
                  })
                }
              >
                <Image
                  source={
                    artist.artistImage
                      ? { uri: artist.artistImage }
                      : require("../../assets/images/Artist Profile/Image 63.png")
                  }
                  style={styles.artistImagePlaceholder}
                  contentFit="cover"
                  transition={0}
                  cachePolicy="memory-disk"
                />
                <Text style={styles.artistName}>{artist.artistName}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
  },
  greeting: {
    fontSize: 14,
    color: "#666",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    maxWidth: 200,
  },
  loginButton: {
    backgroundColor: "#9333EA",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 25,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 30,
    height: 30,
  },
  logo: {
    width: 40,
    height: 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#000",
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginBottom: 12,
  },
  sectionTitle: {
    padding: 16,
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },

  horizontalScroll: {
    paddingLeft: 16,
  },
  card: {
    width: 200,
    height: 250,
    borderRadius: 12,
    marginRight: 12,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(147, 51, 234, 0.8)",
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  cardArtist: {
    fontSize: 14,
    color: "#fff",
  },
  chartCard: {
    width: 180,
    height: 140,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    justifyContent: "center",
  },
  chartNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  chartCountry: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  chartSubtitle: {
    fontSize: 12,
    color: "#666",
  },
  albumCard: {
    width: 160,
    marginRight: 12,
  },
  albumImage: {
    width: 160,
    height: 160,
    borderRadius: 12,
    marginBottom: 8,
  },
  albumTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  albumArtist: {
    fontSize: 14,
    color: "#666",
  },
  artistCard: {
    width: 140,
    marginRight: 12,
    alignItems: "center",
  },
  artistImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 12,
  },
  artistImagePlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  artistName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },
  followButton: {
    backgroundColor: "#000",
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
