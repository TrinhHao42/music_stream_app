import { searchArtists, searchSongs } from "@/api/musicApi";
import { Artist, Song } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SearchScreen = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [artistResults, setArtistResults] = useState<Artist[]>([]);
  const [songResults, setSongResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Debounce search - chờ 500ms sau khi user ngừng gõ mới search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        performSearch(query.trim());
      } else {
        setArtistResults([]);
        setSongResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const [artists, songs] = await Promise.all([
        searchArtists(searchQuery),
        searchSongs(searchQuery),
      ]);
      setArtistResults(artists);
      setSongResults(songs);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setQuery("");
    setArtistResults([]);
    setSongResults([]);
  };

  const onRefresh = async () => {
    if (!query.trim()) return;
    setRefreshing(true);
    await performSearch(query.trim());
    setRefreshing(false);
  };

  const handleArtistPress = useCallback((artist: Artist) => {
    router.push({
      pathname: "/artist-profile" as any,
      params: { artist: JSON.stringify(artist) },
    });
  }, [router]);

  const handleSongPress = useCallback((song: Song) => {
    router.push({
      pathname: "/song-details" as any,
      params: { song: JSON.stringify(song) },
    });
  }, [router]);

  const renderArtistRow = (artist: Artist) => (
    <TouchableOpacity
      key={artist.artistId}
      style={styles.row}
      onPress={() => handleArtistPress(artist)}
      activeOpacity={0.7}
    >
      <Image
        source={
          artist.artistImage
            ? { uri: artist.artistImage }
            : require("@/assets/images/Artist Profile/Image 63.png")
        }
        style={[styles.thumbnail, { borderRadius: 20 }]}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.primaryText} numberOfLines={1}>
          {artist.artistName}
        </Text>
        <Text style={styles.secondaryText}>
          {artist.followers ?? 0} followers
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9BA1A6" />
    </TouchableOpacity>
  );

  const renderSongRow = (song: Song) => (
    <TouchableOpacity
      key={song.songId}
      style={styles.row}
      onPress={() => handleSongPress(song)}
      activeOpacity={0.7}
    >
      <Image
        source={
          song.coverUrl
            ? { uri: song.coverUrl }
            : require("@/assets/images/Home - Audio Listing/Image 36.png")
        }
        style={styles.thumbnail}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.primaryText} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.secondaryText} numberOfLines={1}>
          {song.artist?.[0] ?? "Unknown Artist"}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9BA1A6" />
    </TouchableOpacity>
  );

  const hasResults = artistResults.length > 0 || songResults.length > 0;
  const showEmptyState = query.trim() && !loading && !hasResults;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#687076" />
        <TextInput
          style={styles.input}
          placeholder="Search for songs or artists..."
          placeholderTextColor="#9BA1A6"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clear}>
            <Ionicons name="close" size={18} color="#687076" />
          </TouchableOpacity>
        )}
      </View>

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9333EA" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      {/* Empty state - chưa search */}
      {!query.trim() && !loading && (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#E6E8EB" />
          <Text style={styles.emptyTitle}>Search for songs or artists...</Text>
          <Text style={styles.emptyText}>
            Enter the name of a song or artist to start searching
          </Text>
        </View>
      )}

      {/* Empty state - không có kết quả */}
      {showEmptyState && (
        <View style={styles.emptyContainer}>
          <Ionicons name="sad-outline" size={64} color="#E6E8EB" />
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptyText}>
            Try searching with a different keyword
          </Text>
        </View>
      )}

      {/* Results */}
      {hasResults && !loading && (
        <FlatList
          data={[{ key: "artists" }, { key: "songs" }]}
          keyExtractor={(s) => s.key}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#9333EA"
              colors={["#9333EA"]}
            />
          }
          renderItem={({ item }) => {
            const data =
              item.key === "artists" ? artistResults : songResults;
            if (data.length === 0) return null;

            return (
              <View>
                <Text style={styles.sectionTitle}>
                  {item.key === "artists" ? "Artist" : "Song"} ({data.length})
                </Text>
                <View style={styles.resultsList}>
                  {item.key === "artists"
                    ? artistResults.map(renderArtistRow)
                    : songResults.map(renderSongRow)}
                </View>
                <View style={{ height: 12 }} />
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  searchBar: {
    marginTop: 12,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6E8EB",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
  },
  input: { marginLeft: 8, flex: 1, fontSize: 16, color: "#11181C" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#687076",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#11181C",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#687076",
    textAlign: "center",
    lineHeight: 20,
  },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  sectionTitle: {
    fontSize: 16,
    color: "#11181C",
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 8,
  },
  resultsList: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6E8EB",
    borderRadius: 12,
    overflow: "hidden",
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E6E8EB",
  },
  thumbnail: { width: 48, height: 48, borderRadius: 8, marginRight: 12 },
  primaryText: { fontSize: 16, color: "#11181C", fontWeight: "600" },
  secondaryText: { fontSize: 13, color: "#687076", marginTop: 2 },
});

export default SearchScreen;
