/**
 * ACSPanel Stories
 * Rodistaa Web ACS Override Panel Component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ACSPanel } from './ACSPanel';

const meta: Meta<typeof ACSPanel> = {
  title: 'Web/Organism/ACSPanel',
  component: ACSPanel,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Panel for viewing and approving ACS override requests. Used in admin portal for business rule exceptions.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ACSPanel>;

const mockOverrides = [
  {
    id: 'OVR-001',
    entityType: 'bid' as const,
    entityId: 'BID-001',
    ruleId: 'RULE-001',
    ruleName: 'One Active Bid Per Operator',
    violation: 'Operator has multiple active bids for same booking',
    requestedBy: 'District Franchise - North',
    requestedAt: '2024-01-02T10:30:00Z',
    justification: 'Operator dispute resolution - special case',
    status: 'pending' as const,
  },
  {
    id: 'OVR-002',
    entityType: 'truck' as const,
    entityId: 'TRK-001',
    ruleId: 'RULE-002',
    ruleName: 'Truck Document Expiry',
    violation: 'Truck documents expired',
    requestedBy: 'ACS Engine',
    requestedAt: '2024-01-02T09:15:00Z',
    justification: 'Document verification completed - renewal in process',
    status: 'pending' as const,
  },
];

export const WithPendingOverrides: Story = {
  args: {
    overrides: mockOverrides,
    canApprove: true,
    onApprove: async (id, notes) => console.log('Approve:', id, notes),
    onReject: async (id, reason) => console.log('Reject:', id, reason),
  },
};

export const WithApprovedOverrides: Story = {
  args: {
    overrides: [
      {
        ...mockOverrides[0],
        status: 'approved' as const,
        reviewedBy: 'Admin User',
        reviewedAt: '2024-01-02T11:00:00Z',
        reviewNotes: 'Approved due to special circumstances',
      },
    ],
    canApprove: true,
  },
};

export const WithRejectedOverrides: Story = {
  args: {
    overrides: [
      {
        ...mockOverrides[0],
        status: 'rejected' as const,
        reviewedBy: 'Admin User',
        reviewedAt: '2024-01-02T11:00:00Z',
        reviewNotes: 'Rejected: Does not meet exception criteria',
      },
    ],
    canApprove: true,
  },
};

export const Empty: Story = {
  args: {
    overrides: [],
    canApprove: true,
  },
};

export const ViewOnly: Story = {
  args: {
    overrides: mockOverrides,
    canApprove: false,
  },
};

