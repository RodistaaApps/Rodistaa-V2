/**
 * Storybook Stories: POD Viewer
 * 
 * Visual documentation and testing for the PODViewer component.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PODViewer } from './PODViewer';

const meta: Meta<typeof PODViewer> = {
  title: 'Components/PODViewer',
  component: PODViewer,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof PODViewer>;

// No POD uploaded (empty state)
export const NoPOD: Story = {
  args: {
    shipmentId: 'SHP-001',
    photos: [],
    pdfUrl: null,
    theme: 'light',
  },
};

// With photos only
export const WithPhotos: Story = {
  args: {
    shipmentId: 'SHP-002',
    photos: [
      '/uploads/pod/sample1.jpg',
      '/uploads/pod/sample2.jpg',
      '/uploads/pod/sample3.jpg',
    ],
    pdfUrl: null,
    onViewAudit: async (reason: string) => {
      console.log('View audit logged:', reason);
      return Promise.resolve();
    },
    theme: 'light',
  },
};

// With PDF only
export const WithPDF: Story = {
  args: {
    shipmentId: 'SHP-003',
    photos: [],
    pdfUrl: '/uploads/pod/pod-sample.pdf',
    onViewAudit: async (reason: string) => {
      console.log('View audit logged:', reason);
      return Promise.resolve();
    },
    theme: 'light',
  },
};

// With both photos and PDF
export const WithPhotosAndPDF: Story = {
  args: {
    shipmentId: 'SHP-004',
    photos: [
      '/uploads/pod/sample1.jpg',
      '/uploads/pod/sample2.jpg',
      '/uploads/pod/sample3.jpg',
      '/uploads/pod/sample4.jpg',
    ],
    pdfUrl: '/uploads/pod/pod-consolidated.pdf',
    onViewAudit: async (reason: string) => {
      console.log('View audit logged:', reason);
      return Promise.resolve();
    },
    theme: 'light',
  },
};

// Dark theme
export const DarkTheme: Story = {
  args: {
    shipmentId: 'SHP-005',
    photos: ['/uploads/pod/sample1.jpg', '/uploads/pod/sample2.jpg'],
    pdfUrl: '/uploads/pod/pod-sample.pdf',
    onViewAudit: async (reason: string) => {
      console.log('View audit logged:', reason);
      return Promise.resolve();
    },
    theme: 'dark',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

// Audit required (access gate)
export const AuditRequired: Story = {
  args: {
    shipmentId: 'SHP-006',
    photos: ['/uploads/pod/sample1.jpg'],
    pdfUrl: '/uploads/pod/pod-sample.pdf',
    onViewAudit: async (reason: string) => {
      console.log('Audit reason submitted:', reason);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return Promise.resolve();
    },
    theme: 'light',
  },
};

