/**
 * LoadCardWeb Stories
 * Rodistaa Web Load/Booking Card Component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { LoadCardWeb } from './LoadCardWeb';

const meta: Meta<typeof LoadCardWeb> = {
  title: 'Web/Molecule/LoadCardWeb',
  component: LoadCardWeb,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Card component for displaying booking/load information in web portals. Shows pickup/drop locations, tonnage, price range, and bid count.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LoadCardWeb>;

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
  shipperName: 'ABC Corp',
  createdAt: '2024-01-02T10:00:00Z',
};

export const OpenForBidding: Story = {
  args: {
    ...mockLoad,
    onClick: () => console.log('Card clicked'),
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

export const GridView: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
      <LoadCardWeb {...mockLoad} />
      <LoadCardWeb {...mockLoad} id="BKG-002" status="CONFIRMED" bidCount={undefined} />
      <LoadCardWeb {...mockLoad} id="BKG-003" status="IN_TRANSIT" bidCount={undefined} />
    </div>
  ),
};

