/**
 * RInput Stories
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { RInput } from './RInput';

const meta: Meta<typeof RInput> = {
  title: 'Mobile/RInput',
  component: RInput,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RInput>;

export const Default: Story = {
  args: {
    label: 'Phone Number',
    placeholder: 'Enter phone number',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter email',
    error: 'Invalid email format',
  },
};

export const Required: Story = {
  args: {
    label: 'Name',
    placeholder: 'Enter your name',
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Field',
    placeholder: 'This field is disabled',
    value: 'Disabled value',
    editable: false,
  },
};

