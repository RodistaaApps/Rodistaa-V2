/**
 * Settings Screen - App Settings & Configuration
 * Pure React Native CLI component
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
import { useTranslation } from '../i18n';

export interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { t, language, setLanguage } = useTranslation();
  const [notifications, setNotifications] = useState(true);
  const [locationTracking, setLocationTracking] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const handleLanguageChange = (lang: 'en' | 'te' | 'hi') => {
    setLanguage(lang);
    Alert.alert('Success', `Language changed to ${lang.toUpperCase()}`);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all cached data. Continue?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // TODO: Clear cache
            Alert.alert('Success', 'Cache cleared');
          },
        },
      ]
    );
  };

  const appVersion = '1.0.0'; // TODO: Get from package.json

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDescription}>Receive alerts and updates</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: RodistaaColors.border.light, true: RodistaaColors.primary.main }}
            accessibilityLabel="Toggle push notifications"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Location Tracking</Text>
            <Text style={styles.settingDescription}>Enable background location updates</Text>
          </View>
          <Switch
            value={locationTracking}
            onValueChange={setLocationTracking}
            trackColor={{ false: RodistaaColors.border.light, true: RodistaaColors.primary.main }}
            accessibilityLabel="Toggle location tracking"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Auto Refresh</Text>
            <Text style={styles.settingDescription}>Automatically refresh data</Text>
          </View>
          <Switch
            value={autoRefresh}
            onValueChange={setAutoRefresh}
            trackColor={{ false: RodistaaColors.border.light, true: RodistaaColors.primary.main }}
            accessibilityLabel="Toggle auto refresh"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language</Text>
        <TouchableOpacity
          style={[styles.languageOption, language === 'en' && styles.languageSelected]}
          onPress={() => handleLanguageChange('en')}
          accessibilityLabel="Select English"
        >
          <Text style={styles.languageText}>English</Text>
          {language === 'en' && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.languageOption, language === 'te' && styles.languageSelected]}
          onPress={() => handleLanguageChange('te')}
          accessibilityLabel="Select Telugu"
        >
          <Text style={styles.languageText}>తెలుగు (Telugu)</Text>
          {language === 'te' && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.languageOption, language === 'hi' && styles.languageSelected]}
          onPress={() => handleLanguageChange('hi')}
          accessibilityLabel="Select Hindi"
        >
          <Text style={styles.languageText}>हिंदी (Hindi)</Text>
          {language === 'hi' && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Storage</Text>
        <TouchableOpacity
          style={styles.settingButton}
          onPress={handleClearCache}
          accessibilityLabel="Clear cache"
        >
          <Text style={styles.settingButtonText}>Clear Cache</Text>
          <Text style={styles.settingButtonArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>App Version</Text>
          <Text style={styles.infoValue}>{appVersion}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Build Number</Text>
          <Text style={styles.infoValue}>100</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Rodistaa Trade & Transport</Text>
        <Text style={styles.footerText}>© 2025 All rights reserved</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RodistaaColors.background.default,
  },
  section: {
    backgroundColor: RodistaaColors.background.paper,
    marginTop: RodistaaSpacing.lg,
    paddingVertical: RodistaaSpacing.md,
  },
  sectionTitle: {
    ...MobileTextStyles.bodySmall,
    fontWeight: '600',
    color: RodistaaColors.text.secondary,
    paddingHorizontal: RodistaaSpacing.xl,
    marginBottom: RodistaaSpacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: RodistaaSpacing.xl,
    paddingVertical: RodistaaSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: RodistaaColors.border.light,
  },
  settingContent: {
    flex: 1,
    marginRight: RodistaaSpacing.md,
  },
  settingLabel: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  settingDescription: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: RodistaaSpacing.xl,
    paddingVertical: RodistaaSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: RodistaaColors.border.light,
  },
  languageSelected: {
    backgroundColor: RodistaaColors.primary.light,
  },
  languageText: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.primary,
  },
  checkmark: {
    fontSize: 20,
    color: RodistaaColors.primary.main,
    fontWeight: 'bold',
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: RodistaaSpacing.xl,
    paddingVertical: RodistaaSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: RodistaaColors.border.light,
  },
  settingButtonText: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.primary,
  },
  settingButtonArrow: {
    fontSize: 24,
    color: RodistaaColors.text.secondary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: RodistaaSpacing.xl,
    paddingVertical: RodistaaSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: RodistaaColors.border.light,
  },
  infoLabel: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.secondary,
  },
  infoValue: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.primary,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    padding: RodistaaSpacing.xl,
    marginTop: RodistaaSpacing.xl,
  },
  footerText: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.disabled,
    marginBottom: RodistaaSpacing.xs,
  },
});

