import { addFavouriteAlbum, getSongByName, removeFavouriteAlbum } from '@/api/musicApi';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { Album } from '@/types';

const AlbumDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ album: string }>();
  const { user, refreshUserData } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingSongTitle, setLoadingSongTitle] = useState<string | null>(null);

  // Parse album from params - xử lý trước hooks
  let album: Album | null = null;
  let parseError = false;

  if (params.album) {
    try {
      album = JSON.parse(params.album as string);
    } catch (error) {
      console.error('Error parsing album:', error);
      parseError = true;
    }
  }

  // Kiểm tra album có trong danh sách yêu thích không
  useEffect(() => {
    if (album && user && user.favouriteAlbums) {
      setIsSaved(user.favouriteAlbums.includes(album.albumId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, album?.albumId]);

  // Early returns sau hooks
  if (!params.album) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#999' }}>Album not found</Text>
        </View>
      </View>
    );
  }

  if (parseError || !album) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#999' }}>Error loading album</Text>
        </View>
      </View>
    );
  }

  const handleSongPress = async (songTitle: string) => {
    setLoadingSongTitle(songTitle);
    try {
      const song = await getSongByName(songTitle);
      if (song) {
        router.push({
          pathname: '/play-audio',
          params: {
            song: JSON.stringify(song),
          },
        } as never);
      }
    } catch (error) {
      console.error('Error fetching song:', error);
    } finally {
      setLoadingSongTitle(null);
    }
  };

  const handleToggleSave = async () => {
    if (!user) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Bạn cần đăng nhập để lưu album vào danh sách yêu thích',
        [
          {
            text: 'Hủy',
            style: 'cancel',
          },
          {
            text: 'Đăng nhập',
            onPress: () => router.push('/launch' as any),
          },
        ]
      );
      return;
    }

    // Optimistic update - Cập nhật UI ngay lập tức
    const previousState = isSaved;
    setIsSaved(!isSaved);
    setLoadingSave(true);

    try {
      let success = false;
      
      if (previousState) {
        // Xóa khỏi yêu thích
        const updatedUser = await removeFavouriteAlbum(user, album);
        success = updatedUser !== null;
        
        if (success) {
          // Refresh user data ở background
          refreshUserData().catch(console.error);
        }
      } else {
        // Thêm vào yêu thích
        const updatedUser = await addFavouriteAlbum(user, album);
        success = updatedUser !== null;
        
        if (success) {
          // Refresh user data ở background
          refreshUserData().catch(console.error);
        }
      }

      if (!success) {
        // Rollback UI nếu thất bại
        setIsSaved(previousState);
        Alert.alert('Lỗi', 'Không thể cập nhật. Vui lòng thử lại');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      // Rollback UI nếu có exception
      setIsSaved(previousState);
      Alert.alert('Lỗi', 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Album Info */}
        <View style={styles.albumInfo}>
          <Image 
            source={album.image ? { uri: album.image } : require('@/assets/images/My Library/Image 101.png')}
            style={styles.albumCover}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
          <Text style={styles.albumTitle}>{album.albumName}</Text>
          <Text style={styles.artistName}>
            {Array.isArray(album.artists) ? album.artists.join(', ') : 'Unknown Artist'}
          </Text>
          <Text style={styles.albumMeta}>
            Album • {album.songs?.length || 0} songs • {album.release}
          </Text>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={isSaved ? styles.savedButton : styles.saveButton}
              onPress={handleToggleSave}
              disabled={loadingSave}
            >
              {loadingSave ? (
                <ActivityIndicator size="small" color={isSaved ? "#fff" : "#000"} />
              ) : (
                <Text style={isSaved ? styles.savedText : styles.saveText}>
                  {isSaved ? 'Saved' : 'Save'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="shuffle" size={24} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.playButton}>
              <Ionicons name="play" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Songs List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Songs</Text>
          {album.songs && album.songs.length > 0 ? (
            album.songs.map((song, index) => (
              <TouchableOpacity 
                key={song.songId || index}
                style={styles.songItem}
                onPress={() => handleSongPress(song.title)}
                disabled={loadingSongTitle === song.title}
              >
                <Image 
                  source={song.coverUrl ? { uri: song.coverUrl } : require('@/assets/images/My Library/Image 101.png')} 
                  style={styles.songImage} 
                  contentFit="cover" 
                  transition={0} 
                  cachePolicy="memory-disk" 
                />
                <View style={styles.songInfo}>
                  <Text style={styles.songTitle}>{song.title}</Text>
                  <Text style={styles.songArtist}>
                    {Array.isArray(album.artists) ? album.artists[0] : 'Unknown Artist'}
                  </Text>
                </View>
                {loadingSongTitle === song.title ? (
                  <ActivityIndicator size="small" color="#666" />
                ) : (
                  <TouchableOpacity>
                    <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No songs available</Text>
          )}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  albumInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  albumCover: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  albumTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  artistName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  albumMeta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  saveButton: {
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  savedButton: {
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#000',
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  savedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  songImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default AlbumDetailsScreen;

