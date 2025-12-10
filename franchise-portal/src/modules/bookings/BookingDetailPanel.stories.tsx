/**
 * Storybook Stories: Booking Detail Panel
 * 
 * Visual documentation and testing for the BookingDetailPanel component.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BookingDetailPanel } from './BookingDetailPanel';

const meta: Meta<typeof BookingDetailPanel> = {
  title: 'Bookings/BookingDetailPanel',
  component: BookingDetailPanel,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    theme: {
      control: { type: 'radio' },
      options: ['light', 'dark'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof BookingDetailPanel>;

// Default story: Booking in bidding state
export const BiddingStatus: Story = {
  args: {
    bookingId: 'BKG-001',
    open: true,
    onClose: () => console.log('Close clicked'),
    theme: 'light',
  },
};

// Booking with multiple bids
export const MultipleBids: Story = {
  args: {
    bookingId: 'BKG-002',
    open: true,
    onClose: () => console.log('Close clicked'),
    theme: 'light',
  },
};

// Finalized booking
export const FinalizedStatus: Story = {
  args: {
    bookingId: 'BKG-003',
    open: true,
    onClose: () => console.log('Close clicked'),
    theme: 'light',
  },
};

// Cancelled booking
export const CancelledStatus: Story = {
  args: {
    bookingId: 'BKG-004',
    open: true,
    onClose: () => console.log('Close clicked'),
    theme: 'light',
  },
};

// Dark theme
export const DarkTheme: Story = {
  args: {
    bookingId: 'BKG-001',
    open: true,
    onClose: () => console.log('Close clicked'),
    theme: 'dark',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

// Closed panel (not visible)
export const ClosedPanel: Story = {
  args: {
    bookingId: 'BKG-001',
    open: false,
    onClose: () => console.log('Close clicked'),
    theme: 'light',
  },
};

// With auto-finalize countdown
export const AutoFinalizeCountdown: Story = {
  args: {
    bookingId: 'BKG-005',
    open: true,
    onClose: () => console.log('Close clicked'),
    theme: 'light',
  },
};

