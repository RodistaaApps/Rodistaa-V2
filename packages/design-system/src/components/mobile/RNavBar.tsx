/**
 * RNavBar - Rodistaa Mobile Navigation Bar Component
 * Top navigation bar with title and actions
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { RodistaaColors } from '../../tokens/colors';
import { MobileTextStyles } from '../../tokens/typography';
import { RodistaaSpacing, RNShadowStyles } from '../../tokens/spacing';

export interface RNavBarProps {
  title: string;
  leftAction?: {
    icon?: React.ReactNode;
    label?: string;
    onPress: () => void;
  };
  rightAction?: {
    icon?: React.ReactNode;
    label?: string;
    onPress: () => void;
  };
  style?: ViewStyle;
  testID?: string;
}

export const RNavBar: React.FC<RNavBarProps> = ({
  title,
  leftAction,
  rightAction,
  style,
  testID,
}) => {
  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Left Action */}
      <View style={styles.leftSection}>
        {leftAction && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={leftAction.onPress}
            activeOpacity={0.7}
          >
            {leftAction.icon && <View style={styles.iconContainer}>{leftAction.icon}</View>}
            {leftAction.label && (
              <Text style={styles.actionLabel}>{leftAction.label}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Title */}
      <View style={styles.centerSection}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Right Action */}
      <View style={styles.rightSection}>
        {rightAction && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={rightAction.onPress}
            activeOpacity={0.7}
          >
            {rightAction.label && (
              <Text style={styles.actionLabel}>{rightAction.label}</Text>
            )}
            {rightAction.icon && <View style={styles.iconContainer}>{rightAction.icon}</View>}
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
    height: 56,
    paddingHorizontal: RodistaaSpacing.lg,
    backgroundColor: RodistaaColors.background.default,
    borderBottomWidth: 1,
    borderBottomColor: RodistaaColors.border.light,
    ...RNShadowStyles.sm,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    ...MobileTextStyles.h3,
    color: RodistaaColors.text.primary,
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: RodistaaSpacing.xs,
    paddingHorizontal: RodistaaSpacing.sm,
  },
  actionLabel: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.primary.main,
    fontWeight: '600',
  },
  iconContainer: {
    marginHorizontal: RodistaaSpacing.xs,
  },
});

export default RNavBar;

