/**
 * Storybook Story for RMetricCard Component
 */

import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { View, StyleSheet } from 'react-native';
import { RMetricCard } from './RMetricCard';

const meta: Meta<typeof RMetricCard> = {
  title: 'Mobile Components/RMetricCard',
  component: RMetricCard,
};

export default meta;

type Story = StoryFn<typeof RMetricCard>;

export const Default: Story = (args) => (
  <View style={styles.container}>
    <RMetricCard {...args} />
  </View>
);
Default.args = {
  icon: '🚛',
  value: 8,
  label: 'Available Trucks',
};

export const WithCurrency: Story = (args) => (
  <View style={styles.container}>
    <RMetricCard {...args} />
  </View>
);
WithCurrency.args = {
  icon: '💵',
  value: '₹145K',
  label: 'Ledger Balance',
};

export const Clickable: Story = (args) => (
  <View style={styles.container}>
    <RMetricCard {...args} />
  </View>
);
Clickable.args = {
  icon: '💰',
  value: 12,
  label: 'Active Bids',
  onPress: () => console.log('Card pressed'),
};

export const AllVariants: Story = () => (
  <View style={styles.grid}>
    <RMetricCard icon="🚛" value={8} label="Trucks" backgroundColor="#DBEAFE" />
    <RMetricCard icon="💰" value={12} label="Bids" backgroundColor="#D1FAE5" />
    <RMetricCard icon="🔍" value={3} label="Inspections" backgroundColor="#FEF3C7" />
    <RMetricCard icon="💵" value="₹145K" label="Balance" backgroundColor="#FED7AA" />
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    width: 200,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    padding: 20,
  },
});

