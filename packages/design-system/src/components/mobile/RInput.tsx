/**
 * RInput - Rodistaa Mobile Input Component
 * STRICT: Follow Rodistaa brand guidelines
 * - Touch targets ≥ 44px
 * - Red border for errors
 * - Inline error messages
 * - Font size ≥ 14px
 */

import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { RodistaaColors } from '../../tokens/colors';
import { MobileTextStyles, RodistaaTypography } from '../../tokens/typography';
import { RodistaaSpacing } from '../../tokens/spacing';

export interface RInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  helper?: string;
  disabled?: boolean;
  required?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  testID?: string;
}

export const RInput: React.FC<RInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  helper,
  disabled = false,
  required = false,
  multiline = false,
  numberOfLines = 1,
  leftIcon,
  rightIcon,
  style,
  inputStyle,
  testID,
  ...restProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const hasError = !!error;

  const containerStyle: ViewStyle = {
    ...styles.container,
    ...(hasError && styles.containerError),
    ...(isFocused && styles.containerFocused),
    ...(disabled && styles.containerDisabled),
  };

  const textInputStyle: TextStyle = {
    ...styles.input,
    ...(multiline && styles.inputMultiline),
    ...(disabled && styles.inputDisabled),
  };

  return (
    <View style={[styles.wrapper, style]} testID={testID}>
      {/* Label */}
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* Input Container */}
      <View style={containerStyle}>
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

        <TextInput
          style={[textInputStyle, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={RodistaaColors.text.tertiary}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...restProps}
        />

        {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
      </View>

      {/* Helper or Error Text */}
      {(error || helper) && (
        <Text style={[styles.helperText, hasError && styles.errorText]}>
          {error || helper}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: RodistaaSpacing.md,
  },

  label: {
    ...MobileTextStyles.label,
    marginBottom: RodistaaSpacing.xs,
    color: RodistaaColors.text.primary,
  },

  required: {
    color: RodistaaColors.error.main,
  },

  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: RodistaaSpacing.component.inputHeight,
    borderWidth: 1,
    borderColor: RodistaaColors.border.default,
    borderRadius: RodistaaSpacing.borderRadius.lg,
    paddingHorizontal: RodistaaSpacing.component.inputPaddingX,
    backgroundColor: RodistaaColors.background.default,
  },

  containerFocused: {
    borderColor: RodistaaColors.primary.main,
    borderWidth: 2,
  },

  containerError: {
    borderColor: RodistaaColors.error.main,
    borderWidth: 2,
  },

  containerDisabled: {
    backgroundColor: RodistaaColors.background.paper,
    borderColor: RodistaaColors.border.light,
  },

  input: {
    flex: 1,
    ...MobileTextStyles.body,
    color: RodistaaColors.text.primary,
    padding: 0,
    margin: 0,
    minHeight: RodistaaSpacing.touchTarget.minHeight,
  },

  inputMultiline: {
    paddingVertical: RodistaaSpacing.sm,
    textAlignVertical: 'top',
  },

  inputDisabled: {
    color: RodistaaColors.text.disabled,
  },

  leftIconContainer: {
    marginRight: RodistaaSpacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },

  rightIconContainer: {
    marginLeft: RodistaaSpacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },

  helperText: {
    ...MobileTextStyles.caption,
    marginTop: RodistaaSpacing.xxs,
    color: RodistaaColors.text.secondary,
  },

  errorText: {
    color: RodistaaColors.error.main,
  },
});

export default RInput;

