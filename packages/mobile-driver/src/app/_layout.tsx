/**
 * Root Layout for Driver App
 */

import React from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeFallback } from '../components/SafeFallback';

const queryClient = new QueryClient();

let Content: React.ReactElement;

try {
  Content = (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </QueryClientProvider>
  );
} catch (err) {
  console.warn('Driver app provider init failed:', err);
  Content = <SafeFallback error={err as Error} />;
}

export default function RootLayout() {
  return Content;
}
