import Entypo from '@expo/vector-icons/Entypo';
import { Image } from "expo-image";
import { useNavigation } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = { title: string; artistName: string; numOfSongs: number; image: any };

const LibraryAlbumItem = ({ title, artistName, numOfSongs, image }: Props) => {
    const navigation = useNavigation();

    return (
        <TouchableOpacity
            style={styles.card} activeOpacity={0.8}
            onPress={() => navigation.navigate('playlistdetails' as never)}
        >
            <Image source={image} style={styles.img} contentFit="cover" transition={0} cachePolicy="memory-disk" />
            <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={styles.title}>{title}</Text>
                <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', marginTop: 4 }}>
                    <Text style={{ color: '#777' }}>{artistName}</Text>
                    <Entypo name="dot-single" size={24} color="gray" />
                    <Text style={{ color: '#777' }}>{numOfSongs} songs</Text>
                </View>
            </View>
            <Entypo name="chevron-right" size={24} color="black" />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    card: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
    img: { width: 64, height: 64, borderRadius: 10 },
    title: { fontSize: 16, fontWeight: '600' },
})

export default LibraryAlbumItem