import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { logout as apiLogout, createLibrary, getCurrentUser, getLibrary } from '../api/musicApi';
import User from '../types/User';
import axiosInstance, { setAuthErrorCallback, setAuthenticating } from '../utils/axiosInstance';
import storage from '../utils/storage';
import { logTokenInfo } from '../utils/tokenUtils';

interface AuthContextType {
    user: User | null;
    isPremium: boolean;
    setUser: (user: User | null) => void;
    accessToken: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, userName: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isPremium: false,
    setUser: () => {},
    accessToken: null,
    refreshToken: null,
    isLoading: true,
    login: async () => { },
    register: async () => { },
    logout: async () => { },
    refreshUserData: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isPremium, setIsPremium] = useState<boolean>(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load stored auth data on mount
    useEffect(() => {
        loadStoredAuth();

        // Setup auth error callback để handle token expiration
        setAuthErrorCallback(async (authError) => {
            console.log('🔒 Auth error detected:', authError.type);

            // Clear local state
            setAccessToken(null);
            setRefreshToken(null);
            setUser(null);

            // Show appropriate message based on error type
            if (authError.type === 'NO_REFRESH_TOKEN') {
                Alert.alert(
                    'Phiên đăng nhập đã hết hạn',
                    'Vui lòng đăng nhập lại để tiếp tục sử dụng ứng dụng.',
                    [{ text: 'OK' }]
                );
            } else if (authError.type === 'REFRESH_FAILED') {
                Alert.alert(
                    'Phiên đăng nhập đã hết hạn',
                    'Không thể làm mới phiên đăng nhập. Vui lòng đăng nhập lại.',
                    [{ text: 'OK' }]
                );
            }
        });
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedAccessToken = await storage.getItem('accessToken');
            const storedRefreshToken = await storage.getItem('refreshToken');
            const storedUser = await storage.getItem('user');
            const storedIsPremium = await storage.getItem('isPremium');

            if (storedAccessToken && storedRefreshToken && storedUser) {
                setAccessToken(storedAccessToken);
                setRefreshToken(storedRefreshToken);
                setUser(JSON.parse(storedUser));
                if (storedIsPremium !== null) {
                    setIsPremium(JSON.parse(storedIsPremium) === true);
                }
            }
        } catch (error) {
            console.error('Error loading stored auth:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            // Set flag để skip refresh logic trong lúc login
            setAuthenticating(true);

            const response = await axiosInstance.post('/api/auth/login', {
                email,
                password,
            });

            const { accessToken, refreshToken, user, isPremium } = response.data;

            // Save tokens and user to storage
            await storage.setItem('accessToken', accessToken);
            await storage.setItem('refreshToken', refreshToken);
            await storage.setItem('user', JSON.stringify(user));
            await storage.setItem('isPremium', JSON.stringify(isPremium));

            // Log token info để debug (chỉ trong development)
            if (__DEV__) {
                console.log('\n🔐 === LOGIN SUCCESSFUL ===');
                logTokenInfo(accessToken, 'access');
                logTokenInfo(refreshToken, 'refresh');
                console.log('=========================\n');
            }

            // Update state
            setAccessToken(accessToken);
            setRefreshToken(refreshToken);
            setUser(user);
            setIsPremium(isPremium);

            // Auto-create library if not exists (for new users)
            try {
                const library = await getLibrary(user.userId);
                if (!library) {
                    console.log('Library not found, creating new library for user:', user.userId);
                    const created = await createLibrary(user.userId);
                    if (created) {
                        console.log('Library created successfully');
                    }
                }
            } catch (libraryError) {
                console.warn('Failed to check/create library (non-critical):', libraryError);
            }
        } catch (error: any) {
            console.error('Login error:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);

            if (error.code === 'ERR_NETWORK') {
                throw new Error('Cannot connect to server. Please check if backend is running on http://localhost:8080');
            }

            throw new Error(error.response?.data?.message || error.message || 'Login failed');
        } finally {
            // Reset flag sau khi login xong (thành công hoặc thất bại)
            setAuthenticating(false);
        }
    };

    const register = async (email: string, password: string, userName: string) => {
        try {
            // Set flag để skip refresh logic trong lúc register
            setAuthenticating(true);

            console.log('Attempting register with:', { email, userName, baseURL: axiosInstance.defaults.baseURL });

            await axiosInstance.post('/api/auth/register', {
                email,
                password,
                userName,
            });

            console.log('Registration successful');
        } catch (error: any) {
            console.error('Register error:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);

            if (error.code === 'ERR_NETWORK') {
                throw new Error('Cannot connect to server. Please check if backend is running on http://localhost:8080');
            }

            // Handle specific error codes
            if (error.response?.status === 409) {
                throw new Error('This email is already registered. Please use a different email or login.');
            }

            throw new Error(error.response?.data?.message || error.message || 'Registration failed');
        } finally {
            // Reset flag sau khi register xong
            setAuthenticating(false);
        }
    };

    const logout = async () => {
        try {
            // Set flag để skip refresh logic trong lúc logout
            setAuthenticating(true);

            // Call backend logout API
            await apiLogout();
        } catch (error) {
            console.error('Error calling logout API:', error);
            // Continue with local cleanup even if API call fails
        }

        try {
            // Clear storage - always execute this regardless of API call result
            await storage.removeItem('accessToken');
            await storage.removeItem('refreshToken');
            await storage.removeItem('user');
            await storage.removeItem('isPremium');

            // Clear state
            setAccessToken(null);
            setRefreshToken(null);
            setIsPremium(false);
            setUser(null);
        } catch (error) {
            console.error('Error clearing storage:', error);
            // Force clear state even if storage fails
            setAccessToken(null);
            setRefreshToken(null);
            setUser(null);
            setIsPremium(false);
        } finally {
            // Reset flag sau khi logout xong
            setAuthenticating(false);
        }
    };

    const refreshUserData = async () => {
        try {
            const userData = await getCurrentUser();
            console.log(userData);
            if (userData) {
                setUser(userData);
                setIsPremium(Boolean(userData.isPremium));
                // Lưu vào storage, nhưng không throw nếu lỗi để tránh crash
                try {
                    await storage.setItem('user', JSON.stringify(userData));
                    await storage.setItem('isPremium', JSON.stringify(userData.isPremium));
                } catch (storageError) {
                    console.warn('Failed to save user data to storage (non-critical):', storageError);
                    // Vẫn tiếp tục vì state đã được update
                }
            }
        } catch (error) {
            console.error('Error refreshing user data:', error);
            // Không throw để tránh crash app
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isPremium,
                setUser,
                accessToken,
                refreshToken,
                isLoading,
                login,
                register,
                logout,
                refreshUserData,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
