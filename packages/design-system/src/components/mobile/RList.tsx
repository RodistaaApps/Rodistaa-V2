/**
 * RList - Rodistaa Mobile List Component
 * Used for displaying lists of items with consistent styling
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, FlatList, FlatListProps } from 'react-native';
import { RodistaaColors } from '../../tokens/colors';
import { RodistaaSpacing, RNShadowStyles } from '../../tokens/spacing';

export interface RListProps<T> extends Omit<FlatListProps<T>, 'style'> {
  style?: ViewStyle;
  itemStyle?: ViewStyle;
  separator?: boolean;
  testID?: string;
}

export function RList<T>({
  style,
  itemStyle,
  separator = true,
  testID,
  ...flatListProps
}: RListProps<T>) {
  const renderSeparator = () => {
    if (!separator) return null;
    return (
      <View
        style={{
          height: 1,
          backgroundColor: RodistaaColors.border.light,
          marginLeft: RodistaaSpacing.lg,
        }}
      />
    );
  };

  return (
    <FlatList
      {...flatListProps}
      style={[styles.container, style]}
      contentContainerStyle={[
        styles.contentContainer,
        flatListProps.contentContainerStyle,
      ]}
      ItemSeparatorComponent={renderSeparator}
      testID={testID}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RodistaaColors.background.default,
  },
  contentContainer: {
    paddingVertical: RodistaaSpacing.sm,
  },
});

export default RList;

