import axios from 'axios';
import storage from './storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add access token to headers
axiosInstance.interceptors.request.use(
  async (config) => {
    const accessToken = await storage.getItem('accessToken');
    if (accessToken) {
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

// Response interceptor to handle token refresh and expiration
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is JWT expired (401 Unauthorized)
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || error.message || '';
      const isJWTExpired = errorMessage.includes('JWT expired') || 
                          errorMessage.includes('expired') ||
                          errorMessage.includes('Token expired');

      // If JWT expired, clear all auth data and notify app
      if (isJWTExpired) {
        console.log('🔒 JWT Token đã hết hạn, đang logout...');
        
        // Clear all storage
        await storage.removeItem('accessToken');
        await storage.removeItem('refreshToken');
        await storage.removeItem('user');

        // Notify the app (AuthContext) to logout
        if (authErrorCallback) {
          authErrorCallback({ type: 'JWT_EXPIRED', error });
        }

        return Promise.reject(new Error('JWT_EXPIRED'));
      }

      // Try refresh token if not expired and haven't retried yet
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = await storage.getItem('refreshToken');
          
          if (!refreshToken) {
            // No refresh token, clear and logout
            await storage.removeItem('accessToken');
            await storage.removeItem('refreshToken');
            await storage.removeItem('user');
            
            if (authErrorCallback) {
              authErrorCallback({ type: 'NO_REFRESH_TOKEN', error });
            }
            
            return Promise.reject(error);
          }

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

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and logout
          console.log('🔒 Refresh token thất bại, đang logout...');
          
          await storage.removeItem('accessToken');
          await storage.removeItem('refreshToken');
          await storage.removeItem('user');
          
          if (authErrorCallback) {
            authErrorCallback({ type: 'REFRESH_FAILED', error: refreshError });
          }
          
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
