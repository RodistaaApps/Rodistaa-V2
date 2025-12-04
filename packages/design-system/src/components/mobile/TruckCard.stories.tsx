/**
 * TruckCard Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { TruckCard } from './TruckCard';

const meta: Meta<typeof TruckCard> = {
  title: 'Mobile/Molecule/TruckCard',
  component: TruckCard,
  parameters: {
    layout: 'padded',
    tags: ['autodocs'],
  },
};

export default meta;
type Story = StoryObj<typeof TruckCard>;

export const Active: Story = {
  args: {
    id: '1',
    registrationNumber: 'TN-12-AB-1234',
    vehicleType: 'Container 20ft',
    capacityTons: 10,
    bodyType: 'Container',
    status: 'ACTIVE',
    inspectionDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
};

export const PendingInspection: Story = {
  args: {
    id: '2',
    registrationNumber: 'TN-12-CD-5678',
    vehicleType: 'Container 40ft',
    capacityTons: 20,
    bodyType: 'Container',
    status: 'PENDING_INSPECTION',
    inspectionDue: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
};

export const Blocked: Story = {
  args: {
    id: '3',
    registrationNumber: 'TN-12-EF-9012',
    vehicleType: 'Flatbed',
    capacityTons: 15,
    bodyType: 'Flatbed',
    status: 'BLOCKED',
  },
};

