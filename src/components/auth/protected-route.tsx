'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/contexts/clerk-auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
}

/**
 * ProtectedRoute Component
 * 
 * This component protects routes based on user authentication state and roles.
 * 
 * @param children - The content to render if the user is authenticated and has the required role
 * @param requiredRole - The role required to access this route (optional)
 * @param redirectTo - The path to redirect to if the user is not authenticated (defaults to /auth/login)
 */
export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, loading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until authentication is checked
    if (!loading) {
      if (!isAuthenticated) {
        // Add the current path to the redirect query parameter
        router.push(`${redirectTo}?redirectTo=${window.location.pathname}`);
      } else if (requiredRole && !hasRole(requiredRole)) {
        // If the user doesn't have the required role, redirect to unauthorized page
        router.push('/error/unauthorized');
      }
    }
  }, [isAuthenticated, loading, hasRole, requiredRole, redirectTo, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Show nothing while redirecting (avoid flash of content)
  if (!isAuthenticated || (requiredRole && !hasRole(requiredRole))) {
    return null;
  }

  // If authenticated and role check passes, render the children
  return <>{children}</>;
} 