import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Storage wrapper để hoạt động trên cả web và mobile
const storage = {
  // Lấy giá trị từ storage
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        // Trên web, dùng AsyncStorage
        return await AsyncStorage.getItem(key);
      } else {
        // Trên mobile, dùng SecureStore
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  },

  // Lưu giá trị vào storage
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Trên web, dùng AsyncStorage
        await AsyncStorage.setItem(key, value);
      } else {
        // Trên mobile, dùng SecureStore
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      throw error;
    }
  },

  // Xóa giá trị khỏi storage
  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Trên web, dùng AsyncStorage
        await AsyncStorage.removeItem(key);
      } else {
        // Trên mobile, dùng SecureStore
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      throw error;
    }
  },
};

export default storage;

