/**
 * Timeline Stories
 * Rodistaa Mobile Timeline Component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Timeline } from './Timeline';

const meta: Meta<typeof Timeline> = {
  title: 'Mobile/Molecule/Timeline',
  component: Timeline,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Timeline component for displaying shipment progress. Shows completed, active, and pending events.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Timeline>;

const mockEvents = [
  {
    id: '1',
    title: 'Shipment Assigned',
    description: 'Assigned to driver Rajesh Kumar',
    timestamp: '2024-01-02T08:00:00Z',
    status: 'completed' as const,
  },
  {
    id: '2',
    title: 'Pickup Completed',
    description: 'Photos uploaded and verified',
    timestamp: '2024-01-02T10:30:00Z',
    status: 'completed' as const,
  },
  {
    id: '3',
    title: 'In Transit',
    description: 'On route to destination',
    timestamp: '2024-01-02T12:00:00Z',
    status: 'active' as const,
  },
  {
    id: '4',
    title: 'Drop Off',
    description: 'Expected arrival at 6:00 PM',
    timestamp: '2024-01-02T18:00:00Z',
    status: 'pending' as const,
  },
];

export const Default: Story = {
  args: {
    events: mockEvents,
  },
};

export const AllCompleted: Story = {
  args: {
    events: mockEvents.map((e) => ({ ...e, status: 'completed' as const })),
  },
};

export const AllPending: Story = {
  args: {
    events: mockEvents.map((e) => ({ ...e, status: 'pending' as const })),
  },
};

export const SingleEvent: Story = {
  args: {
    events: [mockEvents[0]],
  },
};

export const ManyEvents: Story = {
  args: {
    events: [
      ...mockEvents,
      {
        id: '5',
        title: 'POD Uploaded',
        description: 'Proof of delivery uploaded',
        timestamp: '2024-01-02T19:00:00Z',
        status: 'pending' as const,
      },
      {
        id: '6',
        title: 'Shipment Completed',
        description: 'All steps completed',
        timestamp: '2024-01-02T20:00:00Z',
        status: 'pending' as const,
      },
    ],
  },
};

