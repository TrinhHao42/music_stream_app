import { getCurrentUser, updateUser } from "@/api/musicApi";
import { useAuth } from "@/contexts/AuthContext";
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
    logout,
  } = useAuth();

  const [user, setUser] = useState<{
    id: string;
    name: string;
    playlists: number;
    follows: number;
    likes: number;
    favouriteAlbums: number;
  } | null>(null);
  
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
    }
  }, [authUser]);

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

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              // Call logout from AuthContext to clear all data
              await logout();
              // Navigate to launch screen
              router.replace('/launch' as any);
            } catch (error) {
              console.error('Error during logout:', error);
              // Still navigate even if logout API fails
              router.replace('/launch' as any);
            }
          },
        },
      ]
    );
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
        <Stat num={user.likes} label="LIKES" />
      </View>

      {/* My Library Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.libraryBtn}
        onPress={() => router.push('/(tabs)/library' as any)}
      >
        <Ionicons name="library-outline" size={24} color="#11181C" />
        <Text style={styles.libraryText}>My Library</Text>
        <Ionicons name="chevron-forward" size={24} color="#687076" />
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.logoutBtn}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>

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

      {/* Quick Stats Info */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="disc-outline" size={24} color="#11181C" />
          <Text style={styles.infoLabel}>Albums yêu thích</Text>
          <Text style={styles.infoValue}>{user.favouriteAlbums}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="heart-outline" size={24} color="#11181C" />
          <Text style={styles.infoLabel}>Bài hát đã thích</Text>
          <Text style={styles.infoValue}>{user.likes}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="musical-notes-outline" size={24} color="#11181C" />
          <Text style={styles.infoLabel}>Playlists</Text>
          <Text style={styles.infoValue}>{user.playlists}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={24} color="#11181C" />
          <Text style={styles.infoLabel}>Nghệ sĩ theo dõi</Text>
          <Text style={styles.infoValue}>{user.follows}</Text>
        </View>
      </View>

      <View style={{ height: 80 }} />
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

  libraryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#11181C",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  libraryText: {
    flex: 1,
    color: "#11181C",
    fontSize: 18,
    fontWeight: "700",
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E53935",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

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

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E6E8EB",
  },
  infoLabel: {
    flex: 1,
    color: "#11181C",
    fontSize: 15,
    fontWeight: "500",
  },
  infoValue: {
    color: "#687076",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default UserScreen;
