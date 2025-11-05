import formatCompactNumber from '@/utils/FormatCompactNumber';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';

import { addSongToLibrary, addSongToPlaylist, getUserPlaylists } from '@/api/musicApi';
import { useAuth } from '@/contexts/AuthContext';
import Song from '@/types/Song';
import Feather from '@expo/vector-icons/Feather';
import { Directory, Paths } from 'expo-file-system';
import { Image } from "expo-image";
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = { 
    song: Song;
    showAddToLibrary?: boolean;
    showAddToPlaylist?: boolean;
    showDownloaded?: boolean;
};

const LibrarySongItem = ({ song, showAddToLibrary = false, showAddToPlaylist = false, showDownloaded = false }: Props) => {
    const router = useRouter();
    const { user } = useAuth();
    const [modalVisible, setModalVisible] = useState(false);
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [loadingPlaylists, setLoadingPlaylists] = useState(false);
    const [isDownloaded, setIsDownloaded] = useState(false);
    
    useEffect(() => {
        if (showDownloaded) {
            checkIfDownloaded();
        }
    }, [song.songId]);

    const checkIfDownloaded = async () => {
        try {
            const dir = new Directory(Paths.document);
            const files = await dir.list();
            const fileName = `${song.songId}.mp3`;
            setIsDownloaded(files.some(file => file.name === fileName));
        } catch (error) {
            console.error('Error checking download status:', error);
        }
    };
    
    const handlePress = () => {
        // Truyền song object dưới dạng JSON string
        router.push({
            pathname: '/song-details',
            params: {
                song: JSON.stringify(song)
            }
        });
    };

    const handleAddToLibrary = async () => {
        if (!user) {
            Alert.alert('Error', 'Please login to add songs to library');
            return;
        }

        try {
            const success = await addSongToLibrary(user.userId, song.songId);
            if (success) {
                Alert.alert('Success', 'Song added to library');
            } else {
                Alert.alert('Error', 'Failed to add song to library');
            }
        } catch (error) {
            console.error('Error adding to library:', error);
            Alert.alert('Error', 'Failed to add song to library');
        }
    };

    const handleAddToPlaylist = async () => {
        if (!user) {
            Alert.alert('Error', 'Please login to add songs to playlist');
            return;
        }

        setLoadingPlaylists(true);
        setModalVisible(true);
        
        try {
            const userPlaylists = await getUserPlaylists(user.userId);
            setPlaylists(userPlaylists);
        } catch (error) {
            console.error('Error loading playlists:', error);
            Alert.alert('Error', 'Failed to load playlists');
        } finally {
            setLoadingPlaylists(false);
        }
    };

    const handleSelectPlaylist = async (playlistId: string) => {
        try {
            const success = await addSongToPlaylist(playlistId, song.songId);
            if (success) {
                Alert.alert('Success', 'Song added to playlist');
                setModalVisible(false);
            } else {
                Alert.alert('Error', 'Failed to add song to playlist');
            }
        } catch (error) {
            console.error('Error adding to playlist:', error);
            Alert.alert('Error', 'Failed to add song to playlist');
        }
    };

    return (
        <>
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
                    {showDownloaded && isDownloaded && (
                        <Text style={styles.downloadedText}>Downloaded</Text>
                    )}
                </View>
                <View style={styles.actions}>
                    {showAddToLibrary && (
                        <TouchableOpacity onPress={handleAddToLibrary} style={styles.iconBtn}>
                            <AntDesign name="heart" size={20} color="#1ce5ff" />
                        </TouchableOpacity>
                    )}
                    {showAddToPlaylist && (
                        <TouchableOpacity onPress={handleAddToPlaylist} style={styles.iconBtn}>
                            <AntDesign name="plus" size={20} color="#666" />
                        </TouchableOpacity>
                    )}
                    {!showAddToLibrary && !showAddToPlaylist && (
                        <AntDesign name="heart" size={24} color="#1ce5ff" />
                    )}
                </View>
            </TouchableOpacity>

            {/* Playlist Selection Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add to Playlist</Text>
                        
                        {loadingPlaylists ? (
                            <ActivityIndicator size="large" color="#1ce5ff" />
                        ) : (
                            <FlatList
                                data={playlists}
                                keyExtractor={(item) => item.playlistId}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.playlistItem}
                                        onPress={() => handleSelectPlaylist(item.playlistId)}
                                    >
                                        <Text style={styles.playlistName}>{item.playlistName}</Text>
                                        <Text style={styles.playlistSongs}>{item.songs?.length || 0} songs</Text>
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    <Text style={styles.emptyText}>No playlists found. Create one first!</Text>
                                }
                            />
                        )}
                        
                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeBtnText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    card: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
    img: { width: 64, height: 64, borderRadius: 10 },
    title: { fontSize: 18, fontWeight: '600' },
    downloadedText: { 
        color: '#4CAF50', 
        fontSize: 11, 
        fontWeight: '600', 
        marginTop: 2 
    },
    actions: { 
        flexDirection: 'row', 
        gap: 8, 
        alignItems: 'center' 
    },
    iconBtn: { 
        padding: 4 
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '70%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
        textAlign: 'center',
    },
    playlistItem: {
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#eee',
    },
    playlistName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#11181C',
    },
    playlistSongs: {
        fontSize: 13,
        color: '#687076',
        marginTop: 2,
    },
    emptyText: {
        textAlign: 'center',
        color: '#687076',
        marginVertical: 20,
    },
    closeBtn: {
        marginTop: 16,
        backgroundColor: '#E6E8EB',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    closeBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#11181C',
    },
})

export default LibrarySongItem
