import { useAuth } from '@/contexts/AuthContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const RAW_USER = {
  _id: 'user23',
  user_name: 'Khang Đẹp Trai',
  gender: true,
  birthday: { $date: { $numberLong: '1089997200000' } },
  accounts: { $ref: 'accounts', $id: 'acc324' },
  playlists: [],
  follow_list: [],
  like_list: [],
  favourite_albums: [],
  _class: 'iuh.fit.se.music_stream_app_backend.models.User',
};

const UserScreen = () => {
  const { logout, user: authUser } = useAuth();
  
  const parseUser = () => {
    const ts = Number(RAW_USER.birthday?.$date?.$numberLong || 0);
    const date = ts ? new Date(ts) : undefined;
    return {
      id: RAW_USER._id,
      name: RAW_USER.user_name,
      genderBool: !!RAW_USER.gender,
      birthdayISO: date
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        : '',
      accountId: RAW_USER.accounts?.$id ?? '—',
      playlists: RAW_USER.playlists?.length ?? 0,
      follows: RAW_USER.follow_list?.length ?? 0,
      likes: RAW_USER.like_list?.length ?? 0,
      favouriteAlbums: RAW_USER.favourite_albums?.length ?? 0,
    };
  };

  const [user, setUser] = useState(parseUser());
  const [showEditor, setShowEditor] = useState(false);

  const [nameInput, setNameInput] = useState(user.name);
  const [genderInput, setGenderInput] = useState<boolean>(user.genderBool);
  const [birthdayInput, setBirthdayInput] = useState(user.birthdayISO);

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/launch');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const Row = ({ label, value }: { label: string; value: string | number }) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{String(value)}</Text>
    </View>
  );

  const Stat = ({ num, label }: { num: number | string; label: string }) => (
    <View style={styles.statBox}>
      <Text style={styles.statNum}>{num}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  // mock playlists hiển thị dưới
  const playlists = [
    { id: 'p1', title: 'Shazam', likes: 7, image: require('@/assets/images/My Library/Image 101.png') },
    { id: 'p2', title: 'Roadtrip', likes: 4, image: require('@/assets/images/My Library/Image 102.png') },
    { id: 'p3', title: 'Study', likes: 5, image: require('@/assets/images/My Library/Image 103.png') },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header avatar + tên */}
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/Feed - Audio Listing/Avatar 4.png')}
          style={styles.avatar}
          contentFit="cover"
          transition={0}
          cachePolicy="memory-disk"
        />
        <Text style={styles.name}>{user.name}</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.editBtn}
          onPress={() => setShowEditor((s) => !s)}
        >
          <Text style={styles.editText}>{showEditor ? 'Close' : 'Edit Profile'}</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.logoutBtn}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Stat num={user.playlists} label="PLAYLISTS" />
        <Stat num={user.likes} label="FOLLOWERS" />
        <Stat num={user.follows} label="FOLLOWING" />
      </View>

      {/* Editor (toggle khi bấm Edit Profile) */}
      {showEditor && (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Profile details</Text>
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>Tên</Text>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              style={styles.formInput}
              placeholder="Tên người dùng"
            />
          </View>
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>Giới tính</Text>
            <View style={styles.segment}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.segmentBtn, genderInput && styles.segmentActive]}
                onPress={() => setGenderInput(true)}
              >
                <Text style={[styles.segmentText, genderInput && styles.segmentTextActive]}>Nam</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.segmentBtn, !genderInput && styles.segmentActive]}
                onPress={() => setGenderInput(false)}
              >
                <Text style={[styles.segmentText, !genderInput && styles.segmentTextActive]}>Nữ</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>Ngày sinh</Text>
            <TextInput
              value={birthdayInput}
              onChangeText={setBirthdayInput}
              style={styles.formInput}
              placeholder="YYYY-MM-DD"
            />
          </View>
          <View style={styles.formActions}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.saveBtn, { backgroundColor: '#11181C' }]}
              onPress={() => {
                setUser((u) => ({ ...u, name: nameInput.trim() || u.name, genderBool: genderInput, birthdayISO: birthdayInput }));
                setShowEditor(false);
              }}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.saveBtn, { backgroundColor: '#E6E8EB' }]}
              onPress={() => {
                setNameInput(user.name);
                setGenderInput(user.genderBool);
                setBirthdayInput(user.birthdayISO);
                setShowEditor(false);
              }}
            >
              <Text style={[styles.saveText, { color: '#11181C' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <Row label="ID" value={user.id} />
          <Row label="Giới tính" value={user.genderBool ? 'Nam' : 'Nữ'} />
          <Row label="Ngày sinh" value={user.birthdayISO || '—'} />
          <Row label="Account ID" value={user.accountId} />
        </View>
      )}

      {/* Playlists section */}
      <Text style={styles.sectionTitle}>Playlists</Text>
      <View style={styles.list}>
        {playlists.map((p) => (
          <TouchableOpacity key={p.id} activeOpacity={0.7} style={styles.listItem}>
            <Image source={p.image} style={styles.cover} contentFit="cover" transition={0} cachePolicy="memory-disk" />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{p.title}</Text>
              <Text style={styles.itemSub}>{p.likes} likes</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9BA1A6" />
          </TouchableOpacity>
        ))}
        <TouchableOpacity activeOpacity={0.7} style={styles.seeAll}>
          <Text style={styles.seeAllText}>See all playlists</Text>
          <Ionicons name="chevron-forward" size={18} color="#11181C" />
        </TouchableOpacity>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 16 },

  header: { alignItems: 'center', marginBottom: 12 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginTop: 8 },
  name: { marginTop: 10, fontSize: 18, color: '#11181C', fontWeight: '700' },
  editBtn: { marginTop: 10, backgroundColor: '#3D3D3D', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  editText: { color: 'white', fontWeight: '600' },

  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#E53935', 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    borderRadius: 10, 
    marginTop: 12,
    gap: 8,
  },
  logoutText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8, marginBottom: 16 },
  statBox: { alignItems: 'center' },
  statNum: { color: '#11181C', fontSize: 16, fontWeight: '700' },
  statLabel: { color: '#687076', fontSize: 12, marginTop: 2 },

  infoCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6E8EB', borderRadius: 12, padding: 12, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  label: { color: '#687076', fontSize: 14 },
  value: { color: '#11181C', fontSize: 15, fontWeight: '600' },

  formRow: { marginBottom: 10 },
  formLabel: { color: '#687076', fontSize: 13, marginBottom: 6 },
  formInput: { borderWidth: 1, borderColor: '#E6E8EB', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, color: '#11181C' },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 6, marginBottom: 6 },
  saveBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  saveText: { color: '#FFFFFF', fontWeight: '700' },
  segment: { flexDirection: 'row', backgroundColor: '#F3F4F5', borderRadius: 10, padding: 3 },
  segmentBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  segmentActive: { backgroundColor: '#11181C' },
  segmentText: { color: '#11181C', fontWeight: '600' },
  segmentTextActive: { color: '#FFFFFF' },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#11181C', marginBottom: 10 },
  list: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6E8EB', borderRadius: 12, paddingVertical: 4 },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E6E8EB' },
  cover: { width: 44, height: 44, borderRadius: 8, marginRight: 12 },
  itemTitle: { color: '#11181C', fontSize: 15, fontWeight: '600' },
  itemSub: { color: '#687076', fontSize: 12, marginTop: 2 },
  seeAll: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12 },
  seeAllText: { color: '#11181C', fontSize: 14, fontWeight: '600' },
});

export default UserScreen;


