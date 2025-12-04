/**
 * InspectionGrid Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { InspectionGrid } from './InspectionGrid';

const meta: Meta<typeof InspectionGrid> = {
  title: 'Web/Organism/InspectionGrid',
  component: InspectionGrid,
  parameters: {
    layout: 'padded',
    tags: ['autodocs'],
  },
};

export default meta;
type Story = StoryObj<typeof InspectionGrid>;

const mockPhotos = [
  {
    id: '1',
    url: '/placeholder-truck.jpg',
    type: 'front' as const,
    uploadedAt: new Date().toISOString(),
    geotagged: true,
  },
  {
    id: '2',
    url: '/placeholder-truck.jpg',
    type: 'back' as const,
    uploadedAt: new Date().toISOString(),
    geotagged: true,
  },
  {
    id: '3',
    url: '/placeholder-truck.jpg',
    type: 'left' as const,
    uploadedAt: new Date().toISOString(),
    geotagged: true,
  },
  {
    id: '4',
    url: '/placeholder-truck.jpg',
    type: 'right' as const,
    uploadedAt: new Date().toISOString(),
    geotagged: true,
  },
];

export const WithPhotos: Story = {
  args: {
    photos: mockPhotos,
    canUpload: false,
    onPhotoClick: (photo) => console.log('Photo clicked:', photo),
  },
};

export const EmptyWithUpload: Story = {
  args: {
    photos: [],
    canUpload: true,
    onUpload: (type, file) => console.log('Upload:', type, file),
  },
};

export const PartialPhotos: Story = {
  args: {
    photos: [mockPhotos[0], mockPhotos[1]],
    canUpload: true,
    onUpload: (type, file) => console.log('Upload:', type, file),
  },
};

