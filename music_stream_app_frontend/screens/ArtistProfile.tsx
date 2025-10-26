import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function ArtistProfile() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const artistData = {
    name: params.name || 'Ryan Young',
    followers: '65.1K',
    avatar: require('../assets/images/Artist Profile/Image 63.png'),
    isFollowing: false,
  };

  const [isFollowing, setIsFollowing] = useState(artistData.isFollowing);

  const popularSongs = [
    {
      id: 1,
      title: 'Let you free',
      image: require('../assets/images/Artist Profile/Image 66.png'),
      views: '68M',
      duration: '03:35',
    },
    {
      id: 2,
      title: 'Blinding Lights',
      image: require('../assets/images/Artist Profile/Image 67.png'),
      views: '93M',
      duration: '04:39',
    },
    {
      id: 3,
      title: 'Shape of You',
      image: require('../assets/images/Artist Profile/Image 68.png'),
      views: '50M',
      duration: '03:45',
    },
    {
      id: 4,
      title: 'Levitating',
      image: require('../assets/images/Artist Profile/Image 69.png'),
      views: '45M',
      duration: '04:15',
    },
    {
      id: 5,
      title: 'Astronaut',
      image: require('../assets/images/Artist Profile/Image 70.png'),
      views: '35M',
      duration: '03:20',
    },
  ];

  const albums = [
    { id: 1, title: 'ME', artist: 'Jessica Gonzalez', image: require('../assets/images/Artist Profile/Image 71.png') },
    { id: 2, title: 'Magna nost', artist: 'Brian Thomas', image: require('../assets/images/Artist Profile/Image 72.png') },
    { id: 3, title: 'Proident', artist: 'Anthony', image: require('../assets/images/Artist Profile/Image 73.png') },
  ];

  const relatedArtists = [
    { id: 1, name: 'Magna nost', artist: 'Jessica Gonzalez', image: require('../assets/images/Artist Profile/Image 74.png') },
    { id: 2, name: 'Exercitatio', artist: 'Brian Harris', image: require('../assets/images/Artist Profile/Image 75.png') },
    { id: 3, name: 'Tempor', artist: 'Tyler And', image: require('../assets/images/Artist Profile/Image 76.png') },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Artist Info */}
        <View style={styles.artistInfo}>
          <Image source={artistData.avatar} style={styles.avatar} />
          <Text style={styles.artistName}>{artistData.name}</Text>
          <Text style={styles.followers}>{artistData.followers} Followers</Text>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={isFollowing ? styles.followingButton : styles.followButton}
              onPress={() => setIsFollowing(!isFollowing)}
            >
              <Text style={isFollowing ? styles.followingText : styles.followText}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
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

        {/* Popular */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular</Text>
          <FlatList
            data={popularSongs}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.songItem}
                onPress={() => router.push({
                  pathname: '/play-audio',
                  params: {
                    title: item.title,
                    artist: artistData.name,
                    duration: item.duration,
                  }
                })}
              >
                <Image source={item.image} style={styles.songImage} />
                <View style={styles.songInfo}>
                  <Text style={styles.songTitle}>{item.title}</Text>
                  <Text style={styles.songArtist}>{artistData.name}</Text>
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

        {/* Albums */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Albums</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={albums}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.albumCard}>
                <Image source={item.image} style={styles.albumImage} />
                <Text style={styles.albumTitle}>{item.title}</Text>
                <Text style={styles.albumArtist}>{item.artist}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.albumList}
          />
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Image 
            source={require('../assets/images/Artist Profile/Image 77.png')} 
            style={styles.aboutImage} 
          />
          <Text style={styles.aboutText}>
            Ryan Young is a talented musician known for his unique blend of pop and electronic music. 
            With millions of streams worldwide, he continues to create memorable melodies that resonate 
            with fans around the globe.
          </Text>
          <TouchableOpacity>
            <Text style={styles.viewMore}>View more</Text>
          </TouchableOpacity>
        </View>

        {/* Fans also like */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fans also like</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={relatedArtists}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.relatedCard}
                onPress={() => router.push({
                  pathname: '/artist-profile',
                  params: { name: item.artist }
                })}
              >
                <Image source={item.image} style={styles.relatedImage} />
                <Text style={styles.relatedTitle}>{item.name}</Text>
                <Text style={styles.relatedArtist}>{item.artist}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.albumList}
          />
        </View>
      </ScrollView>
    </View>
  );
}

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
  artistInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 16,
  },
  artistName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  followers: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  followButton: {
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  followingButton: {
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#000',
  },
  followText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  followingText: {
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
  dot: {
    fontSize: 14,
    color: '#999',
    marginHorizontal: 4,
  },
  albumList: {
    paddingRight: 16,
  },
  albumCard: {
    width: 160,
    marginRight: 12,
  },
  albumImage: {
    width: 160,
    height: 160,
    borderRadius: 12,
    marginBottom: 8,
  },
  albumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  albumArtist: {
    fontSize: 14,
    color: '#666',
  },
  aboutImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 8,
  },
  viewMore: {
    fontSize: 14,
    color: '#00B8D4',
    fontWeight: '600',
  },
  relatedCard: {
    width: 160,
    marginRight: 12,
  },
  relatedImage: {
    width: 160,
    height: 160,
    borderRadius: 12,
    marginBottom: 8,
  },
  relatedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  relatedArtist: {
    fontSize: 14,
    color: '#666',
  },
});

