/**
 * RAppBar - Rodistaa Mobile App Bar Component
 * Top navigation bar with back button, title, and actions
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StatusBar,
} from 'react-native';
import { RodistaaColors } from '../../tokens/colors';
import { MobileTextStyles } from '../../tokens/typography';
import { RodistaaSpacing, RNShadowStyles } from '../../tokens/spacing';

export interface RAppBarProps {
  title: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  leftIcon?: React.ReactNode;
  elevated?: boolean;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  testID?: string;
}

export const RAppBar: React.FC<RAppBarProps> = ({
  title,
  onBack,
  actions,
  leftIcon,
  elevated = true,
  style,
  titleStyle,
  testID,
}) => {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={RodistaaColors.background.default} />
      <View style={[styles.container, elevated && styles.elevated, style]} testID={testID}>
        {/* Left Side */}
        <View style={styles.left}>
          {onBack && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
              hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          )}
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, titleStyle]} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>{actions}</View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: RodistaaSpacing.sm,
    backgroundColor: RodistaaColors.background.default,
    borderBottomWidth: 1,
    borderBottomColor: RodistaaColors.border.light,
  },

  elevated: {
    ...RNShadowStyles.sm,
    borderBottomWidth: 0,
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 48,
  },

  backButton: {
    width: RodistaaSpacing.touchTarget.minWidth,
    height: RodistaaSpacing.touchTarget.minHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backIcon: {
    fontSize: 24,
    color: RodistaaColors.text.primary,
  },

  leftIconContainer: {
    marginLeft: RodistaaSpacing.xs,
  },

  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: RodistaaSpacing.md,
  },

  title: {
    ...MobileTextStyles.h3,
    color: RodistaaColors.text.primary,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 48,
    justifyContent: 'flex-end',
  },
});

export default RAppBar;

