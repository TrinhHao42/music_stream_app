import formatCompactNumber from '@/utils/FormatCompactNumber';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';

import Song from '@/types/Song';
import Feather from '@expo/vector-icons/Feather';
import { Image } from "expo-image";
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = { 
    song: Song;
};

const LibrarySongItem = ({ song }: Props) => {
    const router = useRouter();
    
    const handlePress = () => {
        // Truyền song object dưới dạng JSON string
        router.push({
            pathname: '/play-audio',
            params: {
                song: JSON.stringify(song)
            }
        });
    };

    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={handlePress}>
            <Image
                source={song.coverUrl ? { uri: song.coverUrl } : require('../assets/images/Play an Audio/Image 58.png')}
                style={styles.img}
                contentFit="cover" 
                transition={0}
                cachePolicy="memory-disk"
            />
            <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={styles.title}>{song.title}</Text>
                <Text numberOfLines={1} style={{ color: '#777' }}>{song.artist.join(', ')}</Text>
                <View style={{ flexDirection: 'row', gap: 2, alignItems: 'center', marginTop: 4 }}>
                    <Feather name="play" size={13} color="gray" />
                    <Text style={{ color: 'gray', fontSize: 12 }}>{formatCompactNumber(song.listens)}</Text>
                    <Entypo name="dot-single" size={24} color="gray" />
                    <Text style={{ color: 'gray', fontSize: 12 }}>{Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}</Text>
                </View>
            </View>
            <AntDesign name="heart" size={24} color="#1ce5ff" />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    card: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
    img: { width: 64, height: 64, borderRadius: 10 },
    title: { fontSize: 18, fontWeight: '600' },
})

export default LibrarySongItem
