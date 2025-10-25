import { 
  FlatList, 
  Image, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Dữ liệu mẫu
const playlistData = {
  title: 'Top 50 - Canada',
  likes: 1234,
  duration: '05:10:18',
  description: 'Daily chart-toppers update',
  image: require('../../assets/images/Playlist Details - Audio Listing/Image 50.png'),
};

const songs = [
  {
    id: 1,
    title: 'FLOWER',
    artist: 'Jessica Gonzalez',
    views: '2,1M',
    duration: '3:36',
    image: require('../../assets/images/Playlist Details - Audio Listing/Image 51.png'),
  },
  {
    id: 2,
    title: 'Shape of You',
    artist: 'Anthony Taylor',
    views: '68M',
    duration: '03:35',
    image: require('../../assets/images/Playlist Details - Audio Listing/Image 52.png'),
  },
  {
    id: 3,
    title: 'Blinding Lights',
    artist: 'Brian Bailey',
    views: '93M',
    duration: '04:39',
    image: require('../../assets/images/Playlist Details - Audio Listing/Image 53.png'),
  },
  {
    id: 4,
    title: 'Levitating',
    artist: 'Anthony Taylor',
    views: '9M',
    duration: '07:48',
    image: require('../../assets/images/Playlist Details - Audio Listing/Image 54.png'),
  },
  {
    id: 5,
    title: 'Astronaut in the Ocean',
    artist: 'Pedro Moreno',
    views: '23M',
    duration: '3:36',
    image: require('../../assets/images/Playlist Details - Audio Listing/Image 55.png'),
  },
  {
    id: 6,
    title: 'Dynamite',
    artist: 'Elena Jimenez',
    views: '10M',
    duration: '06:22',
    image: require('../../assets/images/Playlist Details - Audio Listing/Image 56.png'),
  },
];

export default function PlaylistDetails() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="cast-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Playlist Info */}
      <View style={styles.playlistInfo}>
        <View style={styles.playlistImageContainer}>
          <Image source={playlistData.image} style={styles.playlistImage} />
        </View>
        <View style={styles.playlistDetails}>
          <Text style={styles.playlistTitle}>{playlistData.title}</Text>
          <View style={styles.playlistMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="heart-outline" size={16} color="#60A5FA" />
              <Text style={styles.metaText}>{playlistData.likes.toLocaleString()}</Text>
            </View>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.metaText}>{playlistData.duration}</Text>
          </View>
          <Text style={styles.description}>{playlistData.description}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="shuffle" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.playButton}>
          <Ionicons name="play" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Songs List */}
      <FlatList
        data={songs}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <TouchableOpacity style={styles.songItem}>
            <Image source={item.image} style={styles.songImage} />
            <View style={styles.songInfo}>
              <Text style={styles.songTitle}>{item.title}</Text>
              <Text style={styles.songArtist}>{item.artist}</Text>
            </View>
            <View style={styles.songMeta}>
              <View style={styles.playInfo}>
                <Ionicons name="play" size={12} color="#666" />
                <Text style={styles.playText}>{item.views}</Text>
              </View>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.songDuration}>{item.duration}</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  playlistInfo: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  playlistImageContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playlistImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
  },
  playlistDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  playlistTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  playlistMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
  },
  dot: {
    fontSize: 14,
    color: '#999',
    marginHorizontal: 8,
  },
  description: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
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
    marginLeft: 'auto',
  },
  listContent: {
    paddingBottom: 100,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  songMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playText: {
    fontSize: 12,
    color: '#666',
  },
  songDuration: {
    fontSize: 12,
    color: '#666',
  },
});
