/**
 * RListCard - List Item Card Component
 * Pure React Native CLI - Uses Rodistaa Design System
 * Displays a list item with title, subtitle, metadata, and actions
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing, RNShadowStyles } from '@rodistaa/design-system/tokens';

export interface RListCardProps {
  title: string;
  subtitle?: string;
  metadata?: string;
  rightContent?: React.ReactNode;
  onPress?: () => void;
  badge?: string | number;
  badgeColor?: string;
  style?: ViewStyle;
  testID?: string;
}

export const RListCard: React.FC<RListCardProps> = ({
  title,
  subtitle,
  metadata,
  rightContent,
  onPress,
  badge,
  badgeColor = RodistaaColors.primary.main,
  style,
  testID = 'r-list-card',
}) => {
  const content = (
    <View style={[styles.card, style]} testID={testID}>
      <View style={styles.leftContent}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1} testID="list-card-title">
            {title}
          </Text>
          {badge !== undefined && (
            <View style={[styles.badge, { backgroundColor: badgeColor }]} testID="list-card-badge">
              <Text style={styles.badgeText}>
                {typeof badge === 'number' && badge > 9 ? '9+' : badge}
              </Text>
            </View>
          )}
        </View>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={2} testID="list-card-subtitle">
            {subtitle}
          </Text>
        )}
        {metadata && (
          <Text style={styles.metadata} testID="list-card-metadata">
            {metadata}
          </Text>
        )}
      </View>
      {rightContent && (
        <View style={styles.rightContent} testID="list-card-right">
          {rightContent}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessible={true}
        accessibilityLabel={`${title}${subtitle ? `, ${subtitle}` : ''}`}
        accessibilityRole="button"
        testID={`${testID}-button`}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RodistaaColors.background.paper,
    borderRadius: RodistaaSpacing.borderRadius.lg,
    padding: RodistaaSpacing.lg,
    marginBottom: RodistaaSpacing.md,
    borderWidth: 1,
    borderColor: RodistaaColors.border.light,
    minHeight: RodistaaSpacing.component.listItemHeight,
    ...RNShadowStyles.sm,
  },
  leftContent: {
    flex: 1,
    marginRight: RodistaaSpacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: RodistaaSpacing.xs,
  },
  title: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
    flex: 1,
  },
  subtitle: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    marginTop: RodistaaSpacing.xs,
  },
  metadata: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.tertiary,
    marginTop: RodistaaSpacing.xs,
  },
  rightContent: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: RodistaaSpacing.sm,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.primary.contrast,
    fontSize: 10,
    fontWeight: '700',
  },
});

