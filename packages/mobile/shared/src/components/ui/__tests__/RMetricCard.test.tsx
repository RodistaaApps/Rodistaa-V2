/**
 * Unit Tests for RMetricCard Component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RMetricCard } from '../RMetricCard';

describe('RMetricCard', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with icon, value, and label', () => {
    const { getByTestId } = render(
      <RMetricCard icon="🚛" value={8} label="Available Trucks" />
    );
    
    expect(getByTestId('metric-icon')).toBeTruthy();
    expect(getByTestId('metric-value')).toBeTruthy();
    expect(getByTestId('metric-label')).toBeTruthy();
  });

  it('renders value as string', () => {
    const { getByTestId } = render(
      <RMetricCard value="₹145K" label="Balance" />
    );
    
    expect(getByTestId('metric-value').props.children).toBe('₹145K');
  });

  it('calls onPress when card is pressed', () => {
    const { getByTestId } = render(
      <RMetricCard
        icon="💰"
        value={12}
        label="Active Bids"
        onPress={mockOnPress}
      />
    );
    
    fireEvent.press(getByTestId('r-metric-card-button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when not provided', () => {
    const { getByTestId } = render(
      <RMetricCard icon="🚛" value={8} label="Trucks" />
    );
    
    // Should not throw error when pressing non-clickable card
    expect(getByTestId('r-metric-card')).toBeTruthy();
  });

  it('has accessibility label when clickable', () => {
    const { getByLabelText } = render(
      <RMetricCard
        icon="💰"
        value={12}
        label="Active Bids"
        onPress={mockOnPress}
      />
    );
    
    expect(getByLabelText('Active Bids: 12')).toBeTruthy();
  });
});

