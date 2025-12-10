/**
 * Storybook Story for ShipperHomeScreen
 */

import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { ShipperHomeScreen } from './ShipperHomeScreen';

const meta: Meta<typeof ShipperHomeScreen> = {
  title: 'Screens/Shipper/HomeScreen',
  component: ShipperHomeScreen,
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

type Story = StoryFn<typeof ShipperHomeScreen>;

const mockNavigation = {
  navigate: (name: string, params?: any) => console.log('Navigate:', name, params),
  replace: (name: string) => console.log('Replace:', name),
  goBack: () => console.log('Go back'),
};

export const Default: Story = () => (
  <ShipperHomeScreen navigation={mockNavigation} />
);

export const Offline: Story = () => (
  <ShipperHomeScreen navigation={mockNavigation} />
);
Offline.parameters = {
  // Mock offline state in decorator or use MSW
};

