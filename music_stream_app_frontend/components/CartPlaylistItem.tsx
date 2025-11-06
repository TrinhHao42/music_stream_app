import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Playlist = {
  playlistId: string;
  playlistName: string;
  userId: string;
  songs: string[];
};

type Props = {
  playlist: Playlist;
  showRemove?: boolean;
  onRemove?: () => void;
  fromLibrary?: boolean; // New prop to indicate if called from library
};

const CartPlaylistItem = ({ playlist, showRemove = false, onRemove, fromLibrary = false }: Props) => {
  const router = useRouter();

  const handlePress = () => {
    // Always navigate with playlistId only
    router.push({
      pathname: '/(tabs)/library/playlist-details',
      params: {
        playlistId: playlist.playlistId,
      },
    } as never);
  };

  const handleRemove = () => {
    if (onRemove) {
      Alert.alert(
        'Remove Playlist',
        `Remove "${playlist.playlistName}" from library?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: onRemove },
        ]
      );
    }
  };

  const songsCount = playlist.songs?.length || 0;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={handlePress}>
      <Image
        source={require('@/assets/images/My Playlists/playlistImg.png')}
        style={styles.img}
        contentFit="cover"
        transition={0}
        cachePolicy="memory-disk"
      />
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={styles.title}>
          {playlist.playlistName}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
          <View style={styles.songCountBadge}>
            <Entypo name="music" size={12} color="#fff" />
            <Text style={styles.songCountText}>{songsCount}</Text>
          </View>
        </View>
      </View>
      {showRemove ? (
        <TouchableOpacity onPress={handleRemove} style={styles.removeBtn}>
          <Ionicons name="trash-outline" size={20} color="#E53935" />
        </TouchableOpacity>
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#999" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  img: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
  },
  songCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11181C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  songCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  removeBtn: {
    padding: 4,
  },
});

export default CartPlaylistItem;
