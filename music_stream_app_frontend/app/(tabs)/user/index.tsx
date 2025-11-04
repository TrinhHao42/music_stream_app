import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentUser, getAlbumById } from '@/api/musicApi';
import Album from '@/types/Album';

const UserScreen = () => {
  const { accessToken, user: authUser, isLoading: authLoading } = useAuth();
  
  const [user, setUser] = useState<{
    id: string;
    name: string;
    playlists: number;
    follows: number;
    likes: number;
    favouriteAlbums: number;
  } | null>(null);
  
  const [favouriteAlbumsList, setFavouriteAlbumsList] = useState<Album[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  const [nameInput, setNameInput] = useState('');

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
      
      // Load danh sách albums yêu thích
      loadFavouriteAlbums(authUser.favouriteAlbums || []);
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
      // Load từng album theo ID
      const albumPromises = albumIds.map(id => getAlbumById(id));
      const albums = await Promise.all(albumPromises);
      // Lọc bỏ các album null
      const validAlbums = albums.filter((album): album is Album => album !== null);
      setFavouriteAlbumsList(validAlbums);
    } catch (error) {
      console.error('Lỗi khi load albums yêu thích:', error);
    } finally {
      setLoadingAlbums(false);
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
        
        // Load lại danh sách albums
        await loadFavouriteAlbums(userData.favouriteAlbums || []);
      }
    } catch (error) {
      console.error('Lỗi khi refresh user:', error);
    } finally {
      setRefreshing(false);
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
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#11181C" />
        <Text style={{ marginTop: 12, color: '#687076' }}>Đang tải thông tin...</Text>
      </View>
    );
  }

  // Nếu chưa đăng nhập
  if (!accessToken || !user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Ionicons name="person-circle-outline" size={80} color="#E6E8EB" />
        <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '700', color: '#11181C' }}>
          Chưa đăng nhập
        </Text>
        <Text style={{ marginTop: 8, color: '#687076', textAlign: 'center' }}>
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
          colors={['#11181C']}
          tintColor="#11181C"
        />
      }
    >
      {/* Header avatar + tên */}
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/Feed - Audio Listing/Avatar 4.png')}
          style={styles.avatar}
          contentFit="cover"
          transition={0}
          cachePolicy="memory-disk"
        />
        <View style={styles.nameRow}>
          <Text style={styles.name}>{user.name}</Text>
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
        <Stat num={user.likes} label="FOLLOWERS" />
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
              style={[styles.saveBtn, { backgroundColor: '#11181C' }]}
              onPress={() => {
                if (user) {
                  setUser({ 
                    ...user, 
                    name: nameInput.trim() || user.name,
                  });
                }
                setShowEditor(false);
              }}
            >
              <Text style={styles.saveText}>Lưu</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.saveBtn, { backgroundColor: '#E6E8EB' }]}
              onPress={() => {
                if (user) {
                  setNameInput(user.name);
                }
                setShowEditor(false);
              }}
            >
              <Text style={[styles.saveText, { color: '#11181C' }]}>Hủy</Text>
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
            <TouchableOpacity key={album.albumId} activeOpacity={0.7} style={styles.listItem}>
              <Image 
                source={{ uri: album.image }} 
                style={styles.cover} 
                contentFit="cover" 
                transition={200} 
                cachePolicy="memory-disk"
                placeholder={require('@/assets/images/My Library/Image 101.png')}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{album.albumName}</Text>
                <Text style={styles.itemSub}>{album.favourites} lượt thích</Text>
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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 16 },

  header: { alignItems: 'center', marginBottom: 12 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginTop: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8 },
  name: { fontSize: 18, color: '#11181C', fontWeight: '700' },
  editIconBtn: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: '#F3F4F5', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },

  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8, marginBottom: 16 },
  statBox: { alignItems: 'center' },
  statNum: { color: '#11181C', fontSize: 16, fontWeight: '700' },
  statLabel: { color: '#687076', fontSize: 12, marginTop: 2 },

  infoCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6E8EB', borderRadius: 12, padding: 12, marginBottom: 16 },
  
  formRow: { marginBottom: 10 },
  formLabel: { color: '#687076', fontSize: 13, marginBottom: 6 },
  formInput: { borderWidth: 1, borderColor: '#E6E8EB', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, color: '#11181C' },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 6, marginBottom: 6 },
  saveBtn: { flex: 1, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center' },
  saveText: { color: '#FFFFFF', fontWeight: '700' },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#11181C', marginBottom: 10, marginTop: 8 },
  
  loadingContainer: { 
    padding: 24, 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#E6E8EB', 
    borderRadius: 12 
  },
  loadingText: { marginTop: 8, color: '#687076', fontSize: 14 },
  
  emptyContainer: { 
    padding: 32, 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#E6E8EB', 
    borderRadius: 12 
  },
  emptyText: { marginTop: 12, color: '#687076', fontSize: 14 },
  
  list: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6E8EB', borderRadius: 12, paddingVertical: 4 },
  listItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    borderBottomWidth: StyleSheet.hairlineWidth, 
    borderBottomColor: '#E6E8EB' 
  },
  cover: { width: 48, height: 48, borderRadius: 8, marginRight: 12 },
  itemTitle: { color: '#11181C', fontSize: 15, fontWeight: '600' },
  itemSub: { color: '#687076', fontSize: 12, marginTop: 2 },
});

export default UserScreen;


