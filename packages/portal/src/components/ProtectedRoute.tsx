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

  // DEV MODE: Bypass auth for demo/testing
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (isDev) {
      // In development, allow access without authentication
      return;
    }

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
  }, [isAuthenticated, user, router, allowedRoles, isDev]);

  // In dev mode, render directly
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

