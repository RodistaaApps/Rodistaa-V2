/**
 * LoadCard Stories
 * Rodistaa Mobile Load/Booking Card Component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { LoadCard } from './LoadCard';

const meta: Meta<typeof LoadCard> = {
  title: 'Mobile/Molecule/LoadCard',
  component: LoadCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Card component for displaying booking/load information in mobile apps. Shows pickup/drop locations, tonnage, price range, and bid count.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LoadCard>;

const mockLoad = {
  id: 'BKG-20240102-0001',
  pickup: {
    address: '123 Main Street',
    city: 'Bangalore',
    state: 'Karnataka',
  },
  drop: {
    address: '456 Park Avenue',
    city: 'Chennai',
    state: 'Tamil Nadu',
  },
  tonnage: 15,
  priceRange: {
    min: 20000,
    max: 30000,
  },
  status: 'OPEN_FOR_BIDDING' as const,
  bidCount: 5,
};

export const OpenForBidding: Story = {
  args: {
    ...mockLoad,
    onPress: () => console.log('Card pressed'),
  },
};

export const Confirmed: Story = {
  args: {
    ...mockLoad,
    status: 'CONFIRMED',
    bidCount: undefined,
  },
};

export const InTransit: Story = {
  args: {
    ...mockLoad,
    status: 'IN_TRANSIT',
    bidCount: undefined,
  },
};

export const Completed: Story = {
  args: {
    ...mockLoad,
    status: 'COMPLETED',
    bidCount: undefined,
  },
};

export const Cancelled: Story = {
  args: {
    ...mockLoad,
    status: 'CANCELLED',
    bidCount: undefined,
  },
};

export const NoBids: Story = {
  args: {
    ...mockLoad,
    bidCount: 0,
  },
};

export const LongAddress: Story = {
  args: {
    ...mockLoad,
    pickup: {
      address: '123 Very Long Street Name That Might Wrap',
      city: 'Bangalore',
      state: 'Karnataka',
    },
    drop: {
      address: '456 Another Very Long Address That Should Handle Text Overflow Properly',
      city: 'Chennai',
      state: 'Tamil Nadu',
    },
  },
};

