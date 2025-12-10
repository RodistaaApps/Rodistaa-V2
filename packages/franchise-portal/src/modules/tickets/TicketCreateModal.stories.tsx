/**
 * Storybook Stories: Ticket Create Modal
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TicketCreateModal } from './TicketCreateModal';

const meta: Meta<typeof TicketCreateModal> = {
  title: 'Tickets/TicketCreateModal',
  component: TicketCreateModal,
};

export default meta;
type Story = StoryObj<typeof TicketCreateModal>;

export const Default: Story = {
  args: {
    visible: true,
    onClose: () => console.log('Close'),
    onSuccess: () => console.log('Success'),
    theme: 'light',
  },
};

export const DarkTheme: Story = {
  args: {
    visible: true,
    onClose: () => console.log('Close'),
    onSuccess: () => console.log('Success'),
    theme: 'dark',
  },
  parameters: { backgrounds: { default: 'dark' } },
};

