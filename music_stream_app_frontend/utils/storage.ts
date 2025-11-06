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
        // Trên mobile, thử dùng SecureStore, fallback về AsyncStorage nếu lỗi
        try {
          return await SecureStore.getItemAsync(key);
        } catch (error) {
          console.warn(`SecureStore failed for ${key}, falling back to AsyncStorage:`, error);
          return await AsyncStorage.getItem(key);
        }
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
        // Trên mobile, thử dùng SecureStore, fallback về AsyncStorage nếu lỗi
        try {
          await SecureStore.setItemAsync(key, value);
        } catch (error) {
          console.warn(`SecureStore failed for ${key}, falling back to AsyncStorage:`, error);
          await AsyncStorage.setItem(key, value);
        }
      }
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      // Không throw để tránh crash app, chỉ log lỗi
    }
  },

  // Xóa giá trị khỏi storage
  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Trên web, dùng AsyncStorage
        await AsyncStorage.removeItem(key);
      } else {
        // Trên mobile, thử dùng SecureStore, fallback về AsyncStorage nếu lỗi
        try {
          await SecureStore.deleteItemAsync(key);
        } catch (error) {
          console.warn(`SecureStore failed for ${key}, falling back to AsyncStorage:`, error);
          await AsyncStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      // Không throw để tránh crash app, chỉ log lỗi
    }
  },
};

export default storage;

