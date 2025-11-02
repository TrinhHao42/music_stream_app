import { Artist, Song } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";

type SearchItem = Artist | Song;

const ARTISTS: Artist[] = [
  {
    id: "a1",
    name: "Jessica Gonzalez",
    image: require("@/assets/images/Feed - Audio Listing/Avatar 4.png"),
    followers: 2300000,
    type: "artist",
  },
  {
    id: "a2",
    name: "William King",
    image: require("@/assets/images/Feed - Audio Listing/Avatar 5.png"),
    followers: 1800000,
    type: "artist",
  },
];

const SONGS: Song[] = [
  {
    id: "s1",
    title: "FLOWER",
    image: require("@/assets/images/Home - Audio Listing/Image 41.png"),
    artistName: "Jessica Gonzalez",
    views: 125000,
    duration: "05:15",
    type: "song",
  },
  {
    id: "s2",
    title: "Me",
    image: require("@/assets/images/Feed - Audio Listing/Image 94.png"),
    artistName: "William King",
    views: 245000,
    duration: "05:15",
    type: "song",
  },
];

const SearchScreen = () => {
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const { artistResults, songResults } = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { artistResults: ARTISTS, songResults: SONGS };
    return {
      artistResults: ARTISTS.filter((a) => a.name.toLowerCase().includes(q)),
      songResults: SONGS.filter(
        (s) => s.title.toLowerCase().includes(q) || s.artistName.toLowerCase().includes(q)
      ),
    };
  }, [query]);

  const clear = () => setQuery("");

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh data here if needed
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderRow = (item: SearchItem) => (
    <View style={styles.row}>
      <Image source={"name" in item ? item.image : item.image} style={styles.thumbnail} contentFit="cover" transition={0} cachePolicy="memory-disk" />
      <View style={{ flex: 1 }}>
        <Text style={styles.primaryText}>{"name" in item ? item.name : item.title}</Text>
        <Text style={styles.secondaryText}>
          {"name" in item ? "Artist" : item.artistName}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#687076" />
        <TextInput
          style={styles.input}
          placeholder="Search for songs or artists"
          placeholderTextColor="#9BA1A6"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Ionicons name="close" size={18} color="#687076" onPress={clear} />
        )}
      </View>

      <FlatList
        data={[{ key: "artists" }, { key: "songs" }]}
        keyExtractor={(s) => s.key}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#9333EA"
            colors={['#9333EA']}
          />
        }
        renderItem={({ item }) => (
          <View>
            <Text style={styles.sectionTitle}>{item.key === "artists" ? "Artists" : "Songs"}</Text>
            <FlatList
              data={item.key === "artists" ? (artistResults as SearchItem[]) : (songResults as SearchItem[])}
              keyExtractor={(i) => ("name" in i ? i.id : i.id)}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item: it }) => renderRow(it)}
              scrollEnabled={false}
            />
            <View style={{ height: 12 }} />
          </View>
        )}
      />
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
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  separator: { height: 1, backgroundColor: "#F0F2F3" },
  row: { paddingVertical: 12, flexDirection: "row", alignItems: "center" },
  thumbnail: { width: 40, height: 40, borderRadius: 8, marginRight: 12 },
  primaryText: { fontSize: 16, color: "#11181C", fontWeight: "600" },
  secondaryText: { fontSize: 13, color: "#687076", marginTop: 2 },
  sectionTitle: { fontSize: 14, color: "#687076", fontWeight: "600", marginBottom: 8 },
});

export default SearchScreen
