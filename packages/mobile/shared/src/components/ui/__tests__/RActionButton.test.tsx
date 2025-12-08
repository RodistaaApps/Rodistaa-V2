/**
 * Unit Tests for RActionButton Component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RActionButton } from '../RActionButton';

describe('RActionButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with label', () => {
    const { getByText } = render(
      <RActionButton label="Post Load" onPress={mockOnPress} />
    );
    
    expect(getByText('Post Load')).toBeTruthy();
  });

  it('renders with icon', () => {
    const { getByTestId } = render(
      <RActionButton label="Post Load" icon="➕" onPress={mockOnPress} />
    );
    
    expect(getByTestId('button-label')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByTestId } = render(
      <RActionButton label="Submit" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByTestId('r-action-button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const { getByTestId } = render(
      <RActionButton label="Submit" onPress={mockOnPress} disabled={true} />
    );
    
    fireEvent.press(getByTestId('r-action-button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('shows loading state', () => {
    const { getByTestId, queryByTestId } = render(
      <RActionButton label="Submit" onPress={mockOnPress} loading={true} />
    );
    
    expect(getByTestId('button-loading')).toBeTruthy();
    expect(queryByTestId('button-label')).toBeNull();
  });

  it('applies variant styles', () => {
    const { rerender, getByTestId } = render(
      <RActionButton label="Primary" variant="primary" onPress={mockOnPress} />
    );
    
    expect(getByTestId('r-action-button')).toBeTruthy();
    
    rerender(
      <RActionButton label="Outline" variant="outline" onPress={mockOnPress} />
    );
    
    expect(getByTestId('r-action-button')).toBeTruthy();
  });

  it('has accessibility label', () => {
    const { getByLabelText } = render(
      <RActionButton label="Post Load" onPress={mockOnPress} />
    );
    
    expect(getByLabelText('Post Load')).toBeTruthy();
  });
});

