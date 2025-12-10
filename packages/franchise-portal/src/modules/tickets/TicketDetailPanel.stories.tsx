/**
 * Storybook Stories: Ticket Detail Panel
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TicketDetailPanel } from './TicketDetailPanel';

const meta: Meta<typeof TicketDetailPanel> = {
  title: 'Tickets/TicketDetailPanel',
  component: TicketDetailPanel,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof TicketDetailPanel>;

export const HighPriorityOpen: Story = {
  args: {
    ticketId: 'TKT-001',
    open: true,
    onClose: () => console.log('Close'),
    theme: 'light',
  },
};

export const CriticalEscalated: Story = {
  args: {
    ticketId: 'TKT-003',
    open: true,
    onClose: () => console.log('Close'),
    theme: 'light',
  },
};

export const ResolvedTicket: Story = {
  args: {
    ticketId: 'TKT-004',
    open: true,
    onClose: () => console.log('Close'),
    theme: 'light',
  },
};

export const DarkTheme: Story = {
  args: {
    ticketId: 'TKT-001',
    open: true,
    onClose: () => console.log('Close'),
    theme: 'dark',
  },
  parameters: { backgrounds: { default: 'dark' } },
};

