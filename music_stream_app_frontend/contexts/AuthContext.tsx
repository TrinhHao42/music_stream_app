import React, { createContext, useContext, useEffect, useState } from 'react';
import { logout as apiLogout, getCurrentUser } from '../api/musicApi';
import User from '../types/User';
import axiosInstance, { setAuthErrorCallback } from '../utils/axiosInstance';
import storage from '../utils/storage';
import { Alert } from 'react-native';

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
    const [isPremium, setIsPremium ] = useState<boolean>(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load stored auth data on mount
    useEffect(() => {
        loadStoredAuth();
        
        // Setup auth error callback để handle JWT expiration
        setAuthErrorCallback(async (authError) => {
            console.log('🔒 Auth error detected:', authError.type);
            
            if (authError.type === 'JWT_EXPIRED') {
                // Clear local state
                setAccessToken(null);
                setRefreshToken(null);
                setUser(null);
                
                // Show alert to user
                Alert.alert(
                    'Phiên đăng nhập đã hết hạn',
                    'Vui lòng đăng nhập lại để tiếp tục sử dụng ứng dụng.',
                    [{ text: 'OK' }]
                );
            } else if (authError.type === 'NO_REFRESH_TOKEN' || authError.type === 'REFRESH_FAILED') {
                // Clear local state
                setAccessToken(null);
                setRefreshToken(null);
                setUser(null);
            }
        });
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedAccessToken = await storage.getItem('accessToken');
            const storedRefreshToken = await storage.getItem('refreshToken');
            const storedUser = await storage.getItem('user');

            if (storedAccessToken && storedRefreshToken && storedUser) {
                setAccessToken(storedAccessToken);
                setRefreshToken(storedRefreshToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Error loading stored auth:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
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

            // Update state
            setAccessToken(accessToken);
            setRefreshToken(refreshToken);
            setUser(user);
            setIsPremium(isPremium);
        } catch (error: any) {
            console.error('Login error:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);

            if (error.code === 'ERR_NETWORK') {
                throw new Error('Cannot connect to server. Please check if backend is running on http://localhost:8080');
            }

            throw new Error(error.response?.data?.message || error.message || 'Login failed');
        }
    };

    const register = async (email: string, password: string, userName: string) => {
        try {
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

            throw new Error(error.response?.data?.message || error.message || 'Registration failed');
        }
    };

    const logout = async () => {
        try {
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

            // Clear state
            setAccessToken(null);
            setRefreshToken(null);
            setUser(null);
        } catch (error) {
            console.error('Error clearing storage:', error);
            // Force clear state even if storage fails
            setAccessToken(null);
            setRefreshToken(null);
            setUser(null);
        }
    };

    const refreshUserData = async () => {
        try {
            const userData = await getCurrentUser();
            if (userData) {
                setUser(userData);
                await storage.setItem('user', JSON.stringify(userData));
            }
        } catch (error) {
            console.error('Error refreshing user data:', error);
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
