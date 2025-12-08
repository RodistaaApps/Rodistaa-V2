/**
 * Storybook Story for RListCard Component
 */

import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { View, StyleSheet } from 'react-native';
import { RListCard } from './RListCard';

const meta: Meta<typeof RListCard> = {
  title: 'Mobile Components/RListCard',
  component: RListCard,
};

export default meta;

type Story = StoryFn<typeof RListCard>;

export const Default: Story = (args) => (
  <View style={styles.container}>
    <RListCard {...args} />
  </View>
);
Default.args = {
  title: 'BK001',
  subtitle: 'Mumbai → Delhi',
  metadata: 'Posted 2 hours ago • Lowest: ₹25K',
};

export const WithBadge: Story = (args) => (
  <View style={styles.container}>
    <RListCard {...args} />
  </View>
);
WithBadge.args = {
  title: 'TR003',
  subtitle: 'Inspection due in 3 days',
  badge: 'URGENT',
  badgeColor: '#E03131',
};

export const Clickable: Story = (args) => (
  <View style={styles.container}>
    <RListCard {...args} />
  </View>
);
Clickable.args = {
  title: 'LD001',
  subtitle: 'Hyderabad → Mumbai • 750 km',
  metadata: 'Posted 30m ago • Expected: ₹35K',
  onPress: () => console.log('Card pressed'),
};

export const List: Story = () => (
  <View style={styles.container}>
    <RListCard
      title="BK001"
      subtitle="Mumbai → Delhi"
      metadata="Posted 2 hours ago"
      badge="12h"
      badgeColor="#FDBA21"
    />
    <RListCard
      title="BK002"
      subtitle="Bangalore → Hyderabad"
      metadata="Posted 5 hours ago"
      badge="20h"
      badgeColor="#FDBA21"
    />
    <RListCard
      title="BK003"
      subtitle="Pune → Chennai"
      metadata="Posted 1 day ago"
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    width: 400,
  },
});

