'use client';

/**
 * @deprecated This module is deprecated. Use the unified auth context from '@/contexts/unified-auth-context' instead.
 * Authentication Context
 *
 * This is a backwards compatibility wrapper that forwards to the unified auth context.
 * It will be removed in a future version.
 */
import React, { ReactNode } from 'react';
import {
  AuthProvider as UnifiedAuthProvider,
  useAuth as useUnifiedAuth,
  AuthContextType as UnifiedAuthContextType,
} from '../contexts/unified-auth-context';
import { User, Session } from '@supabase/supabase-js';

// Define the shape of our authentication context (smaller subset of unified context)
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

// Props for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that wraps the application and provides authentication state
 * This is now a wrapper around the unified auth provider
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Show deprecation warning in development
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'Warning: The AuthProvider from @/context/AuthContext is deprecated. ' +
        'Use the AuthProvider from @/contexts/unified-auth-context instead.'
    );
  }

  return <UnifiedAuthProvider>{children}</UnifiedAuthProvider>;
};

/**
 * Custom hook to use the auth context
 * This is now a wrapper around the unified auth hook
 */
export const useAuth = (): AuthContextType => {
  // Show deprecation warning in development
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'Warning: The useAuth hook from @/context/AuthContext is deprecated. ' +
        'Use the useAuth hook from @/contexts/unified-auth-context instead.'
    );
  }

  // Use the unified auth hook but only return the properties expected in the old interface
  const unifiedAuth = useUnifiedAuth();

  // Extract only the properties and methods defined in the old interface
  const { session, loading, signIn, signUp, signOut, resetPassword } = unifiedAuth;

  // Handle the user type by safely asserting the type when it's a Supabase User
  const user =
    unifiedAuth.user && 'app_metadata' in unifiedAuth.user ? (unifiedAuth.user as User) : null;

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
};
