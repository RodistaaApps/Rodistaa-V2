/**
 * RForm - Rodistaa Mobile Form Component
 * Wrapper component for forms with validation
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { RodistaaSpacing } from '../../tokens/spacing';

export interface RFormProps {
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export const RForm: React.FC<RFormProps> = ({
  children,
  style,
  testID,
}) => {
  return (
    <View style={[styles.container, style]} testID={testID}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: RodistaaSpacing.layout.formFieldGap,
  },
});

export default RForm;

