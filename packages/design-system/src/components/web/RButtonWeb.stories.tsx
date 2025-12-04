/**
 * RButtonWeb Stories
 * Rodistaa Web Button Component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { RButtonWeb } from './RButtonWeb';

const meta: Meta<typeof RButtonWeb> = {
  title: 'Web/Atomic/RButtonWeb',
  component: RButtonWeb,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Primary button component for Rodistaa web portals. Uses Rodistaa red (#C90D0D) for primary variant.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'text', 'danger'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    disabled: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof RButtonWeb>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
    onClick: () => console.log('Clicked'),
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
    onClick: () => console.log('Clicked'),
  },
};

export const Danger: Story = {
  args: {
    children: 'Danger Button',
    variant: 'danger',
    onClick: () => console.log('Clicked'),
  },
};

export const Text: Story = {
  args: {
    children: 'Text Button',
    variant: 'text',
    onClick: () => console.log('Clicked'),
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <RButtonWeb variant="primary" size="small">Small</RButtonWeb>
      <RButtonWeb variant="primary" size="medium">Medium</RButtonWeb>
      <RButtonWeb variant="primary" size="large">Large</RButtonWeb>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
      <RButtonWeb variant="primary">Normal</RButtonWeb>
      <RButtonWeb variant="primary" disabled>Disabled</RButtonWeb>
      <RButtonWeb variant="primary" loading>Loading</RButtonWeb>
      <RButtonWeb variant="primary" fullWidth>Full Width</RButtonWeb>
    </div>
  ),
};

