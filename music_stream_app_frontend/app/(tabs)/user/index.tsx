import { getCurrentUser, getLibraryStats, renameUser } from "@/api/musicApi";
import { useAuth } from "@/contexts/AuthContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
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
  } | null>(null);

  const [libraryStats, setLibraryStats] = useState({
    songs: 0,
    albums: 0,
    playlists: 0,
    artists: 0,
  });
  
  const [refreshing, setRefreshing] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [nameInput, setNameInput] = useState("");

  // Load thông tin user từ localStorage (AuthContext)
  useEffect(() => {
    if (authUser) {
      // Sử dụng dữ liệu từ localStorage
      const parsedUser = {
        id: authUser.userId,
        name: authUser.userName,
      };
      
      setUser(parsedUser);
      setNameInput(parsedUser.name);

      // Load library stats
      loadLibraryStats(authUser.userId);
    }
  }, [authUser]);

  // Auto refresh stats khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      if (authUser) {
        loadLibraryStats(authUser.userId);
      }
    }, [authUser])
  );

  // Hàm load library stats
  const loadLibraryStats = async (userId: string) => {
    try {
      const stats = await getLibraryStats(userId);
      if (stats) {
        setLibraryStats(stats);
      }
    } catch (error) {
      console.error("Lỗi khi load library stats:", error);
    }
  };

  // Hàm refresh để load lại dữ liệu mới từ API
  const handleRefresh = async () => {
    if (!accessToken || !authUser) return;

    try {
      setRefreshing(true);

      // Gọi API lấy thông tin user mới nhất
      const userData = await getCurrentUser();

      if (userData) {
        // Parse dữ liệu từ backend
        const parsedUser = {
          id: userData.userId,
          name: userData.userName,
        };

        setUser(parsedUser);
        setNameInput(parsedUser.name);

        // Refresh library stats
        await loadLibraryStats(userData.userId);
      }
    } catch (error) {
      console.error("Lỗi khi refresh user:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Hàm lưu thông tin user lên server
  const handleSaveUser = async () => {
    if (!user || !nameInput.trim()) {
      Alert.alert("Lỗi", "Tên không được để trống");
      return;
    }

    try {
      setSaving(true);

      // Gọi API rename user với userId và tên mới
      const updatedUser = await renameUser(user.id, nameInput.trim());

      if (updatedUser) {
        // Cập nhật state local
        setUser({
          ...user,
          name: updatedUser.userName,
        });

        // Refresh lại thông tin trong AuthContext
        await refreshUserData();

        setShowEditor(false);
        Alert.alert("Thành công", "Đã cập nhật tên thành công");
      } else {
        Alert.alert("Lỗi", "Không thể cập nhật tên");
      }
    } catch (error) {
      console.error("Lỗi khi đổi tên user:", error);
      Alert.alert("Lỗi", "Không thể cập nhật tên");
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
              setLoggingOut(true);
              
              // Call logout from AuthContext to clear all data
              await logout();
              
              // Navigate to launch screen
              router.replace('/launch' as any);
            } catch (error) {
              console.error('Error during logout:', error);
              
              // Show error but still navigate to clear local state
              Alert.alert(
                'Thông báo',
                'Đã có lỗi xảy ra nhưng bạn đã được đăng xuất khỏi thiết bị này.',
                [
                  {
                    text: 'OK',
                    onPress: () => router.replace('/launch' as any)
                  }
                ]
              );
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  // Component Stat - hiện tại không sử dụng (Stats Cards đã được comment)
  // const Stat = ({ num, label, gradient }: { num: number | string; label: string; gradient: [string, string] }) => (
  //   <View style={styles.statCard}>
  //     <LinearGradient colors={gradient} style={styles.statGradient}>
  //       <Text style={styles.statNum}>{num}</Text>
  //       <Text style={styles.statLabel}>{label}</Text>
  //     </LinearGradient>
  //   </View>
  // );

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
          colors={["#667EEA"]}
          tintColor="#667EEA"
        />
      }
    >
      {/* Header với gradient background */}
      <LinearGradient
        colors={[
          "rgba(90,41,168,0.85)",
          "rgba(189,20,107,0.35)",
          "rgba(189,20,107,0.35)",
          "rgba(210,9,186,0.85)"
        ]}
        locations={[0, 0.45, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image
              source={require("@/assets/images/logo/Frame1.png")}
              style={styles.avatar}
              contentFit="cover"
              transition={0}
              cachePolicy="memory-disk"
            />
            
          </View>
          
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
              <Ionicons name="pencil" size={18} color="#667EEA" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Stats Cards với gradient */}
      {/* <View style={styles.statsContainer}>
        <Stat 
          num={user.playlists} 
          label="Playlists" 
          gradient={['#FF6B6B', '#FF8E53']}
        />
        <Stat 
          num={user.follows} 
          label="Nghệ sĩ" 
          gradient={['#4FACFE', '#00F2FE']}
        />
        <Stat 
          num={user.likes} 
          label="Bài hát" 
          gradient={['#43E97B', '#38F9D7']}
        />
      </View> */}

      {/* Editor (toggle khi bấm icon edit) */}
      {showEditor && (
        <View style={styles.editCard}>
          <View style={styles.editHeader}>
            <Ionicons name="create-outline" size={24} color="#667EEA" />
            <Text style={styles.editTitle}>Chỉnh sửa tên</Text>
          </View>
          
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>Tên hiển thị</Text>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              style={styles.formInput}
              placeholder="Nhập tên mới"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          
          <View style={styles.formActions}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.cancelBtn]}
              onPress={() => {
                if (user) {
                  setNameInput(user.name);
                }
                setShowEditor(false);
              }}
              disabled={saving}
            >
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleSaveUser}
              disabled={saving}
            >
              <LinearGradient
                colors={['#667EEA', '#764BA2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    <Text style={styles.saveText}>Lưu</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* My Library Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.libraryBtn}
        onPress={() => router.push('/(tabs)/library' as any)}
      >
        <View style={styles.libraryIconBg}>
          <Ionicons name="library" size={24} color="#667EEA" />
        </View>
        <Text style={styles.libraryText}>Thư viện của tôi</Text>
        <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Quick Stats Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>Thống kê chi tiết</Text>
        
        <View style={styles.infoRow}>
          <View style={[styles.infoIconBg, { backgroundColor: '#FFF4E6' }]}>
            <Ionicons name="disc" size={22} color="#FF8E53" />
          </View>
          <Text style={styles.infoLabel}>Albums yêu thích</Text>
          <Text style={styles.infoValue}>{libraryStats.albums}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <View style={[styles.infoIconBg, { backgroundColor: '#FFE6F0' }]}>
            <Ionicons name="heart" size={22} color="#FF6B6B" />
          </View>
          <Text style={styles.infoLabel}>Bài hát đã thích</Text>
          <Text style={styles.infoValue}>{libraryStats.songs}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <View style={[styles.infoIconBg, { backgroundColor: '#E6F7FF' }]}>
            <Ionicons name="musical-notes" size={22} color="#4FACFE" />
          </View>
          <Text style={styles.infoLabel}>Playlists</Text>
          <Text style={styles.infoValue}>{libraryStats.playlists}</Text>
        </View>
        
        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
          <View style={[styles.infoIconBg, { backgroundColor: '#F0E6FF' }]}>
            <Ionicons name="person" size={22} color="#764BA2" />
          </View>
          <Text style={styles.infoLabel}>Nghệ sĩ theo dõi</Text>
          <Text style={styles.infoValue}>{libraryStats.artists}</Text>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleLogout}
        disabled={loggingOut}
      >
        <LinearGradient
          colors={["#5A29A8", "#BD146B", "#BD146B", "#D209BA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.logoutBtn, loggingOut && { opacity: 0.6 }]}
        >
          {loggingOut ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.logoutText}>Đang đăng xuất...</Text>
            </>
          ) : (
            <>
              <Ionicons name="log-out" size={22} color="#FFFFFF" />
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F9FAFB" 
  },
  content: { 
    paddingBottom: 20 
  },

  // Header với gradient
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: { 
    alignItems: "center",
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: { 
    width: 110, 
    height: 110, 
    
  },
  avatarBorder: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    maxWidth: "85%",
  },
  name: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "700",
    textAlign: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  editIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  // Stats Cards
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: -35,
    marginBottom: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  statGradient: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  statNum: { 
    color: "#FFFFFF", 
    fontSize: 22, 
    fontWeight: "800",
    marginBottom: 4,
  },
  statLabel: { 
    color: "#FFFFFF", 
    fontSize: 11, 
    fontWeight: "600",
    textTransform: "uppercase",
    opacity: 0.9,
  },

  // Edit Card
  editCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  editHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  formRow: { 
    marginBottom: 16 
  },
  formLabel: { 
    color: "#6B7280", 
    fontSize: 14, 
    fontWeight: "600",
    marginBottom: 8 
  },
  formInput: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#1F2937",
    fontSize: 16,
    backgroundColor: "#F9FAFB",
  },
  formActions: { 
    flexDirection: "row", 
    gap: 12, 
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  cancelText: { 
    color: "#6B7280", 
    fontWeight: "700",
    fontSize: 16,
  },
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveText: { 
    color: "#FFFFFF", 
    fontWeight: "700",
    fontSize: 16,
  },

  // Library Button
  libraryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    gap: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  libraryIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  libraryText: {
    flex: 1,
    color: "#1F2937",
    fontSize: 17,
    fontWeight: "700",
  },

  // Info Card
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  infoLabel: {
    flex: 1,
    color: "#4B5563",
    fontSize: 15,
    fontWeight: "600",
  },
  infoValue: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "700",
  },

  // Logout Button
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginHorizontal: 16,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#FF6B6B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});

export default UserScreen;
