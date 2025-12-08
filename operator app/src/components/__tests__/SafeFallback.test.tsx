/**
 * Unit tests for SafeFallback component
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { SafeFallback } from '../SafeFallback';

describe('SafeFallback', () => {
  it('renders default error message when no error provided', () => {
    render(<SafeFallback />);
    
    expect(screen.getByText('Rodistaa Operator')).toBeTruthy();
    expect(screen.getByText('Initialization Error')).toBeTruthy();
    expect(screen.getByText(/The app failed to start properly/i)).toBeTruthy();
  });

  it('renders error message when error provided', () => {
    const testError = new Error('Test error message');
    render(<SafeFallback error={testError} />);
    
    expect(screen.getByText('Test error message')).toBeTruthy();
  });

  it('renders stack trace when error has stack', () => {
    const testError = new Error('Test error');
    testError.stack = 'Error: Test error\n    at test.js:1:1';
    
    render(<SafeFallback error={testError} />);
    
    expect(screen.getByText(/at test.js:1:1/)).toBeTruthy();
  });

  it('has Send Debug Log button', () => {
    render(<SafeFallback />);
    
    expect(screen.getByText('Send Debug Log')).toBeTruthy();
  });

  it('displays Rodistaa branding', () => {
    render(<SafeFallback />);
    
    expect(screen.getByText('Rodistaa Operator')).toBeTruthy();
  });
});

