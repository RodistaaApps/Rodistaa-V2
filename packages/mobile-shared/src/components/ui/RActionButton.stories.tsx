/**
 * Storybook Story for RActionButton Component
 */

import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { View, StyleSheet } from 'react-native';
import { RActionButton } from './RActionButton';

const meta: Meta<typeof RActionButton> = {
  title: 'Mobile Components/RActionButton',
  component: RActionButton,
};

export default meta;

type Story = StoryFn<typeof RActionButton>;

export const Primary: Story = (args) => (
  <View style={styles.container}>
    <RActionButton {...args} />
  </View>
);
Primary.args = {
  label: 'Post Load',
  icon: '➕',
  variant: 'primary',
  onPress: () => console.log('Pressed'),
};

export const Secondary: Story = (args) => (
  <View style={styles.container}>
    <RActionButton {...args} />
  </View>
);
Secondary.args = {
  label: 'View Details',
  variant: 'secondary',
  onPress: () => console.log('Pressed'),
};

export const Outline: Story = (args) => (
  <View style={styles.container}>
    <RActionButton {...args} />
  </View>
);
Outline.args = {
  label: 'Cancel',
  variant: 'outline',
  onPress: () => console.log('Pressed'),
};

export const Sizes: Story = () => (
  <View style={styles.container}>
    <RActionButton label="Small" size="small" variant="primary" onPress={() => {}} style={styles.button} />
    <RActionButton label="Medium" size="medium" variant="primary" onPress={() => {}} style={styles.button} />
    <RActionButton label="Large" size="large" variant="primary" onPress={() => {}} style={styles.button} />
  </View>
);

export const States: Story = () => (
  <View style={styles.container}>
    <RActionButton label="Normal" variant="primary" onPress={() => {}} style={styles.button} />
    <RActionButton label="Loading" variant="primary" loading onPress={() => {}} style={styles.button} />
    <RActionButton label="Disabled" variant="primary" disabled onPress={() => {}} style={styles.button} />
  </View>
);

export const FullWidth: Story = (args) => (
  <View style={styles.container}>
    <RActionButton {...args} />
  </View>
);
FullWidth.args = {
  label: 'Submit',
  variant: 'primary',
  fullWidth: true,
  onPress: () => console.log('Pressed'),
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    width: 300,
  },
  button: {
    marginBottom: 12,
  },
});

