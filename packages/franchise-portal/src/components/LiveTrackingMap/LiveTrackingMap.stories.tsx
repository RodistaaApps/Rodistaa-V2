/**
 * Storybook Stories: Live Tracking Map
 * 
 * Visual documentation and testing for the LiveTrackingMap component.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LiveTrackingMap } from './LiveTrackingMap';

const meta: Meta<typeof LiveTrackingMap> = {
  title: 'Components/LiveTrackingMap',
  component: LiveTrackingMap,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof LiveTrackingMap>;

// Sample GPS points (Delhi → Bangalore route)
const sampleGPSPoints = [
  { lat: 28.7041, lng: 77.1025, speed: 60, timestamp: '2025-12-04T19:00:00Z' },
  { lat: 27.1767, lng: 78.0081, speed: 65, timestamp: '2025-12-05T02:30:00Z' },
  { lat: 25.5941, lng: 77.7323, speed: 70, timestamp: '2025-12-05T08:00:00Z' },
  { lat: 23.2599, lng: 77.4126, speed: 55, timestamp: '2025-12-05T12:00:00Z' },
  { lat: 21.1458, lng: 79.0882, speed: 75, timestamp: '2025-12-05T16:00:00Z' },
  { lat: 19.0760, lng: 72.8777, speed: 50, timestamp: '2025-12-05T20:00:00Z' },
];

// Short route (few points)
export const ShortRoute: Story = {
  args: {
    shipmentId: 'SHP-001',
    gpsPoints: sampleGPSPoints.slice(0, 3),
    pickupLocation: { lat: 28.7041, lng: 77.1025, city: 'Delhi' },
    dropLocation: { lat: 25.5941, lng: 77.7323, city: 'Bhopal' },
    currentLocation: { lat: 26.8467, lng: 77.4671 },
    theme: 'light',
  },
};

// Long route (many points)
export const LongRoute: Story = {
  args: {
    shipmentId: 'SHP-002',
    gpsPoints: sampleGPSPoints,
    pickupLocation: { lat: 28.7041, lng: 77.1025, city: 'Delhi' },
    dropLocation: { lat: 19.0760, lng: 72.8777, city: 'Mumbai' },
    currentLocation: { lat: 21.1458, lng: 79.0882 },
    theme: 'light',
  },
};

// High speed route
export const HighSpeed: Story = {
  args: {
    shipmentId: 'SHP-003',
    gpsPoints: [
      { lat: 28.7041, lng: 77.1025, speed: 85, timestamp: '2025-12-04T19:00:00Z' },
      { lat: 27.1767, lng: 78.0081, speed: 90, timestamp: '2025-12-05T02:30:00Z' },
      { lat: 25.5941, lng: 77.7323, speed: 95, timestamp: '2025-12-05T08:00:00Z' },
    ],
    pickupLocation: { lat: 28.7041, lng: 77.1025, city: 'Delhi' },
    dropLocation: { lat: 25.5941, lng: 77.7323, city: 'Bhopal' },
    theme: 'light',
  },
};

// Slow speed route
export const SlowSpeed: Story = {
  args: {
    shipmentId: 'SHP-004',
    gpsPoints: [
      { lat: 28.7041, lng: 77.1025, speed: 20, timestamp: '2025-12-04T19:00:00Z' },
      { lat: 27.1767, lng: 78.0081, speed: 25, timestamp: '2025-12-05T02:30:00Z' },
      { lat: 25.5941, lng: 77.7323, speed: 15, timestamp: '2025-12-05T08:00:00Z' },
    ],
    pickupLocation: { lat: 28.7041, lng: 77.1025, city: 'Delhi' },
    dropLocation: { lat: 25.5941, lng: 77.7323, city: 'Bhopal' },
    theme: 'light',
  },
};

// Dark theme
export const DarkTheme: Story = {
  args: {
    shipmentId: 'SHP-005',
    gpsPoints: sampleGPSPoints,
    pickupLocation: { lat: 28.7041, lng: 77.1025, city: 'Delhi' },
    dropLocation: { lat: 19.0760, lng: 72.8777, city: 'Mumbai' },
    currentLocation: { lat: 21.1458, lng: 79.0882 },
    theme: 'dark',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

// Just started (few points)
export const JustStarted: Story = {
  args: {
    shipmentId: 'SHP-006',
    gpsPoints: sampleGPSPoints.slice(0, 1),
    pickupLocation: { lat: 28.7041, lng: 77.1025, city: 'Delhi' },
    dropLocation: { lat: 19.0760, lng: 72.8777, city: 'Mumbai' },
    currentLocation: { lat: 28.7041, lng: 77.1025 },
    theme: 'light',
  },
};

// Near completion
export const NearCompletion: Story = {
  args: {
    shipmentId: 'SHP-007',
    gpsPoints: sampleGPSPoints,
    pickupLocation: { lat: 28.7041, lng: 77.1025, city: 'Delhi' },
    dropLocation: { lat: 19.0760, lng: 72.8777, city: 'Mumbai' },
    currentLocation: { lat: 19.0760, lng: 72.8777 },
    theme: 'light',
  },
};

