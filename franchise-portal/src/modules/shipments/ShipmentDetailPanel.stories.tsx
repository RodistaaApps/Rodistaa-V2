/**
 * Storybook Stories: Shipment Detail Panel
 * 
 * Visual documentation and testing for the ShipmentDetailPanel component.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ShipmentDetailPanel } from './ShipmentDetailPanel';

const meta: Meta<typeof ShipmentDetailPanel> = {
  title: 'Shipments/ShipmentDetailPanel',
  component: ShipmentDetailPanel,
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
type Story = StoryObj<typeof ShipmentDetailPanel>;

// Default story: Shipment in transit
export const InTransit: Story = {
  args: {
    shipmentId: 'SHP-001',
    open: true,
    onClose: () => console.log('Close clicked'),
    theme: 'light',
  },
};

// Delivered shipment with POD
export const DeliveredWithPOD: Story = {
  args: {
    shipmentId: 'SHP-002',
    open: true,
    onClose: () => console.log('Close clicked'),
    theme: 'light',
  },
};

// Delayed shipment
export const DelayedStatus: Story = {
  args: {
    shipmentId: 'SHP-003',
    open: true,
    onClose: () => console.log('Close clicked'),
    theme: 'light',
  },
};

// Shipment with dispute
export const WithDispute: Story = {
  args: {
    shipmentId: 'SHP-004',
    open: true,
    onClose: () => console.log('Close clicked'),
    theme: 'light',
  },
};

// Payment not settled
export const PaymentPending: Story = {
  args: {
    shipmentId: 'SHP-005',
    open: true,
    onClose: () => console.log('Close clicked'),
    theme: 'light',
  },
};

// Dark theme
export const DarkTheme: Story = {
  args: {
    shipmentId: 'SHP-001',
    open: true,
    onClose: () => console.log('Close clicked'),
    theme: 'dark',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

// Closed panel
export const ClosedPanel: Story = {
  args: {
    shipmentId: 'SHP-001',
    open: false,
    onClose: () => console.log('Close clicked'),
    theme: 'light',
  },
};

