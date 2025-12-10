/**
 * Root Layout for Shipper App
 * Expo Router entry point
 */

import React from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { SafeFallback } from '../components/SafeFallback';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

let MainContent: React.ReactElement;

try {
  // Dynamic imports for modules that might not be available
  let apiClient: any;
  let SecureStorage: any;
  let offlineQueue: any;

  try {
    const shared = require('@rodistaa/mobile-shared');
    apiClient = shared.apiClient;
    SecureStorage = shared.SecureStorage;
    offlineQueue = shared.offlineQueue;
  } catch (err) {
    console.warn('Could not load mobile-shared modules:', err);
  }

  MainContent = () => {
    const [initError, setInitError] = useState<Error | null>(null);

    useEffect(() => {
      // Initialize auth token and device ID with error handling
      const initializeAuth = async () => {
        try {
          if (!apiClient || !SecureStorage || !offlineQueue) {
            console.warn('Mobile-shared modules not available, skipping initialization');
            return;
          }

          const token = await SecureStorage.getToken().catch(() => null);
          const deviceId = await SecureStorage.getDeviceId().catch(() => null);
          
          if (token) {
            apiClient.setAuthToken(token);
          }
          if (deviceId) {
            apiClient.setDeviceId(deviceId);
          }

          // Initialize offline queue
          await offlineQueue.initialize().catch((err: Error) => {
            console.warn('Offline queue initialization failed:', err);
          });
          
          // Process queue periodically
          const intervalId = setInterval(() => {
            offlineQueue.processQueue(apiClient).catch((err: Error) => {
              console.warn('Queue processing failed:', err);
            });
          }, 30000); // Every 30 seconds

          return () => clearInterval(intervalId);
        } catch (err) {
          console.error('Initialization error:', err);
          setInitError(err as Error);
        }
      };

      initializeAuth();
    }, []);

    if (initError) {
      return <SafeFallback error={initError} />;
    }

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
  };
} catch (err) {
  console.warn('Shipper app provider init failed:', err);
  MainContent = () => <SafeFallback error={err as Error} />;
}

export default function RootLayout() {
  return <MainContent />;
}

