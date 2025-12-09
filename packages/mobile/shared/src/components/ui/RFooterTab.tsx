/**
 * RFooterTab - Footer Tab Bar Component Wrapper
 * Pure React Native CLI - Uses Rodistaa Design System
 * Wraps React Navigation Bottom Tabs with Rodistaa styling
 * Note: This is a configuration helper, actual tabs are managed by React Navigation
 */

import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { RodistaaColors } from '@rodistaa/design-system/tokens';

/**
 * Footer Tab Configuration for each role
 */
export const FooterTabConfigs = {
  shipper: {
    tabs: [
      { name: 'Home', label: 'Home', icon: '🏠', route: 'Home' },
      { name: 'PostLoad', label: 'Post Load', icon: '➕', route: 'PostLoad' },
      { name: 'MyPostings', label: 'My Postings', icon: '📋', route: 'MyPostings' },
      { name: 'Messages', label: 'Messages', icon: '💬', route: 'Messages' },
      { name: 'Profile', label: 'Profile', icon: '👤', route: 'Profile' },
    ],
    fabAction: { label: 'Post Load', icon: '➕' },
  },
  operator: {
    tabs: [
      { name: 'Home', label: 'Home', icon: '🏠', route: 'Home' },
      { name: 'Bids', label: 'Bids', icon: '💰', route: 'Bids' },
      { name: 'Trucks', label: 'Trucks', icon: '🚛', route: 'Trucks' },
      { name: 'Earnings', label: 'Earnings', icon: '💵', route: 'Earnings' },
      { name: 'Profile', label: 'Profile', icon: '👤', route: 'Profile' },
    ],
    fabAction: { label: 'Create Bid', icon: '💰' },
  },
  driver: {
    tabs: [
      { name: 'Home', label: 'Home', icon: '🏠', route: 'Home' },
      { name: 'Trips', label: 'Trips', icon: '🚚', route: 'Trips' },
      { name: 'Live', label: 'Live', icon: '📍', route: 'Live' },
      { name: 'Inspections', label: 'Inspections', icon: '🔍', route: 'Inspections' },
      { name: 'Profile', label: 'Profile', icon: '👤', route: 'Profile' },
    ],
    fabAction: { label: 'Start Trip', icon: '🚚' },
  },
} as const;

/**
 * Default tab bar style options for React Navigation
 */
export const getDefaultTabBarOptions = () => ({
  activeTintColor: RodistaaColors.primary.main,
  inactiveTintColor: RodistaaColors.text.disabled,
  style: {
    backgroundColor: RodistaaColors.background.paper,
    borderTopWidth: 1,
    borderTopColor: RodistaaColors.border.light,
    paddingBottom: Platform.OS === 'ios' ? 20 : 5,
    height: Platform.OS === 'ios' ? 85 : 60,
    ...styles.tabBar,
  },
  labelStyle: {
    fontSize: 12,
    fontFamily: 'Times New Roman',
    fontWeight: '500',
  },
  tabStyle: {
    paddingTop: 4,
  },
});

const styles = StyleSheet.create({
  tabBar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
});

