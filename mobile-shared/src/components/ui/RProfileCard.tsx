/**
 * RProfileCard - Profile Information Card Component
 * Pure React Native CLI - Uses Rodistaa Design System
 * Displays profile information with avatar, name, ID, and metadata
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing, RNShadowStyles } from '@rodistaa/design-system/tokens';
import { RAvatar } from './RAvatar';

export interface RProfileCardProps {
  name: string;
  id?: string;
  role?: string;
  mobile?: string;
  franchise?: string;
  trustScore?: number;
  avatarUrl?: string;
  initials?: string;
  showEditButton?: boolean;
  onEditPress?: () => void;
  onAvatarPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export const RProfileCard: React.FC<RProfileCardProps> = ({
  name,
  id,
  role,
  mobile,
  franchise,
  trustScore,
  avatarUrl,
  initials,
  showEditButton = false,
  onEditPress,
  onAvatarPress,
  style,
  testID = 'r-profile-card',
}) => {
  const maskMobile = (phone?: string) => {
    if (!phone) return '';
    if (phone.length === 10) {
      return `+91 ${phone.slice(0, 2)}****${phone.slice(8)}`;
    }
    return phone;
  };

  return (
    <View style={[styles.card, style]} testID={testID}>
      <View style={styles.header}>
        <RAvatar
          size={64}
          imageUrl={avatarUrl}
          initials={initials}
          showOnlineIndicator={true}
          isOnline={true}
          onPress={onAvatarPress}
          testID="profile-avatar"
        />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1} testID="profile-name">
            {name}
          </Text>
          {(id || role) && (
            <Text style={styles.idRole} testID="profile-id-role">
              {[id, role].filter(Boolean).join(' • ')}
            </Text>
          )}
          {mobile && (
            <Text style={styles.mobile} testID="profile-mobile">
              {maskMobile(mobile)}
            </Text>
          )}
        </View>
        {showEditButton && (
          <TouchableOpacity
            onPress={onEditPress}
            style={styles.editButton}
            accessible={true}
            accessibilityLabel="Edit profile"
            accessibilityRole="button"
            testID="profile-edit-button"
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
      {(franchise || trustScore !== undefined) && (
        <View style={styles.metadata}>
          {franchise && (
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Franchise</Text>
              <Text style={styles.metadataValue}>{franchise}</Text>
            </View>
          )}
          {trustScore !== undefined && (
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Trust Score</Text>
              <View style={styles.trustScoreContainer}>
                <Text style={styles.trustScoreValue}>{trustScore}</Text>
                <Text style={styles.trustScoreIcon}>⭐</Text>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: RodistaaColors.background.paper,
    borderRadius: RodistaaSpacing.borderRadius.lg,
    padding: RodistaaSpacing.lg,
    borderWidth: 1,
    borderColor: RodistaaColors.border.light,
    ...RNShadowStyles.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: RodistaaSpacing.md,
  },
  info: {
    flex: 1,
    marginLeft: RodistaaSpacing.md,
  },
  name: {
    ...MobileTextStyles.h3,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  idRole: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.xs,
  },
  mobile: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.tertiary,
  },
  editButton: {
    paddingHorizontal: RodistaaSpacing.md,
    paddingVertical: RodistaaSpacing.sm,
    borderRadius: RodistaaSpacing.borderRadius.md,
    borderWidth: 1,
    borderColor: RodistaaColors.primary.main,
  },
  editButtonText: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.primary.main,
    fontWeight: '600',
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: RodistaaSpacing.md,
    borderTopWidth: 1,
    borderTopColor: RodistaaColors.border.light,
  },
  metadataItem: {
    alignItems: 'center',
  },
  metadataLabel: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.secondary,
    marginBottom: RodistaaSpacing.xs,
  },
  metadataValue: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.primary,
    fontWeight: '600',
  },
  trustScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustScoreValue: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.primary,
    fontWeight: '600',
  },
  trustScoreIcon: {
    fontSize: 14,
  },
});

