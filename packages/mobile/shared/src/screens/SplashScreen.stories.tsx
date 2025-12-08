/**
 * Storybook Story for SplashScreen
 */

import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { SplashScreen } from './SplashScreen';

const meta: Meta<typeof SplashScreen> = {
  title: 'Screens/SplashScreen',
  component: SplashScreen,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryFn<typeof SplashScreen>;

export const Default: Story = (args) => {
  return <SplashScreen {...args} navigation={mockNavigation} />;
};

const mockNavigation = {
  replace: () => console.log('Navigate'),
};

Default.args = {};

