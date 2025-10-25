import { 
  Image, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const [isLoggedIn] = useState(false);

  // Nếu chưa đăng nhập, hiển thị avatar mặc định
  const avatarSource = isLoggedIn 
    ? require('../../assets/images/Home - Audio Listing/Ashley Scott.png')
    : require('../../assets/images/logo.jpg');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="musical-notes" size={28} color="#9333EA" />
          </View>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>{isLoggedIn ? 'Ashley Scott' : 'Guest'}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
          <TouchableOpacity onPress={() => !isLoggedIn && router.push('/launch')}>
            <Image 
              source={avatarSource}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8E8E93" />
        <TextInput 
          placeholder="What you want to listen to"
          placeholderTextColor="#8E8E93"
          style={styles.searchInput}
        />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Suggestions for you */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggestions for you</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            <View style={styles.card}>
              <Image 
                source={require('../../assets/images/Home - Audio Listing/Image 36.png')} 
                style={styles.cardImage}
              />
              <View style={styles.cardOverlay}>
                <Text style={styles.cardTitle}>Reflection</Text>
                <Text style={styles.cardArtist}>Christina Aguilera</Text>
              </View>
            </View>
            <View style={styles.card}>
              <Image 
                source={require('../../assets/images/Home - Audio Listing/Image 39.png')} 
                style={styles.cardImage}
              />
              <View style={styles.cardOverlay}>
                <Text style={styles.cardTitle}>In The Stars</Text>
                <Text style={styles.cardArtist}>Benson Boone</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Charts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Charts</Text>
            <Text style={styles.seeAll}>See all</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            <View style={[styles.chartCard, { backgroundColor: '#E8D5FF' }]}>
              <Text style={styles.chartNumber}>Top 50</Text>
              <Text style={styles.chartCountry}>Canada</Text>
              <Text style={styles.chartSubtitle}>Daily chart-toppers update</Text>
            </View>
            <View style={[styles.chartCard, { backgroundColor: '#E0F2FE' }]}>
              <Text style={styles.chartNumber}>Top 50</Text>
              <Text style={styles.chartCountry}>Global</Text>
              <Text style={styles.chartSubtitle}>Daily chart-toppers update</Text>
            </View>
            <View style={[styles.chartCard, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.chartNumber}>Top 50</Text>
              <Text style={styles.chartCountry}>Trending</Text>
              <Text style={styles.chartSubtitle}>Daily chart-toppers update</Text>
            </View>
          </ScrollView>
        </View>

        {/* Trending albums */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending albums</Text>
            <Text style={styles.seeAll}>See all</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            <View style={styles.albumCard}>
              <Image 
                source={require('../../assets/images/Home - Audio Listing/Image 40.png')} 
                style={styles.albumImage}
              />
              <Text style={styles.albumTitle}>ME</Text>
              <Text style={styles.albumArtist}>Jessica Gonzalez</Text>
            </View>
            <View style={styles.albumCard}>
              <Image 
                source={require('../../assets/images/Home - Audio Listing/Image 41.png')} 
                style={styles.albumImage}
              />
              <Text style={styles.albumTitle}>Magna nost</Text>
              <Text style={styles.albumArtist}>Brian Thomas</Text>
            </View>
            <View style={styles.albumCard}>
              <Image 
                source={require('../../assets/images/Home - Audio Listing/Image 45.png')} 
                style={styles.albumImage}
              />
              <Text style={styles.albumTitle}>Magna n</Text>
              <Text style={styles.albumArtist}>Christoph</Text>
            </View>
          </ScrollView>
        </View>

        {/* Popular artists */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular artists</Text>
            <Text style={styles.seeAll}>See all</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            <View style={styles.artistCard}>
              <Image 
                source={require('../../assets/images/Home - Audio Listing/Image 46.png')} 
                style={styles.artistImage}
              />
              <Text style={styles.artistName}>Jennifer Wilson</Text>
              <TouchableOpacity style={styles.followButton}>
                <Text style={styles.followButtonText}>Follow</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.artistCard}>
              <Image 
                source={require('../../assets/images/Home - Audio Listing/Image 47.png')} 
                style={styles.artistImage}
              />
              <Text style={styles.artistName}>Elizabeth Hall</Text>
              <TouchableOpacity style={styles.followButton}>
                <Text style={styles.followButtonText}>Follow</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.artistCard}>
              <Image 
                source={require('../../assets/images/Home - Audio Listing/Avatar 3.png')} 
                style={styles.artistImage}
              />
              <Text style={styles.artistName}>Anthony</Text>
              <TouchableOpacity style={styles.followButton}>
                <Text style={styles.followButtonText}>Follow</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  seeAll: {
    fontSize: 14,
    color: '#8E8E93',
  },
  horizontalScroll: {
    paddingLeft: 16,
  },
  card: {
    width: 200,
    height: 250,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(147, 51, 234, 0.8)',
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  cardArtist: {
    fontSize: 14,
    color: '#fff',
  },
  chartCard: {
    width: 180,
    height: 140,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    justifyContent: 'center',
  },
  chartNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  chartCountry: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#666',
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
  artistCard: {
    width: 140,
    marginRight: 12,
    alignItems: 'center',
  },
  artistImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 12,
  },
  artistName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  followButton: {
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});