/**
 * RButton Stories
 * Rodistaa Mobile Button Component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { RButton } from './RButton';
import { RodistaaColors } from '../../tokens/colors';

const meta: Meta<typeof RButton> = {
  title: 'Mobile/Atomic/RButton',
  component: RButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Primary button component for Rodistaa mobile apps. Uses Rodistaa red (#C90D0D) for primary variant.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'text', 'danger'],
      description: 'Button variant style',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable button interaction',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Button takes full width',
    },
  },
};

export default meta;
type Story = StoryObj<typeof RButton>;

export const Primary: Story = {
  args: {
    title: 'Primary Button',
    variant: 'primary',
    onPress: () => console.log('Pressed'),
  },
};

export const Secondary: Story = {
  args: {
    title: 'Secondary Button',
    variant: 'secondary',
    onPress: () => console.log('Pressed'),
  },
};

export const Danger: Story = {
  args: {
    title: 'Danger Button',
    variant: 'danger',
    onPress: () => console.log('Pressed'),
  },
};

export const Text: Story = {
  args: {
    title: 'Text Button',
    variant: 'text',
    onPress: () => console.log('Pressed'),
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
      <RButton title="Small" size="small" variant="primary" onPress={() => {}} />
      <RButton title="Medium" size="medium" variant="primary" onPress={() => {}} />
      <RButton title="Large" size="large" variant="primary" onPress={() => {}} />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
      <RButton title="Normal" variant="primary" onPress={() => {}} />
      <RButton title="Disabled" variant="primary" disabled onPress={() => {}} />
      <RButton title="Loading" variant="primary" loading onPress={() => {}} />
      <RButton title="Full Width" variant="primary" fullWidth onPress={() => {}} />
    </div>
  ),
};

