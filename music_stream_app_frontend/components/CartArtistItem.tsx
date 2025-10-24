import formatCompactNumber from '@/utils/FormatCompactNumber';
import Feather from '@expo/vector-icons/Feather';
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = { name: string; image: any; followers?: number; onFollow?: () => void };

const LibraryArtistItem = ({ name, image, followers, onFollow }: Props) => {
    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.8}>
            <Image source={image} style={styles.img} />
            <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={styles.title}>{name}</Text>
                {followers ?
                    <Text style={{ color: '#777' }}>
                        <Feather name="user" size={15} color="gray" style={{ marginRight: 5 }} />
                        {formatCompactNumber(followers)} Followers
                    </Text> : null}
            </View>
            <TouchableOpacity
                style={{backgroundColor: 'black', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20}}
                activeOpacity={0.8}
                onPress={onFollow}
            >
                <Text style={{ color: 'white', fontWeight: '600' }}>Follow</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    card: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
    img: { width: 64, height: 64, borderRadius: 32 },
    title: { fontSize: 16, fontWeight: '600' },
})

export default LibraryArtistItem
