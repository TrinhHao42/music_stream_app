import { addAlbumToLibrary } from '@/api/musicApi';
import { useAuth } from '@/contexts/AuthContext';
import { Album } from '@/types';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import { Image } from "expo-image";
import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = { 
    album: Album;
    showAddToLibrary?: boolean;
};

const LibraryAlbumItem = ({ album, showAddToLibrary = false }: Props) => {
    const router = useRouter();
    const { user } = useAuth();

    const handlePress = () => {
        router.push({
            pathname: '/(tabs)/album-details',
            params: {
                album: JSON.stringify(album)
            }
        });
    };

    const handleAddToLibrary = async () => {
        if (!user) {
            Alert.alert('Error', 'Please login to add albums to library');
            return;
        }

        try {
            const success = await addAlbumToLibrary(user.userId, album.albumId);
            if (success) {
                Alert.alert('Success', 'Album added to library');
            } else {
                Alert.alert('Error', 'Failed to add album to library');
            }
        } catch (error) {
            console.error('Error adding to library:', error);
            Alert.alert('Error', 'Failed to add album to library');
        }
    };

    const artistNames = Array.isArray(album.artists) ? album.artists : (album as any).artist ? [ (album as any).artist ] : [];
    const shownArtists = artistNames.slice(0, 2).join(', ');
    const hasMoreArtists = artistNames.length > 2;
    const songsCount = album.songs?.length || 0;

    return (
        <TouchableOpacity
            style={styles.card} activeOpacity={0.8}
            onPress={handlePress}
        >
            <Image 
                source={album.image ? { uri: album.image } : require('../assets/images/Play an Audio/Image 58.png')} 
                style={styles.img} 
                contentFit="cover" 
                transition={0} 
                cachePolicy="memory-disk" 
            />
            <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={styles.title}>{album.albumName}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, justifyContent: 'space-between' }}>
                    <View style={{ flex: 1, paddingRight: 8, flexDirection: 'row', alignItems: 'center' }}>
                        <Text numberOfLines={1} style={{ color: '#777' }}>{shownArtists || 'Unknown'}{hasMoreArtists ? ' ...' : ''}</Text>
                    </View>
                    <View style={styles.countBadge}>
                        <Entypo name="music" size={12} color="#fff" />
                        <Text style={styles.countText}>{songsCount}</Text>
                    </View>
                </View>
            </View>
            {showAddToLibrary ? (
                <TouchableOpacity onPress={handleAddToLibrary} style={styles.iconBtn}>
                    <AntDesign name="heart" size={20} color="#1ce5ff" />
                </TouchableOpacity>
            ) : (
                <Entypo name="chevron-right" size={24} color="black" />
            )}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    card: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
    img: { width: 64, height: 64, borderRadius: 10 },
    title: { fontSize: 16, fontWeight: '600' },
    iconBtn: { padding: 4 },
    countBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#11181C', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
    countText: { color: '#fff', fontSize: 12, fontWeight: '700' },
})

export default LibraryAlbumItem