/**
 * Storybook Story for RProfileCard Component
 */

import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { View, StyleSheet } from 'react-native';
import { RProfileCard } from './RProfileCard';

const meta: Meta<typeof RProfileCard> = {
  title: 'Mobile Components/RProfileCard',
  component: RProfileCard,
};

export default meta;

type Story = StoryFn<typeof RProfileCard>;

export const Default: Story = (args) => (
  <View style={styles.container}>
    <RProfileCard {...args} />
  </View>
);
Default.args = {
  name: 'XYZ Transport',
  id: 'OPR001',
  role: 'Operator',
  mobile: '9876543211',
  franchise: 'Rodistaa Hyderabad',
  trustScore: 85,
};

export const WithEdit: Story = (args) => (
  <View style={styles.container}>
    <RProfileCard {...args} />
  </View>
);
WithEdit.args = {
  name: 'ABC Logistics',
  id: 'SHP001',
  role: 'Shipper',
  mobile: '9876543210',
  showEditButton: true,
  onEditPress: () => console.log('Edit pressed'),
};

export const Driver: Story = (args) => (
  <View style={styles.container}>
    <RProfileCard {...args} />
  </View>
);
Driver.args = {
  name: 'Ramesh Kumar',
  id: 'DRV001',
  role: 'Driver',
  mobile: '9876543212',
  trustScore: 88,
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    width: 400,
  },
});

