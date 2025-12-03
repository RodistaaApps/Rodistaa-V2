/**
 * RToast - Rodistaa Mobile Toast Notification Component
 * For temporary messages and feedback
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import { RodistaaColors } from '../../tokens/colors';
import { MobileTextStyles } from '../../tokens/typography';
import { RodistaaSpacing, RNShadowStyles } from '../../tokens/spacing';

export type RToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface RToastProps {
  message: string;
  variant?: RToastVariant;
  visible: boolean;
  duration?: number;
  onDismiss?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export const RToast: React.FC<RToastProps> = ({
  message,
  variant = 'info',
  visible,
  duration = 3000,
  onDismiss,
  style,
  testID,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }).start();

      // Auto dismiss
      if (duration > 0) {
        const timer = setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 120,
            useNativeDriver: true,
          }).start(() => {
            onDismiss?.();
          });
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, duration, fadeAnim, onDismiss]);

  if (!visible) {
    return null;
  }

  const toastStyle: ViewStyle = {
    ...styles.container,
    ...getVariantStyle(variant),
  };

  return (
    <Animated.View
      style={[
        styles.wrapper,
        toastStyle,
        { opacity: fadeAnim },
        style,
      ]}
      testID={testID}
    >
      <Text style={[styles.message, getVariantTextStyle(variant)]}>
        {message}
      </Text>
    </Animated.View>
  );
};

const getVariantStyle = (variant: RToastVariant): ViewStyle => {
  switch (variant) {
    case 'success':
      return { backgroundColor: RodistaaColors.success.main };
    case 'error':
      return { backgroundColor: RodistaaColors.error.main };
    case 'warning':
      return { backgroundColor: RodistaaColors.warning.main };
    case 'info':
      return { backgroundColor: RodistaaColors.info.main };
    default:
      return {};
  }
};

const getVariantTextStyle = (variant: RToastVariant): any => {
  const textColor = variant === 'warning' 
    ? RodistaaColors.text.primary 
    : RodistaaColors.text.inverse;
  
  return { color: textColor };
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 100,
    left: RodistaaSpacing.md,
    right: RodistaaSpacing.md,
    zIndex: 9999,
  },

  container: {
    padding: RodistaaSpacing.md,
    borderRadius: RodistaaSpacing.borderRadius.lg,
    ...RNShadowStyles.lg,
  },

  message: {
    ...MobileTextStyles.body,
    textAlign: 'center',
  },
});

export default RToast;

