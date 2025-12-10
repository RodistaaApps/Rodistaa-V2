/**
 * Unit Test for SplashScreen
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { SplashScreen } from '../SplashScreen';

const mockNavigation = {
  replace: jest.fn(),
};

jest.useFakeTimers();

describe('SplashScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(<SplashScreen navigation={mockNavigation} />);
    expect(getByText('Rodistaa')).toBeTruthy();
  });

  it('navigates after timeout', async () => {
    render(<SplashScreen navigation={mockNavigation} />);
    
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(mockNavigation.replace).toHaveBeenCalled();
    });
  });
});

