/**
 * RButton - Rodistaa Mobile Button Component
 * STRICT: Follow Rodistaa brand guidelines
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { RodistaaColors } from '../../tokens/colors';
import { MobileTextStyles } from '../../tokens/typography';
import { RodistaaSpacing, RNShadowStyles } from '../../tokens/spacing';

export type RButtonVariant = 'primary' | 'secondary' | 'text' | 'danger';
export type RButtonSize = 'small' | 'medium' | 'large';

export interface RButtonProps {
  title: string;
  onPress: () => void;
  variant?: RButtonVariant;
  size?: RButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const RButton: React.FC<RButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
  textStyle,
  testID,
}) => {
  const isDisabled = disabled || loading;

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.base,
      ...styles[`size_${size}`],
      ...(fullWidth && styles.fullWidth),
    };

    if (isDisabled) {
      return { ...baseStyle, ...styles.disabled };
    }

    switch (variant) {
      case 'primary':
        return { ...baseStyle, ...styles.primary };
      case 'secondary':
        return { ...baseStyle, ...styles.secondary };
      case 'text':
        return { ...baseStyle, ...styles.text };
      case 'danger':
        return { ...baseStyle, ...styles.danger };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      ...styles.buttonText,
      ...styles[`text_${size}`],
    };

    if (isDisabled) {
      return { ...baseTextStyle, ...styles.disabledText };
    }

    switch (variant) {
      case 'primary':
        return { ...baseTextStyle, color: RodistaaColors.primary.contrast };
      case 'secondary':
        return { ...baseTextStyle, color: RodistaaColors.primary.main };
      case 'text':
        return { ...baseTextStyle, color: RodistaaColors.primary.main };
      case 'danger':
        return { ...baseTextStyle, color: RodistaaColors.error.contrast };
      default:
        return baseTextStyle;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : RodistaaColors.primary.main}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RodistaaSpacing.borderRadius.lg,
    paddingHorizontal: RodistaaSpacing.component.buttonPaddingX,
    paddingVertical: RodistaaSpacing.component.buttonPaddingY,
    minHeight: RodistaaSpacing.component.buttonHeight,
    ...RNShadowStyles.sm,
  },

  // Variants
  primary: {
    backgroundColor: RodistaaColors.primary.main,
  },

  secondary: {
    backgroundColor: RodistaaColors.secondary.main,
    borderWidth: 2,
    borderColor: RodistaaColors.primary.main,
  },

  text: {
    backgroundColor: 'transparent',
    ...RNShadowStyles.none,
  },

  danger: {
    backgroundColor: RodistaaColors.error.main,
  },

  disabled: {
    backgroundColor: '#E0E0E0',
    borderColor: '#E0E0E0',
    ...RNShadowStyles.none,
  },

  // Sizes
  size_small: {
    minHeight: 36,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  size_medium: {
    minHeight: 48,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },

  size_large: {
    minHeight: 56,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },

  fullWidth: {
    width: '100%',
  },

  // Text styles
  buttonText: {
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

  disabledText: {
    color: '#999999',
  },

  // Content layout
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainer: {
    marginRight: 8,
  },
});

export default RButton;

