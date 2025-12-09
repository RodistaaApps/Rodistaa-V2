/**
 * Onboarding Screen - Permissions & Setup
 * Pure React Native CLI component
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
import { useTranslation } from '../i18n';

export interface OnboardingScreenProps {
  navigation: any;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [permissions, setPermissions] = useState({
    location: false,
    camera: false,
    notifications: false,
  });

  const requestLocationPermission = async () => {
    // TODO: Use react-native-permissions or expo-location for actual permission request
    Alert.alert(
      'Location Permission',
      'Rodistaa needs location access for tracking shipments and deliveries.',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Enable',
          onPress: () => {
            setPermissions({ ...permissions, location: true });
            // In production: call actual permission API
          },
        },
      ]
    );
  };

  const requestCameraPermission = async () => {
    Alert.alert(
      'Camera Permission',
      'Rodistaa needs camera access for capturing POD, inspection photos, and documents.',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Enable',
          onPress: () => {
            setPermissions({ ...permissions, camera: true });
          },
        },
      ]
    );
  };

  const requestNotificationPermission = async () => {
    Alert.alert(
      'Notifications',
      'Enable notifications to receive alerts about bids, shipments, and important updates.',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Enable',
          onPress: () => {
            setPermissions({ ...permissions, notifications: true });
          },
        },
      ]
    );
  };

  const handleContinue = () => {
    navigation.replace('Main');
  };

  const allGranted = permissions.location && permissions.camera && permissions.notifications;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Rodistaa! 🚛</Text>
        <Text style={styles.subtitle}>
          To get started, we need a few permissions
        </Text>
      </View>

      <View style={styles.permissionsList}>
        <TouchableOpacity
          style={[styles.permissionCard, permissions.location && styles.permissionGranted]}
          onPress={requestLocationPermission}
          accessibilityLabel="Location permission"
        >
          <Text style={styles.permissionIcon}>📍</Text>
          <View style={styles.permissionContent}>
            <Text style={styles.permissionTitle}>Location Access</Text>
            <Text style={styles.permissionDescription}>
              Track shipments and enable live location sharing
            </Text>
          </View>
          <Text style={styles.checkmark}>{permissions.location ? '✓' : ''}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.permissionCard, permissions.camera && styles.permissionGranted]}
          onPress={requestCameraPermission}
          accessibilityLabel="Camera permission"
        >
          <Text style={styles.permissionIcon}>📷</Text>
          <View style={styles.permissionContent}>
            <Text style={styles.permissionTitle}>Camera Access</Text>
            <Text style={styles.permissionDescription}>
              Capture POD, inspection photos, and documents
            </Text>
          </View>
          <Text style={styles.checkmark}>{permissions.camera ? '✓' : ''}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.permissionCard, permissions.notifications && styles.permissionGranted]}
          onPress={requestNotificationPermission}
          accessibilityLabel="Notifications permission"
        >
          <Text style={styles.permissionIcon}>🔔</Text>
          <View style={styles.permissionContent}>
            <Text style={styles.permissionTitle}>Notifications</Text>
            <Text style={styles.permissionDescription}>
              Get alerts about bids, shipments, and updates
            </Text>
          </View>
          <Text style={styles.checkmark}>{permissions.notifications ? '✓' : ''}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.continueButton, !allGranted && styles.continueButtonDisabled]}
        onPress={handleContinue}
        disabled={!allGranted}
        accessibilityLabel="Continue to app"
      >
        <Text style={[styles.continueButtonText, !allGranted && styles.continueButtonTextDisabled]}>
          {t('common.continue', { continue: 'Continue' })}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleContinue}
        accessibilityLabel="Skip permissions"
      >
        <Text style={styles.skipButtonText}>Skip for now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RodistaaColors.background.default,
  },
  content: {
    padding: RodistaaSpacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: RodistaaSpacing.xxxl,
    marginTop: RodistaaSpacing.xxxl,
  },
  title: {
    ...MobileTextStyles.h1,
    color: RodistaaColors.primary.main,
    marginBottom: RodistaaSpacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.secondary,
    textAlign: 'center',
  },
  permissionsList: {
    marginBottom: RodistaaSpacing.xl,
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RodistaaColors.background.paper,
    borderRadius: RodistaaSpacing.borderRadius.lg,
    padding: RodistaaSpacing.lg,
    marginBottom: RodistaaSpacing.md,
    borderWidth: 2,
    borderColor: RodistaaColors.border.light,
  },
  permissionGranted: {
    borderColor: RodistaaColors.success.main,
    backgroundColor: RodistaaColors.success.light,
  },
  permissionIcon: {
    fontSize: 32,
    marginRight: RodistaaSpacing.md,
  },
  permissionContent: {
    flex: 1,
  },
  permissionTitle: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  permissionDescription: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
  },
  checkmark: {
    fontSize: 24,
    color: RodistaaColors.success.main,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: RodistaaColors.primary.main,
    borderRadius: RodistaaSpacing.borderRadius.md,
    paddingVertical: RodistaaSpacing.lg,
    alignItems: 'center',
    marginBottom: RodistaaSpacing.md,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.primary.contrast,
  },
  continueButtonTextDisabled: {
    color: RodistaaColors.text.disabled,
  },
  skipButton: {
    alignItems: 'center',
    padding: RodistaaSpacing.md,
  },
  skipButtonText: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
  },
});

