/**
 * RCard Stories
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { RCard } from './RCard';
import { Text } from 'react-native';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '../../tokens';

const meta: Meta<typeof RCard> = {
  title: 'Mobile/RCard',
  component: RCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RCard>;

export const Default: Story = {
  render: () => (
    <RCard>
      <Text style={MobileTextStyles.body}>Card content goes here</Text>
    </RCard>
  ),
};

export const WithPadding: Story = {
  render: () => (
    <RCard padding={RodistaaSpacing.lg}>
      <Text style={MobileTextStyles.h4}>Card Title</Text>
      <Text style={MobileTextStyles.body}>Card content with padding</Text>
    </RCard>
  ),
};

export const WithShadow: Story = {
  render: () => (
    <RCard shadow="md">
      <Text style={MobileTextStyles.body}>Card with medium shadow</Text>
    </RCard>
  ),
};

