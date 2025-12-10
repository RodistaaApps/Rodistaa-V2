/**
 * Unit Test for LoginScreen
 * Jest + React Native Testing Library
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../LoginScreen';
import { NavigationContainer } from '@react-navigation/native';

// Mock navigation
const mockNavigation = {
  replace: jest.fn(),
  navigate: jest.fn(),
};

// Mock API client
jest.mock('../../api/client', () => ({
  apiClient: {
    post: jest.fn(),
    setAuthToken: jest.fn(),
  },
}));

// Mock i18n
jest.mock('../../i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(
      <NavigationContainer>
        <LoginScreen navigation={mockNavigation} />
      </NavigationContainer>
    );

    expect(getByText('Rodistaa')).toBeTruthy();
    expect(getByPlaceholderText('Enter 10-digit mobile number')).toBeTruthy();
  });

  it('validates phone number before requesting OTP', async () => {
    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
        <LoginScreen navigation={mockNavigation} />
      </NavigationContainer>
    );

    const phoneInput = getByPlaceholderText('Enter 10-digit mobile number');
    const requestButton = getByText('Request OTP');

    // Enter invalid phone
    fireEvent.changeText(phoneInput, '123');
    fireEvent.press(requestButton);

    await waitFor(() => {
      expect(getByText(/valid 10-digit/i)).toBeTruthy();
    });
  });

  it('navigates to OTP step after valid phone submission', async () => {
    const { apiClient } = require('../../api/client');
    apiClient.post.mockResolvedValue({ success: true });

    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
        <LoginScreen navigation={mockNavigation} />
      </NavigationContainer>
    );

    const phoneInput = getByPlaceholderText('Enter 10-digit mobile number');
    const requestButton = getByText('Request OTP');

    fireEvent.changeText(phoneInput, '9876543210');
    fireEvent.press(requestButton);

    await waitFor(() => {
      expect(getByPlaceholderText('000000')).toBeTruthy();
    });
  });
});

