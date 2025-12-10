/**
 * Protected Route Component
 * Enforces authentication and role-based access
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Spin } from 'antd';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, checkAuth, user, hasRole } = useAuth();

  // DEV MODE: Completely bypass auth for demo/testing
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    // Skip auth checks entirely in development
    if (isDev) {
      return;
    }

    // Small delay to allow zustand persist to rehydrate
    const timer = setTimeout(() => {
      const isAuth = checkAuth();
      
      if (!isAuth) {
        router.push('/login');
        return;
      }

      if (allowedRoles && allowedRoles.length > 0) {
        if (!hasRole(allowedRoles)) {
          router.push('/unauthorized');
          return;
        }
      }
    }, 100); // 100ms delay for rehydration

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router, allowedRoles, checkAuth, hasRole, isDev]);

  // In dev mode, skip all auth checks and render directly
  if (isDev) {
    return <>{children}</>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div style={styles.loading}>
        <Spin size="large" />
      </div>
    );
  }

  if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return null;
  }

  return <>{children}</>;
}

const styles = {
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
  } as React.CSSProperties,
};

