import { Album } from "@/types";
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import { Image, StyleSheet, Text, View } from "react-native";

const LibraryAlbumItem = (item: Album) => {
    return (
        <View style={styles.card}>
            <Image source={require(item.image)} style={styles.img} />
            <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
                <View>
                    <Entypo name="dot-single" size={24} color="black" />
                </View>
            </View>
            <AntDesign name="right" size={24} color="black" />
        </View>
    )
}

const styles = StyleSheet.create({
    card: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
    img: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#ddd' },
    title: { fontSize: 16, fontWeight: '600' },
})

export default LibraryAlbumItem