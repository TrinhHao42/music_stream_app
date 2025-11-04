import { getAlbumById, getArtistsByIds, getCurrentUser, getPlaylistsByIds, getSongsByIds, updateUser } from "@/api/musicApi";
import { useAuth } from "@/contexts/AuthContext";
import { Artist, Song } from "@/types";
import Album from "@/types/Album";
import Playlist from "@/types/Playlist";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const UserScreen = () => {
  const router = useRouter();
  const {
    accessToken,
    user: authUser,
    isLoading: authLoading,
    refreshUserData,
  } = useAuth();

  const [user, setUser] = useState<{
    id: string;
    name: string;
    playlists: number;
    follows: number;
    likes: number;
    favouriteAlbums: number;
  } | null>(null);

  const [favouriteAlbumsList, setFavouriteAlbumsList] = useState<Album[]>([]);
  const [likedSongsList, setLikedSongsList] = useState<Song[]>([]);
  const [playlistsList, setPlaylistsList] = useState<Playlist[]>([]);
  const [followingArtistsList, setFollowingArtistsList] = useState<Artist[]>([]);
  
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [loadingArtists, setLoadingArtists] = useState(false);
  
  const [refreshing, setRefreshing] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);

  const [nameInput, setNameInput] = useState("");

  // Load thông tin user từ localStorage (AuthContext)
  useEffect(() => {
    if (authUser) {
      // Sử dụng dữ liệu từ localStorage
      const parsedUser = {
        id: authUser.userId,
        name: authUser.userName,
        playlists: authUser.playlists?.length ?? 0,
        follows: authUser.followList?.length ?? 0,
        likes: authUser.likeList?.length ?? 0,
        favouriteAlbums: authUser.favouriteAlbums?.length ?? 0,
      };
      
      setUser(parsedUser);
      setNameInput(parsedUser.name);

      // Load tất cả danh sách
      loadFavouriteAlbums(authUser.favouriteAlbums || []);
      loadLikedSongs(authUser.likeList || []);
      loadPlaylists(authUser.playlists || []);
      loadFollowingArtists(authUser.followList || []);
    }
     
  }, [authUser]);

  // Hàm load danh sách albums yêu thích
  const loadFavouriteAlbums = async (albumIds: string[]) => {
    if (!albumIds || albumIds.length === 0) {
      setFavouriteAlbumsList([]);
      return;
    }

    try {
      setLoadingAlbums(true);
      const albumPromises = albumIds.map((id) => getAlbumById(id));
      const albums = await Promise.all(albumPromises);
      const validAlbums = albums.filter(
        (album): album is Album => album !== null
      );
      setFavouriteAlbumsList(validAlbums);

      // Lọc bỏ albums không tồn tại (404) - chỉ hiển thị albums hợp lệ
      if (validAlbums.length < albumIds.length) {
        const invalidCount = albumIds.length - validAlbums.length;
        console.log(`Bỏ qua ${invalidCount} album không tồn tại`);
      }
    } catch (error) {
      console.error("Lỗi khi load albums yêu thích:", error);
    } finally {
      setLoadingAlbums(false);
    }
  };

  // Hàm load danh sách bài hát đã thích
  const loadLikedSongs = async (songIds: string[]) => {
    if (!songIds || songIds.length === 0) {
      setLikedSongsList([]);
      return;
    }

    try {
      setLoadingSongs(true);
      const songs = await getSongsByIds(songIds);
      setLikedSongsList(songs);
    } catch (error) {
      console.error("Lỗi khi load bài hát đã thích:", error);
    } finally {
      setLoadingSongs(false);
    }
  };

  // Hàm load danh sách playlists
  const loadPlaylists = async (playlistIds: string[]) => {
    if (!playlistIds || playlistIds.length === 0) {
      setPlaylistsList([]);
      return;
    }

    try {
      setLoadingPlaylists(true);
      const playlists = await getPlaylistsByIds(playlistIds);
      setPlaylistsList(playlists);
    } catch (error) {
      console.error("Lỗi khi load playlists:", error);
    } finally {
      setLoadingPlaylists(false);
    }
  };

  // Hàm load danh sách nghệ sĩ đang theo dõi
  const loadFollowingArtists = async (artistIds: string[]) => {
    if (!artistIds || artistIds.length === 0) {
      setFollowingArtistsList([]);
      return;
    }

    try {
      setLoadingArtists(true);
      const artists = await getArtistsByIds(artistIds);
      setFollowingArtistsList(artists);
    } catch (error) {
      console.error("Lỗi khi load nghệ sĩ đang theo dõi:", error);
    } finally {
      setLoadingArtists(false);
    }
  };

  // Hàm refresh để load lại dữ liệu mới từ API
  const handleRefresh = async () => {
    if (!accessToken) return;

    try {
      setRefreshing(true);

      // Gọi API lấy thông tin user mới nhất
      const userData = await getCurrentUser();

      if (userData) {
        // Parse dữ liệu từ backend
        const parsedUser = {
          id: userData.userId,
          name: userData.userName,
          playlists: userData.playlists?.length ?? 0,
          follows: userData.followList?.length ?? 0,
          likes: userData.likeList?.length ?? 0,
          favouriteAlbums: userData.favouriteAlbums?.length ?? 0,
        };

        setUser(parsedUser);
        setNameInput(parsedUser.name);

        // Load lại tất cả danh sách
        await Promise.all([
          loadFavouriteAlbums(userData.favouriteAlbums || []),
          loadLikedSongs(userData.likeList || []),
          loadPlaylists(userData.playlists || []),
          loadFollowingArtists(userData.followList || []),
        ]);
      }
    } catch (error) {
      console.error("Lỗi khi refresh user:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Hàm lưu thông tin user lên server
  const handleSaveUser = async () => {
    if (!user || !nameInput.trim() || !authUser) {
      Alert.alert("Lỗi", "Tên không được để trống");
      return;
    }

    try {
      setSaving(true);

      // Tạo user object mới với tất cả thông tin cũ + userName mới
      const updatedUserData = {
        userName: nameInput.trim(),
        playlists: authUser.playlists,
        followList: authUser.followList,
        likeList: authUser.likeList,
        favouriteAlbums: authUser.favouriteAlbums,
      };

      // Gọi API cập nhật user
      const updatedUser = await updateUser(user.id, updatedUserData);

      if (updatedUser) {
        // Cập nhật state local
        setUser({
          ...user,
          name: updatedUser.userName,
        });

        // Refresh lại thông tin trong AuthContext
        await refreshUserData();

        setShowEditor(false);
        Alert.alert("Thành công", "Đã cập nhật thông tin");
      } else {
        Alert.alert("Lỗi", "Không thể cập nhật thông tin");
      }
    } catch (error) {
      console.error("Lỗi khi lưu user:", error);
      Alert.alert("Lỗi", "Không thể cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  const Stat = ({ num, label }: { num: number | string; label: string }) => (
    <View style={styles.statBox}>
      <Text style={styles.statNum}>{num}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  // Hiển thị loading khi đang kiểm tra auth
  if (authLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#11181C" />
        <Text style={{ marginTop: 12, color: "#687076" }}>
          Đang tải thông tin...
        </Text>
      </View>
    );
  }

  // Nếu chưa đăng nhập
  if (!accessToken || !user) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center", padding: 20 },
        ]}
      >
        <Ionicons name="person-circle-outline" size={80} color="#E6E8EB" />
        <Text
          style={{
            marginTop: 16,
            fontSize: 18,
            fontWeight: "700",
            color: "#11181C",
          }}
        >
          Chưa đăng nhập
        </Text>
        <Text style={{ marginTop: 8, color: "#687076", textAlign: "center" }}>
          Vui lòng đăng nhập để xem thông tin cá nhân
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={["#11181C"]}
          tintColor="#11181C"
        />
      }
    >
      {/* Header avatar + tên */}
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/logo/avatar.png")}
          style={styles.avatar}
          contentFit="cover"
          transition={0}
          cachePolicy="memory-disk"
        />
        <View style={styles.nameRow}>
          <Text 
            style={styles.name}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {user.name}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.editIconBtn}
            onPress={() => setShowEditor((s) => !s)}
          >
            <Ionicons name="pencil" size={20} color="#11181C" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Stat num={user.playlists} label="PLAYLISTS" />
        <Stat num={user.follows} label="FOLLOWING" />
      </View>

      {/* Editor (toggle khi bấm icon edit) */}
      {showEditor && (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Chỉnh sửa tên</Text>
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>Tên</Text>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              style={styles.formInput}
              placeholder="Tên người dùng"
            />
          </View>
          <View style={styles.formActions}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.saveBtn,
                { backgroundColor: "#11181C", opacity: saving ? 0.6 : 1 },
              ]}
              onPress={handleSaveUser}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveText}>Lưu</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.saveBtn, { backgroundColor: "#E6E8EB" }]}
              onPress={() => {
                if (user) {
                  setNameInput(user.name);
                }
                setShowEditor(false);
              }}
              disabled={saving}
            >
              <Text style={[styles.saveText, { color: "#11181C" }]}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Favourite Albums section */}
      <Text style={styles.sectionTitle}>Albums yêu thích</Text>

      {loadingAlbums ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#11181C" />
          <Text style={styles.loadingText}>Đang tải albums...</Text>
        </View>
      ) : favouriteAlbumsList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="disc-outline" size={48} color="#E6E8EB" />
          <Text style={styles.emptyText}>Chưa có album yêu thích</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {favouriteAlbumsList.map((album) => (
            <TouchableOpacity
              key={album.albumId}
              activeOpacity={0.7}
              style={styles.listItem}
              onPress={() =>
                router.push({
                  pathname: "/album-details" as any,
                  params: { album: JSON.stringify(album) },
                })
              }
            >
              <Image
                source={{ uri: album.image }}
                style={styles.cover}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
                placeholder={require("@/assets/images/My Library/Image 101.png")}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{album.albumName}</Text>
                <Text style={styles.itemSub}>
                  {album.favourites} lượt thích
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9BA1A6" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Playlists section */}
      <Text style={styles.sectionTitle}>Playlists của tôi</Text>

      {loadingPlaylists ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#11181C" />
          <Text style={styles.loadingText}>Đang tải playlists...</Text>
        </View>
      ) : playlistsList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="musical-notes-outline" size={48} color="#E6E8EB" />
          <Text style={styles.emptyText}>Chưa có playlist nào</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {playlistsList.map((playlist) => (
            <TouchableOpacity
              key={playlist.playlistId}
              activeOpacity={0.7}
              style={styles.listItem}
              onPress={() =>
                router.push({
                  pathname: "/playlist-details" as any,
                  params: {
                    playlistId: playlist.playlistId,
                    title: playlist.playlistName,
                  },
                })
              }
            >
              <Image
                source={
                  playlist.image
                    ? { uri: playlist.image }
                    : require("@/assets/images/My Library/Image 101.png")
                }
                style={styles.cover}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {playlist.playlistName}
                </Text>
                <Text style={styles.itemSub}>
                  {playlist.songs?.length ?? 0} bài hát
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9BA1A6" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Liked Songs section */}
      <Text style={styles.sectionTitle}>Bài hát đã thích</Text>

      {loadingSongs ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#11181C" />
          <Text style={styles.loadingText}>Đang tải bài hát...</Text>
        </View>
      ) : likedSongsList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={48} color="#E6E8EB" />
          <Text style={styles.emptyText}>Chưa có bài hát yêu thích</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {likedSongsList.map((song) => (
            <TouchableOpacity
              key={song.songId}
              activeOpacity={0.7}
              style={styles.listItem}
              onPress={() =>
                router.push({
                  pathname: "/play-audio" as any,
                  params: { song: JSON.stringify(song) },
                })
              }
            >
              <Image
                source={
                  song.coverUrl
                    ? { uri: song.coverUrl }
                    : require("@/assets/images/Home - Audio Listing/Image 36.png")
                }
                style={styles.cover}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {song.title}
                </Text>
                <Text style={styles.itemSub} numberOfLines={1}>
                  {song.artist?.[0] ?? "Unknown"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9BA1A6" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Following Artists section */}
      <Text style={styles.sectionTitle}>Nghệ sĩ đang theo dõi</Text>

      {loadingArtists ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#11181C" />
          <Text style={styles.loadingText}>Đang tải nghệ sĩ...</Text>
        </View>
      ) : followingArtistsList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="person-outline" size={48} color="#E6E8EB" />
          <Text style={styles.emptyText}>Chưa theo dõi nghệ sĩ nào</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {followingArtistsList.map((artist) => (
            <TouchableOpacity
              key={artist.artistId}
              activeOpacity={0.7}
              style={styles.listItem}
              onPress={() =>
                router.push({
                  pathname: "/artist-profile" as any,
                  params: { artist: JSON.stringify(artist) },
                })
              }
            >
              <Image
                source={
                  artist.artistImage
                    ? { uri: artist.artistImage }
                    : require("@/assets/images/Artist Profile/Image 63.png")
                }
                style={[styles.cover, { borderRadius: 24 }]}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {artist.artistName}
                </Text>
                <Text style={styles.itemSub}>
                  {artist.followers ?? 0} người theo dõi
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9BA1A6" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { padding: 16 },

  header: { alignItems: "center", marginBottom: 12 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginTop: 8 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
    maxWidth: "80%",
  },
  name: {
    fontSize: 18,
    color: "#11181C",
    fontWeight: "700",
    flex: 1,
  },
  editIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F5",
    justifyContent: "center",
    alignItems: "center",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
    marginBottom: 16,
  },
  statBox: { alignItems: "center" },
  statNum: { color: "#11181C", fontSize: 16, fontWeight: "700" },
  statLabel: { color: "#687076", fontSize: 12, marginTop: 2 },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6E8EB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },

  formRow: { marginBottom: 10 },
  formLabel: { color: "#687076", fontSize: 13, marginBottom: 6 },
  formInput: {
    borderWidth: 1,
    borderColor: "#E6E8EB",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#11181C",
  },
  formActions: { flexDirection: "row", gap: 10, marginTop: 6, marginBottom: 6 },
  saveBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: { color: "#FFFFFF", fontWeight: "700" },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#11181C",
    marginBottom: 10,
    marginTop: 8,
  },

  loadingContainer: {
    padding: 24,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6E8EB",
    borderRadius: 12,
  },
  loadingText: { marginTop: 8, color: "#687076", fontSize: 14 },

  emptyContainer: {
    padding: 32,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6E8EB",
    borderRadius: 12,
  },
  emptyText: { marginTop: 12, color: "#687076", fontSize: 14 },

  list: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6E8EB",
    borderRadius: 12,
    paddingVertical: 4,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E6E8EB",
  },
  cover: { width: 48, height: 48, borderRadius: 8, marginRight: 12 },
  itemTitle: { color: "#11181C", fontSize: 15, fontWeight: "600" },
  itemSub: { color: "#687076", fontSize: 12, marginTop: 2 },
});

export default UserScreen;
