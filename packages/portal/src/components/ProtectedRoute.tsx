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

  useEffect(() => {
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
  }, [isAuthenticated, user, router, allowedRoles]);

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

