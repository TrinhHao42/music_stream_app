import { Song } from "@/types"
import { Image, StyleSheet, Text, View } from "react-native"

const LibrarySongItem = (item: Song) => {
    return (
        <View style={styles.card}>
            <Image source={require(item.image)} style={styles.img} />
            <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
    img: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#ddd' },
    title: { fontSize: 16, fontWeight: '600' },
})

export default LibrarySongItem
