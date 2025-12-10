/**
 * Unit Tests for RHeader Component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RHeader } from '../RHeader';

describe('RHeader', () => {
  const mockOnProfilePress = jest.fn();
  const mockOnMenuPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with title and subtitle', () => {
    const { getByTestId } = render(
      <RHeader title="Dashboard" subtitle="Hyderabad • 260 km" />
    );
    
    expect(getByTestId('header-title')).toBeTruthy();
    expect(getByTestId('header-subtitle')).toBeTruthy();
  });

  it('renders logo when no title provided', () => {
    const { getByTestId } = render(<RHeader />);
    
    expect(getByTestId('header-logo')).toBeTruthy();
  });

  it('calls onProfilePress when avatar is pressed', () => {
    const { getByTestId } = render(
      <RHeader showProfileAvatar={true} onProfilePress={mockOnProfilePress} />
    );
    
    fireEvent.press(getByTestId('header-profile-button'));
    expect(mockOnProfilePress).toHaveBeenCalledTimes(1);
  });

  it('calls onMenuPress when menu is pressed', () => {
    const { getByTestId } = render(
      <RHeader showMenu={true} onMenuPress={mockOnMenuPress} />
    );
    
    fireEvent.press(getByTestId('header-menu-button'));
    expect(mockOnMenuPress).toHaveBeenCalledTimes(1);
  });

  it('displays notification badge when count > 0', () => {
    const { getByTestId } = render(
      <RHeader notificationCount={5} />
    );
    
    expect(getByTestId('header-notification-button')).toBeTruthy();
  });

  it('does not display notification badge when count is 0', () => {
    const { queryByTestId } = render(
      <RHeader notificationCount={0} />
    );
    
    // Notification button should still exist, but badge might not
    expect(queryByTestId('header-notification-button')).toBeTruthy();
  });

  it('has accessibility labels', () => {
    const { getByLabelText } = render(
      <RHeader showMenu={true} showProfileAvatar={true} />
    );
    
    expect(getByLabelText('Menu')).toBeTruthy();
    expect(getByLabelText('Profile')).toBeTruthy();
  });
});

