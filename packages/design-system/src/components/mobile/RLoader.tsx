/**
 * RLoader - Rodistaa Mobile Loader Component
 * STRICT: Skeleton for <500ms, Spinner for >500ms
 */

import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  Text,
} from 'react-native';
import { RodistaaColors } from '../../tokens/colors';
import { MobileTextStyles } from '../../tokens/typography';
import { RodistaaSpacing } from '../../tokens/spacing';

export type RLoaderType = 'spinner' | 'skeleton';
export type RLoaderSize = 'small' | 'medium' | 'large';

export interface RLoaderProps {
  type?: RLoaderType;
  size?: RLoaderSize;
  message?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const RLoader: React.FC<RLoaderProps> = ({
  type = 'spinner',
  size = 'medium',
  message,
  fullScreen = false,
  style,
  testID,
}) => {
  const containerStyle: ViewStyle = fullScreen
    ? styles.fullScreenContainer
    : styles.container;

  if (type === 'skeleton') {
    return (
      <View style={[containerStyle, style]} testID={testID}>
        <View style={styles.skeleton} />
      </View>
    );
  }

  return (
    <View style={[containerStyle, style]} testID={testID}>
      <ActivityIndicator
        size={size === 'small' ? 'small' : 'large'}
        color={RodistaaColors.primary.main}
      />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: RodistaaSpacing.lg,
  },

  fullScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RodistaaColors.background.default,
  },

  message: {
    ...MobileTextStyles.body,
    color: RodistaaColors.text.secondary,
    marginTop: RodistaaSpacing.md,
    textAlign: 'center',
  },

  skeleton: {
    width: '100%',
    height: 100,
    backgroundColor: RodistaaColors.background.paper,
    borderRadius: RodistaaSpacing.borderRadius.lg,
  },
});

export default RLoader;

