/**
 * RBottomTabs - Rodistaa Mobile Bottom Navigation Tabs
 * For main navigation across apps
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { RodistaaColors } from '../../tokens/colors';
import { MobileTextStyles } from '../../tokens/typography';
import { RodistaaSpacing, RNShadowStyles } from '../../tokens/spacing';

export interface RBottomTab {
  key: string;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
}

export interface RBottomTabsProps {
  tabs: RBottomTab[];
  activeTab: string;
  onTabPress: (key: string) => void;
  style?: ViewStyle;
  testID?: string;
}

export const RBottomTabs: React.FC<RBottomTabsProps> = ({
  tabs,
  activeTab,
  onTabPress,
  style,
  testID,
}) => {
  return (
    <View style={[styles.container, style]} testID={testID}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              {isActive ? (tab.activeIcon || tab.icon) : tab.icon}
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 64,
    backgroundColor: RodistaaColors.background.default,
    borderTopWidth: 1,
    borderTopColor: RodistaaColors.border.light,
    ...RNShadowStyles.md,
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: RodistaaSpacing.xs,
    minHeight: RodistaaSpacing.touchTarget.minHeight,
  },

  iconContainer: {
    marginBottom: 4,
  },

  label: {
    ...MobileTextStyles.caption,
    color: RodistaaColors.text.secondary,
  },

  labelActive: {
    color: RodistaaColors.primary.main,
    fontWeight: '600',
  },
});

export default RBottomTabs;

