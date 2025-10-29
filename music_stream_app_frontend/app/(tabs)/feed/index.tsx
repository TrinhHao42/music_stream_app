import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const posts = [
  {
    id: "1",
    user: {
      name: "Jessica Gonzalez",
      avatar: require("../../../assets/images/Feed - Audio Listing/Avatar 4.png"),
      verified: true,
    },
    action: "Posted a track",
    time: "3d",
    cover: require("../../../assets/images/Feed - Audio Listing/Image 93.png"),
    title: "FLOWER",
    artist: "Jessica Gonzalez",
    plays: 125,
    duration: "05:15",
    stats: { likes: 20, comments: 3, reposts: 1 },
  },
  {
    id: "2",
    user: {
      name: "William King",
      avatar: require("../../../assets/images/Feed - Audio Listing/Avatar 5.png"),
      verified: true,
    },
    action: "Posted a track",
    time: "5d",
    cover: require("../../../assets/images/Feed - Audio Listing/Image 94.png"),
    title: "Me",
    artist: "William King",
    plays: 245,
    duration: "05:15",
    stats: { likes: 45, comments: 9, reposts: 2 },
  },
];

const FeedScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Feed</Text>

      {posts.map((post) => (
        <View key={post.id} style={styles.card}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Image source={post.user.avatar} style={styles.avatar} contentFit="cover" transition={0} cachePolicy="memory-disk" />
              <View style={styles.headerTextWrap}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{post.user.name}</Text>
                  {post.user.verified && (
                    <Ionicons name="checkmark-circle" size={16} color="#2AA2F9" style={{ marginLeft: 6 }} />
                  )}
                </View>
                <View style={styles.subRow}>
                  <Text style={styles.subText}>{post.action}</Text>
                  <Ionicons name="ellipse" size={4} color="#9BA1A6" style={{ marginHorizontal: 6 }} />
                  <Text style={styles.subText}>{post.time}</Text>
                </View>
              </View>
            </View>
            <Feather name="more-horizontal" size={20} color="#9BA1A6" />
          </View>

          {/* Cover */}
          <View style={styles.coverWrap}>
            <Image source={post.cover} style={styles.cover} contentFit="cover" transition={0} cachePolicy="memory-disk" />
            <LinearGradient
              colors={["#00000000", "#00000099"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 0, y: 1 }}
              style={styles.coverGradient}
            />
            <View style={styles.coverInfo}>
              <Text style={styles.trackTitle}>{post.title}</Text>
              <View style={styles.artistRow}>
                <Text style={styles.artist}>{post.artist}</Text>
                <View style={styles.dot} />
                <Ionicons name="play" size={14} color="#FFFFFF" />
                <Text style={styles.playStat}>{post.plays}</Text>
                <View style={styles.dot} />
                <Text style={styles.playStat}>{post.duration}</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <Action icon={<Ionicons name="heart-outline" size={18} color="#687076" />} label={String(post.stats.likes)} />
            <Action icon={<Ionicons name="chatbubble-ellipses-outline" size={18} color="#687076" />} label={String(post.stats.comments)} />
            <Action icon={<MaterialCommunityIcons name="repeat-variant" size={18} color="#687076" />} label={String(post.stats.reposts)} />
            <TouchableOpacity style={styles.moreBtn}>
              <Feather name="more-horizontal" size={18} color="#687076" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const Action = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <TouchableOpacity style={styles.actionItem}>
    <View style={styles.actionLeft}>
      {icon}
      <Text style={styles.actionText}>{label}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { paddingHorizontal: 16, paddingTop: 8 },
  pageTitle: { fontSize: 18, fontWeight: "600", color: "#11181C", marginVertical: 8 },

  card: { marginTop: 8, marginBottom: 16 },

  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  headerTextWrap: { justifyContent: "center" },
  nameRow: { flexDirection: "row", alignItems: "center" },
  name: { fontSize: 14, color: "#11181C", fontWeight: "600" },
  subRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  subText: { fontSize: 12, color: "#9BA1A6" },

  coverWrap: { position: "relative", borderRadius: 12, overflow: "hidden" },
  cover: { width: "100%", height: 260, borderRadius: 12 },
  coverGradient: { position: "absolute", left: 0, right: 0, bottom: 0, height: 100 },
  coverInfo: { position: "absolute", left: 12, right: 12, bottom: 12 },
  trackTitle: { fontSize: 20, color: "#FFFFFF", fontWeight: "800", letterSpacing: 0.2 },
  artistRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  artist: { color: "#FFFFFF", fontSize: 13, opacity: 0.95 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#FFFFFF", marginHorizontal: 8, opacity: 0.9 },
  playStat: { color: "#FFFFFF", fontSize: 12 },

  actionsRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  actionItem: { flexDirection: "row", alignItems: "center", marginRight: 18 },
  actionLeft: { flexDirection: "row", alignItems: "center" },
  actionText: { marginLeft: 6, color: "#687076", fontSize: 13 },
  moreBtn: { marginLeft: "auto" },
});

export default FeedScreen;
