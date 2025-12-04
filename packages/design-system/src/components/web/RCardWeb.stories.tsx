/**
 * RCardWeb Stories
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { RCardWeb } from './RCardWeb';
import { WebTextStyles } from '../../tokens';

const meta: Meta<typeof RCardWeb> = {
  title: 'Web/RCardWeb',
  component: RCardWeb,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RCardWeb>;

export const Default: Story = {
  render: () => (
    <RCardWeb>
      <p style={WebTextStyles.body}>Card content goes here</p>
    </RCardWeb>
  ),
};

export const WithTitle: Story = {
  render: () => (
    <RCardWeb title="Card Title">
      <p style={WebTextStyles.body}>Card with title</p>
    </RCardWeb>
  ),
};

export const WithShadow: Story = {
  render: () => (
    <RCardWeb shadow="lg">
      <p style={WebTextStyles.body}>Card with large shadow</p>
    </RCardWeb>
  ),
};

