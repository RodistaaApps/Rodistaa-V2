/**
 * RTag - Rodistaa Mobile Tag Component
 * Used for status indicators, categories, and labels
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { RodistaaColors } from '../../tokens/colors';
import { MobileTextStyles } from '../../tokens/typography';
import { RodistaaSpacing } from '../../tokens/spacing';

export type RTagVariant = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type RTagSize = 'small' | 'medium' | 'large';

export interface RTagProps {
  label: string;
  variant?: RTagVariant;
  size?: RTagSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const RTag: React.FC<RTagProps> = ({
  label,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  testID,
}) => {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: RodistaaColors.primary.light,
          borderColor: RodistaaColors.primary.main,
        };
      case 'success':
        return {
          backgroundColor: RodistaaColors.success.light,
          borderColor: RodistaaColors.success.main,
        };
      case 'warning':
        return {
          backgroundColor: RodistaaColors.warning.light,
          borderColor: RodistaaColors.warning.main,
        };
      case 'error':
        return {
          backgroundColor: RodistaaColors.error.light,
          borderColor: RodistaaColors.error.main,
        };
      case 'info':
        return {
          backgroundColor: RodistaaColors.info.light,
          borderColor: RodistaaColors.info.main,
        };
      case 'neutral':
        return {
          backgroundColor: RodistaaColors.background.paper,
          borderColor: RodistaaColors.text.secondary,
        };
      default:
        return {
          backgroundColor: RodistaaColors.primary.light,
          borderColor: RodistaaColors.primary.main,
        };
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
        return RodistaaColors.primary.main;
      case 'success':
        return RodistaaColors.success.main;
      case 'warning':
        return RodistaaColors.warning.main;
      case 'error':
        return RodistaaColors.error.main;
      case 'info':
        return RodistaaColors.info.main;
      case 'neutral':
        return RodistaaColors.text.secondary;
      default:
        return RodistaaColors.primary.main;
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: RodistaaSpacing.sm,
          paddingVertical: RodistaaSpacing.xs / 2,
          borderRadius: RodistaaSpacing.borderRadius.sm,
        };
      case 'medium':
        return {
          paddingHorizontal: RodistaaSpacing.md,
          paddingVertical: RodistaaSpacing.xs,
          borderRadius: RodistaaSpacing.borderRadius.md,
        };
      case 'large':
        return {
          paddingHorizontal: RodistaaSpacing.lg,
          paddingVertical: RodistaaSpacing.sm,
          borderRadius: RodistaaSpacing.borderRadius.lg,
        };
      default:
        return {
          paddingHorizontal: RodistaaSpacing.md,
          paddingVertical: RodistaaSpacing.xs,
          borderRadius: RodistaaSpacing.borderRadius.md,
        };
    }
  };

  const getTextSizeStyle = (): TextStyle => {
    switch (size) {
      case 'small':
        return { fontSize: 12 };
      case 'medium':
        return { fontSize: 14 };
      case 'large':
        return { fontSize: 16 };
      default:
        return { fontSize: 14 };
    }
  };

  return (
    <View
      style={[
        styles.base,
        getVariantStyle(),
        getSizeStyle(),
        style,
      ]}
      testID={testID}
    >
      <Text
        style={[
          styles.text,
          MobileTextStyles.caption,
          getTextSizeStyle(),
          { color: getTextColor() },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
});

export default RTag;

