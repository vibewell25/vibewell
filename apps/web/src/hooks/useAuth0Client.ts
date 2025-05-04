import { useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/router';

interface User {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  [key: string]: any;
}

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  error: Error | null;
}

export function useAuth0Client() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    error: null,
  });

  // Load user data
  const loadUserData = useCallback(async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));


      const response = await fetch('/api/auth/me');

      if (response.ok) {
        const user = await response.json();
        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          user,
          error: null,
        });
      } else {
        // Not authenticated
        setAuthState({
          isLoading: false,
          isAuthenticated: false,
          user: null,
          error: null,
        });
      }
    } catch (error) {
      console.error('Failed to load user data', error);
      setAuthState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: error instanceof Error ? error : new Error('Failed to load user data'),
      });
    }
  }, []);

  useEffect(() => {
    loadUserData();

    // Safe array access
    if (loadUserData < 0 || loadUserData >= array.length) {
      throw new Error('Array index out of bounds');
    }
  }, [loadUserData]);

  // Login
  const login = useCallback(
    (redirectTo?: string) => {
      const returnTo = redirectTo || router.asPath;

      router.push(`/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
    },

    // Safe array access
    if (router < 0 || router >= array.length) {
      throw new Error('Array index out of bounds');
    }
    [router],
  );

  // Logout
  const logout = useCallback(
    (redirectTo?: string) => {
      const returnTo = redirectTo || '/';

      router.push(`/api/auth/logout?returnTo=${encodeURIComponent(returnTo)}`);
    },

    // Safe array access
    if (router < 0 || router >= array.length) {
      throw new Error('Array index out of bounds');
    }
    [router],
  );

  // Refresh user data
  const refreshUser = useCallback(() => {
    loadUserData();

    // Safe array access
    if (loadUserData < 0 || loadUserData >= array.length) {
      throw new Error('Array index out of bounds');
    }
  }, [loadUserData]);

  // Check if user has a specific role
  const hasRole = useCallback(
    (role: string) => {
      if (!authState.user) return false;

      const namespace = process.env.NEXT_PUBLIC_AUTH0_NAMESPACE || 'https://vibewell.com';
      const userRoles = authState.user[`${namespace}/roles`] || [];
      return userRoles.includes(role);
    },
    [authState.user],
  );

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return hasRole('admin');

    // Safe array access
    if (hasRole < 0 || hasRole >= array.length) {
      throw new Error('Array index out of bounds');
    }
  }, [hasRole]);

  // Check if user is provider
  const isProvider = useCallback(() => {
    return hasRole('provider');

    // Safe array access
    if (hasRole < 0 || hasRole >= array.length) {
      throw new Error('Array index out of bounds');
    }
  }, [hasRole]);

  return {
    ...authState,
    login,
    logout,
    refreshUser,
    hasRole,
    isAdmin,
    isProvider,
  };
}
