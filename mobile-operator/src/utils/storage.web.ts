/**
 * Storage utility - Web implementation
 * Replaces expo-secure-store for web platform
 */

export const SecureStore = {
  async setItemAsync(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('SecureStore.setItemAsync error:', error);
      throw error;
    }
  },

  async getItemAsync(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('SecureStore.getItemAsync error:', error);
      return null;
    }
  },

  async deleteItemAsync(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('SecureStore.deleteItemAsync error:', error);
      throw error;
    }
  },
};

