/**
 * ProtectedRoute Component Tests
 */

import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from '../ProtectedRoute';
import '@testing-library/jest-dom';

// Mock useAuth hook
jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock useRouter
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('ProtectedRoute', () => {
  it('should render children when authenticated', () => {
    const { useAuth } = require('../../hooks/useAuth');
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', role: 'ADMIN' },
      checkAuth: () => true,
      hasRole: () => true,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should show loading when checking auth', () => {
    const { useAuth } = require('../../hooks/useAuth');
    useAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      checkAuth: () => false,
      hasRole: () => false,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Should show loading spinner, not content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', () => {
    const mockPush = jest.fn();
    const { useRouter } = require('next/router');
    useRouter.mockReturnValue({ push: mockPush });

    const { useAuth } = require('../../hooks/useAuth');
    useAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      checkAuth: () => false,
      hasRole: () => false,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('should enforce role-based access', () => {
    const mockPush = jest.fn();
    const { useRouter } = require('next/router');
    useRouter.mockReturnValue({ push: mockPush });

    const { useAuth } = require('../../hooks/useAuth');
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', role: 'SUPPORT' },
      checkAuth: () => true,
      hasRole: (roles: string[]) => !roles.includes('SUPPORT'),
    });

    render(
      <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
        <div>Admin Only Content</div>
      </ProtectedRoute>
    );

    expect(mockPush).toHaveBeenCalledWith('/unauthorized');
  });
});

