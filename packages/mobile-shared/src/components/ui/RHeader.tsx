/**
 * RHeader - Shared Header Component
 * Pure React Native CLI - Uses Rodistaa Design System
 * Supports title, subtitle, profile avatar, menu, and notifications
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing, RNShadowStyles } from '@rodistaa/design-system/tokens';

export interface RHeaderProps {
  title?: string;
  subtitle?: string;
  showProfileAvatar?: boolean;
  showMenu?: boolean;
  onProfilePress?: () => void;
  onMenuPress?: () => void;
  notificationCount?: number;
  avatarUrl?: string;
  style?: ViewStyle;
  testID?: string;
}

export const RHeader: React.FC<RHeaderProps> = ({
  title,
  subtitle,
  showProfileAvatar = true,
  showMenu = false,
  onProfilePress,
  onMenuPress,
  notificationCount = 0,
  avatarUrl,
  style,
  testID = 'r-header',
}) => {
  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Left: Menu Icon */}
      <View style={styles.leftSection}>
        {showMenu && (
          <TouchableOpacity
            onPress={onMenuPress}
            style={styles.iconButton}
            accessible={true}
            accessibilityLabel="Menu"
            accessibilityRole="button"
            testID="header-menu-button"
          >
            <Text style={styles.icon}>☰</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Center: Title/Logo */}
      <View style={styles.centerSection}>
        {title ? (
          <>
            <Text style={styles.title} testID="header-title">
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.subtitle} testID="header-subtitle">
                {subtitle}
              </Text>
            )}
          </>
        ) : (
          <Text style={styles.logo} testID="header-logo">
            Rodistaa
          </Text>
        )}
      </View>

      {/* Right: Notifications + Profile Avatar */}
      <View style={styles.rightSection}>
        {notificationCount > 0 && (
          <TouchableOpacity
            style={styles.notificationButton}
            accessible={true}
            accessibilityLabel={`${notificationCount} notifications`}
            accessibilityRole="button"
            testID="header-notification-button"
          >
            <Text style={styles.notificationIcon}>🔔</Text>
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        {showProfileAvatar && (
          <TouchableOpacity
            onPress={onProfilePress}
            style={styles.avatarContainer}
            accessible={true}
            accessibilityLabel="Profile"
            accessibilityRole="button"
            testID="header-profile-button"
          >
            <View style={styles.avatar}>
              {avatarUrl ? (
                <Text style={styles.avatarText}>IMG</Text>
              ) : (
                <Text style={styles.avatarText}>👤</Text>
              )}
            </View>
            <View style={styles.onlineIndicator} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: RodistaaSpacing.lg,
    paddingVertical: RodistaaSpacing.md,
    backgroundColor: RodistaaColors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: RodistaaColors.border.light,
    minHeight: 56, // Minimum touch target
    ...RNShadowStyles.sm,
  },
  leftSection: {
    width: 48,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: RodistaaSpacing.sm,
    width: 120,
    justifyContent: 'flex-end',
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RodistaaSpacing.borderRadius.md,
  },
  icon: {
    fontSize: 24,
    color: RodistaaColors.text.primary,
  },
  logo: {
    ...MobileTextStyles.h2,
    color: RodistaaColors.primary.main,
    fontFamily: 'Baloo Bhai',
  },
  title: {
    ...MobileTextStyles.h3,
    color: RodistaaColors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    marginTop: RodistaaSpacing.xs,
    textAlign: 'center',
  },
  notificationButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationIcon: {
    fontSize: 22,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: RodistaaColors.error.main,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.primary.contrast,
    fontSize: 10,
    fontWeight: '700',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: RodistaaColors.background.default,
    borderWidth: 2,
    borderColor: RodistaaColors.border.default,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarText: {
    fontSize: 20,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: RodistaaColors.success.main,
    borderWidth: 2,
    borderColor: RodistaaColors.background.paper,
  },
});


