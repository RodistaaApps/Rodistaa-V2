/**
 * RActionButton - Action Button Component
 * Pure React Native CLI - Uses Rodistaa Design System
 * Primary action button with icon and text
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing, RNShadowStyles } from '@rodistaa/design-system/tokens';

export interface RActionButtonProps {
  label: string;
  icon?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const RActionButton: React.FC<RActionButtonProps> = ({
  label,
  icon,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  testID = 'r-action-button',
}) => {
  const getButtonStyle = () => {
    const baseStyle = [
      styles.button,
      styles[`button_${size}`],
      fullWidth && styles.fullWidth,
    ];

    switch (variant) {
      case 'primary':
        baseStyle.push(styles.buttonPrimary);
        break;
      case 'secondary':
        baseStyle.push(styles.buttonSecondary);
        break;
      case 'outline':
        baseStyle.push(styles.buttonOutline);
        break;
    }

    if (disabled || loading) {
      baseStyle.push(styles.buttonDisabled);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`text_${size}`]];

    switch (variant) {
      case 'primary':
        baseStyle.push(styles.textPrimary);
        break;
      case 'secondary':
        baseStyle.push(styles.textSecondary);
        break;
      case 'outline':
        baseStyle.push(styles.textOutline);
        break;
    }

    if (disabled || loading) {
      baseStyle.push(styles.textDisabled);
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[...getButtonStyle(), style]}
      activeOpacity={0.8}
      accessible={true}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? RodistaaColors.primary.contrast : RodistaaColors.primary.main}
          size="small"
          testID="button-loading"
        />
      ) : (
        <>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={getTextStyle()} testID="button-label">
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RodistaaSpacing.borderRadius.lg,
    paddingHorizontal: RodistaaSpacing.xl,
    minHeight: RodistaaSpacing.component.buttonHeight,
    ...RNShadowStyles.sm,
  },
  button_small: {
    minHeight: 36,
    paddingHorizontal: RodistaaSpacing.md,
  },
  button_medium: {
    minHeight: RodistaaSpacing.component.buttonHeight,
    paddingHorizontal: RodistaaSpacing.xl,
  },
  button_large: {
    minHeight: 56,
    paddingHorizontal: RodistaaSpacing.xxl,
  },
  buttonPrimary: {
    backgroundColor: RodistaaColors.primary.main,
  },
  buttonSecondary: {
    backgroundColor: RodistaaColors.secondary.main,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: RodistaaColors.primary.main,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    ...MobileTextStyles.button,
    textAlign: 'center',
  },
  text_small: {
    fontSize: 14,
  },
  text_medium: {
    fontSize: 16,
  },
  text_large: {
    fontSize: 18,
  },
  textPrimary: {
    color: RodistaaColors.primary.contrast,
  },
  textSecondary: {
    color: RodistaaColors.secondary.contrast,
  },
  textOutline: {
    color: RodistaaColors.primary.main,
  },
  textDisabled: {
    opacity: 0.6,
  },
  icon: {
    marginRight: RodistaaSpacing.sm,
    fontSize: 18,
  },
});

