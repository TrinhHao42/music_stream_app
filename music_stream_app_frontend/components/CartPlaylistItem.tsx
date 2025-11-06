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
      pathname: '/playlist-details',
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

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={handlePress}>
      <Image
        source={require('@/assets/images/My Library/Image 101.png')}
        style={styles.img}
        contentFit="cover"
        transition={0}
        cachePolicy="memory-disk"
      />
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={styles.title}>
          {playlist.playlistName}
        </Text>
        <Text style={{ color: '#777', fontSize: 13 }}>
          {playlist.songs?.length || 0} songs
        </Text>
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
  removeBtn: {
    padding: 4,
  },
});

export default CartPlaylistItem;
