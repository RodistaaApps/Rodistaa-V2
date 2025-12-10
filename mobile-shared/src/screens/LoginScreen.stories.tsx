/**
 * Storybook Story for LoginScreen
 */

import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { LoginScreen } from './LoginScreen';
import { NavigationContainer } from '@react-navigation/native';

const meta: Meta<typeof LoginScreen> = {
  title: 'Screens/LoginScreen',
  component: LoginScreen,
  decorators: [
    (Story) => (
      <NavigationContainer>
        <Story />
      </NavigationContainer>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryFn<typeof LoginScreen>;

export const Default: Story = (args) => {
  return <LoginScreen {...args} navigation={mockNavigation} />;
};

const mockNavigation = {
  replace: () => console.log('Navigate'),
  navigate: () => console.log('Navigate'),
};

Default.args = {};

export const WithPhoneEntered: Story = (args) => {
  return <LoginScreen {...args} navigation={mockNavigation} />;
};

WithPhoneEntered.args = {};

