/**
 * Profile Screen - View and Edit Profile
 * Pure React Native CLI component - Shared across all apps
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
import { useTranslation } from '../i18n';
import { apiClient } from '../api/client';

export interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('User Name');
  const [email, setEmail] = useState('user@example.com');
  const [phone, setPhone] = useState('9876543210');

  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      'Are you sure you want to logout?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.logout'),
          style: 'destructive',
          onPress: () => {
            apiClient.setAuthToken('');
            navigation.replace('Auth', { screen: 'Login' });
          },
        },
      ]
    );
  };

  const handleSave = () => {
    // TODO: Save profile changes
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </Text>
        </View>
        {!isEditing && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
            accessibilityLabel="Edit profile"
          >
            <Text style={styles.editButtonText}>{t('common.edit')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter name"
              accessibilityLabel="Name input"
            />
          ) : (
            <Text style={styles.value}>{name}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Email</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="Enter email"
              accessibilityLabel="Email input"
            />
          ) : (
            <Text style={styles.value}>{email}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t('auth.phoneNumber')}</Text>
          <Text style={styles.value}>{phone}</Text>
          <Text style={styles.hint}>Phone number cannot be changed</Text>
        </View>

        {isEditing && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setIsEditing(false)}
              accessibilityLabel="Cancel editing"
            >
              <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSave}
              accessibilityLabel="Save profile"
            >
              <Text style={styles.buttonText}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          accessibilityLabel="Logout button"
        >
          <Text style={styles.logoutText}>{t('auth.logout')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RodistaaColors.background.default,
  },
  header: {
    backgroundColor: RodistaaColors.background.paper,
    alignItems: 'center',
    padding: RodistaaSpacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: RodistaaColors.border.light,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: RodistaaColors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: RodistaaSpacing.md,
  },
  avatarText: {
    ...MobileTextStyles.h2,
    color: RodistaaColors.primary.contrast,
  },
  editButton: {
    paddingHorizontal: RodistaaSpacing.lg,
    paddingVertical: RodistaaSpacing.sm,
    borderRadius: RodistaaSpacing.borderRadius.md,
    borderWidth: 1,
    borderColor: RodistaaColors.primary.main,
  },
  editButtonText: {
    ...MobileTextStyles.body,
    color: RodistaaColors.primary.main,
    fontWeight: '600',
  },
  content: {
    padding: RodistaaSpacing.xl,
  },
  section: {
    marginBottom: RodistaaSpacing.lg,
  },
  label: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.xs,
  },
  value: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.primary,
  },
  input: {
    ...MobileTextStyles.body,
    backgroundColor: RodistaaColors.background.paper,
    borderRadius: RodistaaSpacing.borderRadius.md,
    padding: RodistaaSpacing.md,
    borderWidth: 1,
    borderColor: RodistaaColors.border.light,
    color: RodistaaColors.text.primary,
  },
  hint: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.disabled,
    marginTop: RodistaaSpacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: RodistaaSpacing.md,
    marginTop: RodistaaSpacing.lg,
  },
  button: {
    flex: 1,
    backgroundColor: RodistaaColors.primary.main,
    paddingVertical: RodistaaSpacing.md,
    borderRadius: RodistaaSpacing.borderRadius.md,
    alignItems: 'center',
  },
  buttonText: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.primary.contrast,
  },
  cancelButton: {
    backgroundColor: RodistaaColors.background.paper,
    borderWidth: 1,
    borderColor: RodistaaColors.border.light,
  },
  cancelButtonText: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: RodistaaColors.border.light,
    marginVertical: RodistaaSpacing.xl,
  },
  logoutButton: {
    backgroundColor: RodistaaColors.error.light,
    paddingVertical: RodistaaSpacing.md,
    borderRadius: RodistaaSpacing.borderRadius.md,
    alignItems: 'center',
  },
  logoutText: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.error.contrast,
  },
});

