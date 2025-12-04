/**
 * TruckCardWeb Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { TruckCardWeb } from './TruckCardWeb';

const meta: Meta<typeof TruckCardWeb> = {
  title: 'Web/Molecule/TruckCardWeb',
  component: TruckCardWeb,
  parameters: {
    layout: 'padded',
    tags: ['autodocs'],
  },
};

export default meta;
type Story = StoryObj<typeof TruckCardWeb>;

export const Active: Story = {
  args: {
    id: '1',
    registrationNumber: 'TN-12-AB-1234',
    vehicleType: 'Container 20ft',
    capacityTons: 10,
    bodyType: 'Container',
    status: 'ACTIVE',
    operatorName: 'ABC Transport',
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

