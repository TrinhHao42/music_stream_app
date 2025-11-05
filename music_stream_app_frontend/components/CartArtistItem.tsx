import { addArtistToLibrary } from '@/api/musicApi';
import { useAuth } from '@/contexts/AuthContext';
import { Artist } from '@/types';
import formatCompactNumber from '@/utils/FormatCompactNumber';
import Feather from '@expo/vector-icons/Feather';
import { Image } from "expo-image";
import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = { 
    artist: Artist;
    showFollow?: boolean;
};

const LibraryArtistItem = ({ artist, showFollow = false }: Props) => {
    const router = useRouter();
    const { user } = useAuth();

    const handlePress = () => {
        router.push({
            pathname: '/(tabs)/artist-profile',
            params: {
                artist: JSON.stringify(artist)
            }
        });
    };

    const handleFollow = async () => {
        if (!user) {
            Alert.alert('Error', 'Please login to follow artists');
            return;
        }

        try {
            const success = await addArtistToLibrary(user.userId, artist.artistId);
            if (success) {
                Alert.alert('Success', 'Artist added to library');
            } else {
                Alert.alert('Error', 'Failed to follow artist');
            }
        } catch (error) {
            console.error('Error following artist:', error);
            Alert.alert('Error', 'Failed to follow artist');
        }
    };

    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={handlePress}
        >
            <Image 
                source={artist.artistImage ? { uri: artist.artistImage } : require('../assets/images/Play an Audio/Image 58.png')} 
                style={styles.img} 
                contentFit="cover" 
                transition={0} 
                cachePolicy="memory-disk" 
            />
            <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={styles.title}>{artist.artistName}</Text>
                {artist.followers !== undefined && (
                    <Text style={{ color: '#777' }}>
                        <Feather name="user" size={15} color="gray" style={{ marginRight: 5 }} />
                        {formatCompactNumber(artist.followers)} Followers
                    </Text>
                )}
            </View>
            {showFollow && (
                <TouchableOpacity
                    style={{ backgroundColor: 'black', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}
                    activeOpacity={0.8}
                    onPress={handleFollow}
                >
                    <Text style={{ color: 'white', fontWeight: '600' }}>Follow</Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    card: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
    img: { width: 64, height: 64, borderRadius: 32 },
    title: { fontSize: 16, fontWeight: '600' },
})

export default LibraryArtistItem
