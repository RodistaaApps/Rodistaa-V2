/**
 * RModal Stories
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { RModal } from './RModal';
import { RButton } from './RButton';
import { Text } from 'react-native';
import { MobileTextStyles } from '../../tokens';

const meta: Meta<typeof RModal> = {
  title: 'Mobile/RModal',
  component: RModal,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RModal>;

const ModalExample = () => {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <RButton title="Open Modal" onPress={() => setVisible(true)} />
      <RModal visible={visible} onClose={() => setVisible(false)} title="Modal Title">
        <Text style={MobileTextStyles.body}>Modal content goes here</Text>
        <RButton title="Close" onPress={() => setVisible(false)} />
      </RModal>
    </>
  );
};

export const Default: Story = {
  render: () => <ModalExample />,
};

