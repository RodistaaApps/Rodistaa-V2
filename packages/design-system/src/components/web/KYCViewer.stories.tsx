/**
 * KYCViewer Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { KYCViewer } from './KYCViewer';

const meta: Meta<typeof KYCViewer> = {
  title: 'Web/Organism/KYCViewer',
  component: KYCViewer,
  parameters: {
    layout: 'padded',
    tags: ['autodocs'],
  },
};

export default meta;
type Story = StoryObj<typeof KYCViewer>;

const mockDocuments = [
  {
    id: 'KYC-001',
    type: 'aadhaar' as const,
    encrypted: true,
  },
  {
    id: 'KYC-002',
    type: 'pan' as const,
    encrypted: true,
  },
];

export const Encrypted: Story = {
  args: {
    documents: mockDocuments,
    canDecrypt: true,
    onDecrypt: async (id) => console.log('Decrypt:', id),
  },
};

export const Decrypted: Story = {
  args: {
    documents: [
      {
        id: 'KYC-001',
        type: 'aadhaar' as const,
        encrypted: false,
        decryptedData: {
          name: 'John Doe',
          number: '1234 5678 9012',
          dob: '1990-01-01',
          address: '123 Main St, Bangalore',
        },
      },
    ],
    canDecrypt: true,
  },
};

export const ViewOnly: Story = {
  args: {
    documents: mockDocuments,
    canDecrypt: false,
  },
};

