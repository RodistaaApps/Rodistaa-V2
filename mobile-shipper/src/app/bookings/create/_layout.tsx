/**
 * Post Load Wizard Layout
 * Multi-step flow for creating bookings
 */

import { Stack } from 'expo-router';

export default function PostLoadLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: 'Post Load',
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="pickup-drop" options={{ title: 'Pickup & Drop' }} />
      <Stack.Screen name="material-weight" options={{ title: 'Material & Weight' }} />
      <Stack.Screen name="price-suggestion" options={{ title: 'Price Suggestion' }} />
      <Stack.Screen name="review" options={{ title: 'Review & Submit' }} />
    </Stack>
  );
}

