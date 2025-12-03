/**
 * RSectionHeader - Rodistaa Mobile Section Header Component
 * STRICT: Use Baloo Bhai font for headings
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { RodistaaColors } from '../../tokens/colors';
import { MobileTextStyles } from '../../tokens/typography';
import { RodistaaSpacing } from '../../tokens/spacing';

export interface RSectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  testID?: string;
}

export const RSectionHeader: React.FC<RSectionHeaderProps> = ({
  title,
  subtitle,
  action,
  style,
  titleStyle,
  testID,
}) => {
  return (
    <View style={[styles.container, style]} testID={testID}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, titleStyle]}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {action && <View style={styles.actionContainer}>{action}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: RodistaaSpacing.md,
    paddingVertical: RodistaaSpacing.sm,
    marginBottom: RodistaaSpacing.xs,
  },

  textContainer: {
    flex: 1,
  },

  title: {
    ...MobileTextStyles.h3,
    color: RodistaaColors.text.primary,
  },

  subtitle: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
    marginTop: RodistaaSpacing.xxs,
  },

  actionContainer: {
    marginLeft: RodistaaSpacing.md,
  },
});

export default RSectionHeader;

