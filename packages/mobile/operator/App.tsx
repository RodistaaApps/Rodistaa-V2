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
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import MainTabs from './src/navigation/MainTabs';
import { SafeFallback } from './src/components/SafeFallback';

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

let Content: React.ReactElement;

try {
  // Wrap providers in try/catch to prevent crashes
  Content = (
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
  );
} catch (err) {
  console.warn('Provider init failed:', err);
  Content = <SafeFallback error={err as Error} />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      {Content}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

