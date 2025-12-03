/**
 * RBadge - Rodistaa Mobile Badge Component
 * For status indicators
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { RodistaaColors } from '../../tokens/colors';
import { MobileTextStyles } from '../../tokens/typography';
import { RodistaaSpacing } from '../../tokens/spacing';

export type RBadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info';

export interface RBadgeProps {
  label: string;
  variant?: RBadgeVariant;
  small?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const RBadge: React.FC<RBadgeProps> = ({
  label,
  variant = 'primary',
  small = false,
  style,
  textStyle,
  testID,
}) => {
  const badgeStyle: ViewStyle = {
    ...styles.base,
    ...(small && styles.small),
    ...getVariantStyle(variant),
  };

  const badgeTextStyle: TextStyle = {
    ...styles.text,
    ...(small && styles.textSmall),
    ...getVariantTextStyle(variant),
  };

  return (
    <View style={[badgeStyle, style]} testID={testID}>
      <Text style={[badgeTextStyle, textStyle]}>{label}</Text>
    </View>
  );
};

const getVariantStyle = (variant: RBadgeVariant): ViewStyle => {
  switch (variant) {
    case 'primary':
      return { backgroundColor: RodistaaColors.primary.light };
    case 'success':
      return { backgroundColor: RodistaaColors.success.light };
    case 'warning':
      return { backgroundColor: RodistaaColors.warning.light };
    case 'error':
      return { backgroundColor: RodistaaColors.error.light };
    case 'info':
      return { backgroundColor: RodistaaColors.info.light };
    default:
      return {};
  }
};

const getVariantTextStyle = (variant: RBadgeVariant): TextStyle => {
  switch (variant) {
    case 'primary':
      return { color: RodistaaColors.primary.dark };
    case 'success':
      return { color: RodistaaColors.success.dark };
    case 'warning':
      return { color: RodistaaColors.warning.dark };
    case 'error':
      return { color: RodistaaColors.error.dark };
    case 'info':
      return { color: RodistaaColors.info.dark };
    default:
      return {};
  }
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: RodistaaSpacing.sm,
    paddingVertical: RodistaaSpacing.xxs,
    borderRadius: RodistaaSpacing.borderRadius.md,
    alignSelf: 'flex-start',
  },

  small: {
    paddingHorizontal: RodistaaSpacing.xs,
    paddingVertical: 2,
  },

  text: {
    ...MobileTextStyles.caption,
    fontWeight: '600',
  },

  textSmall: {
    fontSize: 10,
  },
});

export default RBadge;

