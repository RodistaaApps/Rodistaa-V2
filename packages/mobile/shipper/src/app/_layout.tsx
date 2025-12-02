/**
 * Root Layout for Shipper App
 * Expo Router entry point
 */

import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { apiClient } from '@rodistaa/mobile-shared';
import { SecureStorage } from '@rodistaa/mobile-shared';
import { offlineQueue } from '@rodistaa/mobile-shared';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function RootLayout() {
  useEffect(() => {
    // Initialize auth token and device ID
    const initializeAuth = async () => {
      const token = await SecureStorage.getToken();
      const deviceId = await SecureStorage.getDeviceId();
      
      if (token) {
        apiClient.setAuthToken(token);
      }
      if (deviceId) {
        apiClient.setDeviceId(deviceId);
      }

      // Initialize offline queue
      await offlineQueue.initialize();
      
      // Process queue periodically
      setInterval(() => {
        offlineQueue.processQueue(apiClient);
      }, 30000); // Every 30 seconds
    };

    initializeAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#C90D0D',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontFamily: 'Times New Roman',
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Rodistaa Shipper' }} />
        <Stack.Screen name="login" options={{ title: 'Login' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}

