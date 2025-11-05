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
                <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', marginTop: 4 }}>
                    <Text style={{ color: '#777' }}>{album.artists?.join(', ') || 'Unknown'}</Text>
                    <Entypo name="dot-single" size={24} color="gray" />
                    <Text style={{ color: '#777' }}>{album.songs?.length || 0} songs</Text>
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
})

export default LibraryAlbumItem