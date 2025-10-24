import formatCompactNumber from '@/utils/FormatCompactNumber';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';

import Feather from '@expo/vector-icons/Feather';
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = { title: string; artistName: string; views: number; duration: string; image: any };

const LibrarySongItem = ({ title, artistName, views, duration, image }: Props) => {
    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.8}>
            <Image source={image} style={styles.img} />
            <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={styles.title}>{title}</Text>
                <Text numberOfLines={1} style={{ color: '#777' }}>{artistName}</Text>
                <View style={{ flexDirection: 'row', gap: 2, alignItems: 'center', marginTop: 4 }}>
                    <Feather name="play" size={13} color="gray" />
                    <Text style={{ color: 'gray', fontSize: 12 }}>{formatCompactNumber(views)}</Text>
                    <Entypo name="dot-single" size={24} color="gray" />
                    <Text style={{ color: 'gray', fontSize: 12 }}>{duration}</Text>
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
