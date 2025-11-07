import axios from 'axios';
import storage from './storage';
import { isTokenExpired, isTokenExpiringSoon, logTokenInfo } from './tokenUtils';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag để tránh multiple refresh cùng lúc
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

// Flag để skip refresh logic khi đang login/logout
let isAuthenticating = false;

export const setAuthenticating = (value: boolean) => {
  isAuthenticating = value;
};

/**
 * Refresh access token sử dụng refresh token
 */
const refreshAccessToken = async (): Promise<string> => {
  // Nếu đang refresh, đợi request hiện tại
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = await storage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('NO_REFRESH_TOKEN');
      }

      console.log('🔄 Refreshing access token...');
      
      // Call refresh token API
      const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
        refreshToken,
      });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

      // Save new tokens
      await storage.setItem('accessToken', newAccessToken);
      if (newRefreshToken) {
        await storage.setItem('refreshToken', newRefreshToken);
      }

      console.log('✅ Token refreshed successfully!');
      
      // Log new token info for debugging
      if (__DEV__) {
        logTokenInfo(newAccessToken, 'access');
      }

      return newAccessToken;
    } catch (error: any) {
      console.error('❌ Failed to refresh token:', error.message);
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// Request interceptor to add access token and check expiration
axiosInstance.interceptors.request.use(
  async (config) => {
    let accessToken = await storage.getItem('accessToken');
    
    if (accessToken) {
      // Kiểm tra xem token có hết hạn hoặc sắp hết hạn không
      if (isTokenExpired(accessToken)) {
        console.log('⚠️ Access token đã hết hạn, refreshing...');
        try {
          accessToken = await refreshAccessToken();
        } catch (error) {
          // Nếu refresh thất bại, để response interceptor xử lý
          console.error('Failed to refresh in request interceptor');
        }
      } else if (isTokenExpiringSoon(accessToken, 5)) {
        console.log('⏰ Access token sắp hết hạn (< 5 phút), refreshing proactively...');
        // Refresh in background, không block request hiện tại
        refreshAccessToken().catch(console.error);
      }
      
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global event emitter for auth errors
let authErrorCallback: ((error: any) => void) | null = null;

export const setAuthErrorCallback = (callback: (error: any) => void) => {
  authErrorCallback = callback;
};

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh logic nếu đang authenticate (login/logout)
    if (isAuthenticating) {
      return Promise.reject(error);
    }

    // Check if error is 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log('🔄 401 Error - Attempting token refresh...');
        
        // Thử refresh token
        const newAccessToken = await refreshAccessToken();
        
        // Retry original request với token mới
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
        
      } catch (refreshError: any) {
        // Refresh failed, clear tokens and logout
        console.log('❌ Refresh token thất bại hoặc hết hạn, logging out...');
        
        await storage.removeItem('accessToken');
        await storage.removeItem('refreshToken');
        await storage.removeItem('user');
        
        if (authErrorCallback) {
          const errorType = refreshError.message === 'NO_REFRESH_TOKEN' 
            ? 'NO_REFRESH_TOKEN' 
            : 'REFRESH_FAILED';
          authErrorCallback({ type: errorType, error: refreshError });
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
