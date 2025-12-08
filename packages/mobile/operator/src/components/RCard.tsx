import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { RodistaaColors, RodistaaSpacing, RNShadowStyles } from '../theme/colors';

interface RCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const RCard: React.FC<RCardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
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
});

