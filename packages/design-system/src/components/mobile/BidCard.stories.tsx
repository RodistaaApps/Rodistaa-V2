/**
 * BidCard Stories
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BidCard } from './BidCard';

const meta: Meta<typeof BidCard> = {
  title: 'Mobile/Molecule/BidCard',
  component: BidCard,
  parameters: {
    layout: 'padded',
    tags: ['autodocs'],
  },
};

export default meta;
type Story = StoryObj<typeof BidCard>;

export const Pending: Story = {
  args: {
    id: 'BID-001',
    bookingId: 'BKG-001',
    amount: 25000,
    operatorName: 'ABC Transport',
    operatorPhone: '9876543210',
    status: 'PENDING',
    submittedAt: new Date().toISOString(),
    canAccept: true,
    canReject: true,
  },
};

export const Accepted: Story = {
  args: {
    id: 'BID-002',
    bookingId: 'BKG-002',
    amount: 30000,
    operatorName: 'XYZ Logistics',
    status: 'ACCEPTED',
    submittedAt: new Date(Date.now() - 3600000).toISOString(),
  },
};

export const Rejected: Story = {
  args: {
    id: 'BID-003',
    bookingId: 'BKG-003',
    amount: 20000,
    operatorName: 'DEF Transport',
    status: 'REJECTED',
    submittedAt: new Date(Date.now() - 7200000).toISOString(),
  },
};

