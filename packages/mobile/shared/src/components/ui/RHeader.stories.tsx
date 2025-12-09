/**
 * Storybook Story for RHeader Component
 */

import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { RHeader } from './RHeader';

const meta: Meta<typeof RHeader> = {
  title: 'Mobile Components/RHeader',
  component: RHeader,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryFn<typeof RHeader>;

export const Default: Story = (args) => <RHeader {...args} />;
Default.args = {
  title: 'Dashboard',
  subtitle: 'Hyderabad • 260 km',
  showProfileAvatar: true,
  showMenu: true,
  notificationCount: 3,
};

export const WithLogo: Story = (args) => <RHeader {...args} />;
WithLogo.args = {
  showProfileAvatar: true,
  showMenu: false,
  notificationCount: 0,
};

export const WithNotifications: Story = (args) => <RHeader {...args} />;
WithNotifications.args = {
  title: 'Notifications',
  notificationCount: 9,
  showProfileAvatar: true,
};

export const Minimal: Story = (args) => <RHeader {...args} />;
Minimal.args = {
  title: 'Settings',
  showProfileAvatar: false,
  showMenu: false,
};

