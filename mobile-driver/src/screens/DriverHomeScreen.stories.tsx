/**
 * Storybook Story for DriverHomeScreen
 */

import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { DriverHomeScreen } from './DriverHomeScreen';

const meta: Meta<typeof DriverHomeScreen> = {
  title: 'Screens/Driver/HomeScreen',
  component: DriverHomeScreen,
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
        },
      });
      return (
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <Story />
          </NavigationContainer>
        </QueryClientProvider>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryFn<typeof DriverHomeScreen>;

const mockNavigation = {
  navigate: (name: string, params?: any) => console.log('Navigate:', name, params),
  replace: (name: string) => console.log('Replace:', name),
  goBack: () => console.log('Go back'),
};

export const Default: Story = () => (
  <DriverHomeScreen navigation={mockNavigation} />
);

export const WithActiveTrip: Story = () => (
  <DriverHomeScreen navigation={mockNavigation} />
);

