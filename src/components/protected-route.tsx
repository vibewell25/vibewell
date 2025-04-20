'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
};

export function ProtectedRoute({ children, requiredRole, redirectTo = '/auth/login' }: ProtectedRouteProps) {
  const { user, loading, hasRole, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push(redirectTo);
      } else if (requiredRole && !hasRole(requiredRole)) {
        router.push('/error/unauthorized');
      }
    }
  }, [user, loading, router, requiredRole, redirectTo, isAuthenticated, hasRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return null;
  }

  return <>{children}</>;
} 