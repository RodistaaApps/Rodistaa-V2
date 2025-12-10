/**
 * Rodistaa Operator App
 * Pure React Native + React Native Web (No Expo)
 * 
 * Runs on:
 * - Android (via React Native)
 * - iOS (via React Native)
 * - Web/Chrome (via React Native Web)
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import MainTabs from './src/navigation/MainTabs';
import SafeFallback from './src/components/SafeFallback';

// Optional gesture handler support
let GestureHandlerRootView: any;
try {
  GestureHandlerRootView = require('react-native-gesture-handler').GestureHandlerRootView;
} catch {
  // Gesture handler not available, use View as fallback
  GestureHandlerRootView = View;
}

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    // Catch any unhandled errors
    const errorHandler = (error: ErrorEvent) => {
      console.error('Unhandled error:', error);
      setHasError(true);
      setError(new Error(error.message || 'Unknown error'));
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError && error) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <SafeFallback error={error} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Login"
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Main" component={MainTabs} />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    minHeight: '100vh',
    ...(Platform.OS === 'web' ? { display: 'flex', flexDirection: 'column' } : {}),
  },
});

