/**
 * RDivider - Rodistaa Mobile Divider Component
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { RodistaaColors } from '../../tokens/colors';
import { RodistaaSpacing } from '../../tokens/spacing';

export interface RDividerProps {
  vertical?: boolean;
  spacing?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
  testID?: string;
}

export const RDivider: React.FC<RDividerProps> = ({
  vertical = false,
  spacing = 'medium',
  style,
  testID,
}) => {
  const dividerStyle: ViewStyle = {
    ...(vertical ? styles.vertical : styles.horizontal),
    ...getSpacingStyle(spacing, vertical),
  };

  return <View style={[dividerStyle, style]} testID={testID} />;
};

const getSpacingStyle = (spacing: string, vertical: boolean): ViewStyle => {
  const spacingValue = {
    none: 0,
    small: RodistaaSpacing.xs,
    medium: RodistaaSpacing.md,
    large: RodistaaSpacing.lg,
  }[spacing] || RodistaaSpacing.md;

  return vertical
    ? { marginHorizontal: spacingValue }
    : { marginVertical: spacingValue };
};

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    width: '100%',
    backgroundColor: RodistaaColors.border.light,
  },

  vertical: {
    width: 1,
    height: '100%',
    backgroundColor: RodistaaColors.border.light,
  },
});

export default RDivider;

