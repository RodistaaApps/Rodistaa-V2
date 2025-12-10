/**
 * Unit Tests for RListCard Component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RListCard } from '../RListCard';

describe('RListCard', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with title', () => {
    const { getByTestId } = render(
      <RListCard title="BK001" />
    );
    
    expect(getByTestId('list-card-title')).toBeTruthy();
  });

  it('renders with subtitle and metadata', () => {
    const { getByTestId } = render(
      <RListCard
        title="BK001"
        subtitle="Mumbai → Delhi"
        metadata="Posted 2 hours ago"
      />
    );
    
    expect(getByTestId('list-card-subtitle')).toBeTruthy();
    expect(getByTestId('list-card-metadata')).toBeTruthy();
  });

  it('renders badge when provided', () => {
    const { getByTestId } = render(
      <RListCard title="TR003" badge="URGENT" />
    );
    
    expect(getByTestId('list-card-badge')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const { getByTestId } = render(
      <RListCard title="BK001" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByTestId('r-list-card-button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('has accessibility label', () => {
    const { getByLabelText } = render(
      <RListCard
        title="BK001"
        subtitle="Mumbai → Delhi"
        onPress={mockOnPress}
      />
    );
    
    expect(getByLabelText('BK001, Mumbai → Delhi')).toBeTruthy();
  });
});

