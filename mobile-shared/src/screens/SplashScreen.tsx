/**
 * Splash Screen - App Bootstrap
 * Pure React Native CLI component
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';

export interface SplashScreenProps {
  navigation: any;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  useEffect(() => {
    // Check auth status and navigate
    const timer = setTimeout(() => {
      // TODO: Check if user is logged in
      const isLoggedIn = false; // Replace with actual auth check
      
      if (isLoggedIn) {
        navigation.replace('Main');
      } else {
        navigation.replace('Auth', { screen: 'Login' });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🚛</Text>
      <Text style={styles.title}>Rodistaa</Text>
      <ActivityIndicator size="large" color={RodistaaColors.primary.main} style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: RodistaaColors.background.default,
  },
  logo: {
    fontSize: 80,
    marginBottom: RodistaaSpacing.lg,
  },
  title: {
    ...MobileTextStyles.h1,
    color: RodistaaColors.primary.main,
    marginBottom: RodistaaSpacing.xl,
  },
  loader: {
    marginTop: RodistaaSpacing.xl,
  },
});

