/**
 * RMetricCard - Metric Display Card Component
 * Pure React Native CLI - Uses Rodistaa Design System
 * Displays a single metric with icon, value, and label
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing, RNShadowStyles } from '@rodistaa/design-system/tokens';

export interface RMetricCardProps {
  icon?: string;
  value: string | number;
  label: string;
  onPress?: () => void;
  backgroundColor?: string;
  style?: ViewStyle;
  testID?: string;
}

export const RMetricCard: React.FC<RMetricCardProps> = ({
  icon,
  value,
  label,
  onPress,
  backgroundColor = RodistaaColors.background.paper,
  style,
  testID = 'r-metric-card',
}) => {
  const content = (
    <View style={[styles.card, { backgroundColor }, style]} testID={testID}>
      {icon && <Text style={styles.icon} testID="metric-icon">{icon}</Text>}
      <Text style={styles.value} testID="metric-value">
        {value}
      </Text>
      <Text style={styles.label} testID="metric-label" numberOfLines={2}>
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessible={true}
        accessibilityLabel={`${label}: ${value}`}
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
    borderRadius: RodistaaSpacing.borderRadius.lg,
    padding: RodistaaSpacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    borderWidth: 1,
    borderColor: RodistaaColors.border.light,
    ...RNShadowStyles.sm,
  },
  icon: {
    fontSize: 32,
    marginBottom: RodistaaSpacing.sm,
  },
  value: {
    ...MobileTextStyles.h2,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
    textAlign: 'center',
  },
  label: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.secondary,
    textAlign: 'center',
  },
});


