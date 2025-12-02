/**
 * Secure Storage for Mobile Apps
 * Wrapper around Expo SecureStore for tokens and sensitive data
 */
import * as SecureStore from 'expo-secure-store';
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';
const DEVICE_ID_KEY = 'device_id';
export class SecureStorage {
    static async getToken() {
        try {
            return await SecureStore.getItemAsync(TOKEN_KEY);
        }
        catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    }
    static async setToken(token) {
        try {
            await SecureStore.setItemAsync(TOKEN_KEY, token);
        }
        catch (error) {
            console.error('Error setting token:', error);
        }
    }
    static async removeToken() {
        try {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
        }
        catch (error) {
            console.error('Error removing token:', error);
        }
    }
    static async getRefreshToken() {
        try {
            return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        }
        catch (error) {
            console.error('Error getting refresh token:', error);
            return null;
        }
    }
    static async setRefreshToken(token) {
        try {
            await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
        }
        catch (error) {
            console.error('Error setting refresh token:', error);
        }
    }
    static async getUserData() {
        try {
            const data = await SecureStore.getItemAsync(USER_KEY);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    }
    static async setUserData(userData) {
        try {
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
        }
        catch (error) {
            console.error('Error setting user data:', error);
        }
    }
    static async getDeviceId() {
        try {
            let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
            if (!deviceId) {
                deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
            }
            return deviceId;
        }
        catch (error) {
            console.error('Error getting device ID:', error);
            return null;
        }
    }
    static async clearAll() {
        try {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
            await SecureStore.deleteItemAsync(USER_KEY);
        }
        catch (error) {
            console.error('Error clearing storage:', error);
        }
    }
}
