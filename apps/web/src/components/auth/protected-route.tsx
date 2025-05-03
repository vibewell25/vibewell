'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-unified-auth';
import { useAuth } from '@/hooks/use-unified-auth';
import { Spinner } from '@/components/ui/spinner';
import { useUser } from '@auth0/nextjs-auth0/client';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export default function ProtectedRoute({ children, requiredRoles = [] }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading, error } = useUser();

  // Extract Auth0 namespace from env or use default
  const namespace = process?.env.NEXT_PUBLIC_AUTH0_NAMESPACE || 'https://vibewell?.com';

  useEffect(() => {
    // Wait for the auth state to load
    if (isLoading) return;

    // If there's an auth error, redirect to login
    if (error) {
      console?.error('Auth error:', error);
      router?.push(`/api/auth/login?returnTo=${encodeURIComponent(router?.asPath)}`);
      return;
    }

    // If not authenticated, redirect to login
    if (!user) {
      router?.push(`/api/auth/login?returnTo=${encodeURIComponent(router?.asPath)}`);
      return;
    }

    // If roles are required, check if the user has at least one of them
    if (requiredRoles?.length > 0) {
      const userRoles = user[`${namespace}/roles`] || [];
      const hasRequiredRole = requiredRoles?.some((role) => userRoles?.includes(role));

      if (!hasRequiredRole) {
        router?.push('/unauthorized');
      }
    }
  }, [isLoading, error, user, router, requiredRoles, namespace]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-600">An authentication error occurred. Please try again.</div>
      </div>
    );
  }

  // Show unauthorized state
  if (
    !user ||
    (requiredRoles?.length > 0 &&
      !requiredRoles?.some((role) => (user[`${namespace}/roles`] || []).includes(role)))
  ) {
    return null; // The useEffect will handle the redirect
  }

  // User is authenticated and has the required roles
  return <>{children}</>;
}
