import Entypo from '@expo/vector-icons/Entypo';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const results = ['Result 1', 'Result 2', 'Result 3', 'Result 4', 'Result 5', 'Result 6', 'Result 7', 'Result 8', 'Result 9', 'Result 10', 'Result 11', 'Result 12', 'Result 13', 'Result 14', 'Result 15'];

export default function SearchAudio() {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.searchBox,
          isFocused && { borderColor: '#09bfd7' },
        ]}
      >
        <TextInput
          placeholder="Search"
          style={styles.input}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity
          style={{ backgroundColor: 'black', borderRadius: '50%' }}
          activeOpacity={0.6}
          onPress={() => {setSearchText('')}}
        >
          <Entypo name="cross" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={results}
        contentContainerStyle={{ padding: 12 }}
        scrollEnabled={true}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} activeOpacity={0.7}>
            <Text style={styles.title}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchBox: {
    margin: 12,
    borderRadius: 25,
    backgroundColor: '#f3f3f3',
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  title: { fontSize: 15, color: 'gray' },
});
