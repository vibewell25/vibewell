import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-unified-auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
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
: ProtectedRouteProps) {
  const { isAuthenticated, loading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until authentication is checked
    if (!loading) {
      if (!isAuthenticated) {
        // Add the current path to the redirect query parameter
        router.push(`${redirectTo}?redirectTo=${window.location.pathname}`);
else if (requiredRole && !hasRole(requiredRole)) {
        // If the user doesn't have the required role, redirect to unauthorized page
        router.push('/error/unauthorized');
[isAuthenticated, loading, hasRole, requiredRole, redirectTo, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2 border-t-2"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
// Show nothing while redirecting (avoid flash of content)
  if (!isAuthenticated || (requiredRole && !hasRole(requiredRole))) {
    return null;
// If authenticated and role check passes, render the children
  return <>{children}</>;
