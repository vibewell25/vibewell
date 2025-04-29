import { useUser } from '@auth0/nextjs-auth0/client';

interface UseAuthReturn {
  user: {
    email?: string;
    name?: string;
    picture?: string;
    roles?: string[];
    isAdmin?: boolean;
    isProvider?: boolean;
    isUser?: boolean;
  } | null;
  isLoading: boolean;
  error?: Error;
  hasRole: (role: string) => boolean;
}

/**
 * Custom hook to handle Auth0 authentication and role-based access control
 */
export function useAuth(): UseAuthReturn {
  const { user, isLoading, error } = useUser();

  const hasRole = (role: string): boolean => {
    if (!user?.roles) return false;
    return user.roles.includes(role);
  };

  return {
    user,
    isLoading,
    error,
    hasRole,
  };
} 