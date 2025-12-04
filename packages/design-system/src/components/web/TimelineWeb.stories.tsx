/**
 * TimelineWeb Stories
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TimelineWeb } from './TimelineWeb';

const meta: Meta<typeof TimelineWeb> = {
  title: 'Web/TimelineWeb',
  component: TimelineWeb,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TimelineWeb>;

const sampleEvents = [
  {
    id: '1',
    title: 'Booking Created',
    description: 'Shipper created a new booking',
    timestamp: new Date('2024-01-01T10:00:00Z'),
    status: 'completed' as const,
  },
  {
    id: '2',
    title: 'Bid Submitted',
    description: 'Operator submitted a bid',
    timestamp: new Date('2024-01-01T11:00:00Z'),
    status: 'completed' as const,
  },
  {
    id: '3',
    title: 'Bid Finalized',
    description: 'Shipper accepted the bid',
    timestamp: new Date('2024-01-01T12:00:00Z'),
    status: 'completed' as const,
  },
  {
    id: '4',
    title: 'Shipment In Transit',
    description: 'Driver started the trip',
    timestamp: new Date('2024-01-01T13:00:00Z'),
    status: 'active' as const,
  },
];

export const Default: Story = {
  args: {
    events: sampleEvents,
  },
};

export const Vertical: Story = {
  args: {
    events: sampleEvents,
    mode: 'vertical',
  },
};

export const Horizontal: Story = {
  args: {
    events: sampleEvents,
    mode: 'horizontal',
  },
};

