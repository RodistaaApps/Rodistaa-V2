/**
 * RListItem - Rodistaa Mobile List Item Component
 * STRICT: Follow Rodistaa guidelines
 * - Minimum 56px height
 * - Touch target ≥ 44px
 */

import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { RodistaaColors } from '../../tokens/colors';
import { MobileTextStyles } from '../../tokens/typography';
import { RodistaaSpacing } from '../../tokens/spacing';

export interface RListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  divider?: boolean;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  testID?: string;
}

export const RListItem: React.FC<RListItemProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onPress,
  disabled = false,
  divider = true,
  style,
  titleStyle,
  subtitleStyle,
  testID,
}) => {
  const content = (
    <>
      {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

      <View style={styles.content}>
        <Text style={[styles.title, titleStyle]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, subtitleStyle]} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>

      {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[
          styles.container,
          divider && styles.divider,
          disabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        testID={testID}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[
        styles.container,
        divider && styles.divider,
        disabled && styles.disabled,
        style,
      ]}
      testID={testID}
    >
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: RodistaaSpacing.component.listItemHeight,
    paddingHorizontal: RodistaaSpacing.md,
    paddingVertical: RodistaaSpacing.sm,
    backgroundColor: RodistaaColors.background.default,
  },

  divider: {
    borderBottomWidth: 1,
    borderBottomColor: RodistaaColors.border.light,
  },

  disabled: {
    opacity: 0.5,
  },

  leftIconContainer: {
    marginRight: RodistaaSpacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.primary,
    marginBottom: 2,
  },

  subtitle: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
  },

  rightIconContainer: {
    marginLeft: RodistaaSpacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RListItem;

