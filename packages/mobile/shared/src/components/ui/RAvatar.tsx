/**
 * RAvatar - Avatar Component
 * Pure React Native CLI - Uses Rodistaa Design System
 * Displays user avatar with online status indicator
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system/tokens';

export interface RAvatarProps {
  size?: number;
  imageUrl?: string;
  initials?: string;
  showOnlineIndicator?: boolean;
  isOnline?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export const RAvatar: React.FC<RAvatarProps> = ({
  size = 40,
  imageUrl,
  initials,
  showOnlineIndicator = false,
  isOnline = true,
  onPress,
  style,
  testID = 'r-avatar',
}) => {
  const avatarContent = (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
      testID={testID}
    >
      {imageUrl ? (
        <Text style={styles.imagePlaceholder}>IMG</Text>
      ) : initials ? (
        <Text
          style={[
            styles.initials,
            { fontSize: size * 0.4 },
          ]}
          testID="avatar-initials"
        >
          {initials}
        </Text>
      ) : (
        <Text style={[styles.emoji, { fontSize: size * 0.6 }]}>👤</Text>
      )}
      {showOnlineIndicator && (
        <View
          style={[
            styles.indicator,
            {
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: (size * 0.3) / 2,
              borderWidth: 2,
              borderColor: RodistaaColors.background.paper,
              backgroundColor: isOnline
                ? RodistaaColors.success.main
                : RodistaaColors.text.disabled,
            },
          ]}
          testID="online-indicator"
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        accessible={true}
        accessibilityLabel="User avatar"
        accessibilityRole="button"
        testID={`${testID}-button`}
      >
        {avatarContent}
      </TouchableOpacity>
    );
  }

  return avatarContent;
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: RodistaaColors.background.default,
    borderWidth: 2,
    borderColor: RodistaaColors.border.default,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  imagePlaceholder: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.secondary,
  },
  initials: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
  },
  emoji: {
    textAlign: 'center',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
});


