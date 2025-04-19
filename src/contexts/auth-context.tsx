'use client';

/**
 * Auth0 Authentication Context
 * 
 * Provides authentication state and methods for the entire application.
 */
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth as useAuth0Auth } from '@auth0/nextjs-auth0/client';
import { useErrorHandler } from '@/utils/error-handler';
import { ErrorCategory, ErrorSource } from '@/utils/error-handler';
import { isError } from '@/utils/type-guards';

// Define user roles for role-based access control
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  PREMIUM = 'premium',
}

// Define the shape of our unified authentication context
export interface AuthContextType {
  // User state
  user: any | null; // Using any for now until we define proper types
  loading: boolean;
  isAuthenticated: boolean;
  userRole: UserRole;
  
  // Authentication methods
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  
  // Password management
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  
  // Social authentication
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  
  // Role-based access control
  hasRole: (role: UserRole) => boolean;
  isAdmin: () => boolean;
  
  // Profile management
  updateProfile: (data: { name?: string; avatar_url?: string }) => Promise<{ error: Error | null }>;
}

// Create the context with undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that wraps the application and provides authentication state
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user: auth0User, error, isLoading } = useUser();
  const { checkSession } = useAuth0Auth();
  const router = useRouter();
  const { captureError } = useErrorHandler();

  // Helper function to safely handle unknown errors
  const handleError = (error: unknown) => {
    if (isError(error)) {
      captureError(error, {
        category: ErrorCategory.AUTHENTICATION,
        source: ErrorSource.CLIENT,
      });
    } else {
      captureError(String(error), {
        category: ErrorCategory.AUTHENTICATION,
        source: ErrorSource.CLIENT,
      });
    }
  };

  // Determine user role from Auth0 metadata
  const getUserRole = (): UserRole => {
    if (!auth0User) return UserRole.USER;
    
    const namespace = process.env.NEXT_PUBLIC_AUTH0_NAMESPACE || 'https://vibewell.com';
    const userRoles = auth0User[`${namespace}/roles`] || [];
    
    if (userRoles.includes('admin')) return UserRole.ADMIN;
    if (userRoles.includes('premium')) return UserRole.PREMIUM;
    
    return UserRole.USER;
  };

  /**
   * Sign in a user with email and password
   */
  const signIn = async (email: string, password: string) => {
    try {
      // Auth0 handles login via redirect, so we'll redirect to the login page
      // The actual authentication happens server-side
      window.location.href = `/api/auth/login?email=${encodeURIComponent(email)}`;
      return { error: null };
    } catch (error) {
      handleError(error);
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  /**
   * Sign up a new user with email, password, and name
   */
  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Auth0 handles signup via redirect
      const params = new URLSearchParams({
        email: email,
        name: name,
        redirect_uri: `${window.location.origin}/api/auth/callback`,
        screen_hint: 'signup'
      });
      
      window.location.href = `/api/auth/login?${params.toString()}`;
      return { error: null };
    } catch (error) {
      handleError(error);
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    try {
      window.location.href = '/api/auth/logout';
    } catch (error) {
      handleError(error);
    }
  };

  /**
   * Send a password reset email
   */
  const resetPassword = async (email: string) => {
    try {
      // Typically, this would call an API endpoint that triggers Auth0's password reset flow
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to request password reset');
      }
      
      return { error: null };
    } catch (error) {
      handleError(error);
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  /**
   * Update the user's password
   */
  const updatePassword = async (password: string) => {
    try {
      // Typically, this would call an API endpoint that updates the password
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update password');
      }
      
      return { error: null };
    } catch (error) {
      handleError(error);
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  /**
   * Sign in with Google
   */
  const signInWithGoogle = async () => {
    try {
      window.location.href = '/api/auth/login?connection=google-oauth2';
    } catch (error) {
      handleError(error);
    }
  };

  /**
   * Sign in with Facebook
   */
  const signInWithFacebook = async () => {
    try {
      window.location.href = '/api/auth/login?connection=facebook';
    } catch (error) {
      handleError(error);
    }
  };

  /**
   * Sign in with Apple
   */
  const signInWithApple = async () => {
    try {
      window.location.href = '/api/auth/login?connection=apple';
    } catch (error) {
      handleError(error);
    }
  };

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: UserRole): boolean => {
    if (!auth0User) return false;
    
    const namespace = process.env.NEXT_PUBLIC_AUTH0_NAMESPACE || 'https://vibewell.com';
    const userRoles = auth0User[`${namespace}/roles`] || [];
    
    if (role === UserRole.ADMIN) return userRoles.includes('admin');
    if (role === UserRole.PREMIUM) return userRoles.includes('premium');
    
    return true; // Everyone has the basic USER role
  };

  /**
   * Check if user is an admin
   */
  const isAdmin = (): boolean => {
    return hasRole(UserRole.ADMIN);
  };

  /**
   * Update user profile information
   */
  const updateProfile = async (data: { name?: string; avatar_url?: string }) => {
    try {
      // Call API to update user profile
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      await checkSession(); // Refresh the session to get updated user data
      
      return { error: null };
    } catch (error) {
      handleError(error);
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  // The value that will be available to consumers of this context
  const authContextValue: AuthContextType = {
    user: auth0User,
    loading: isLoading,
    isAuthenticated: !!auth0User,
    userRole: getUserRole(),
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    signInWithGoogle,
    signInWithFacebook,
    signInWithApple,
    hasRole,
    isAdmin,
    updateProfile,
  };

  // Report any Auth0 errors
  useEffect(() => {
    if (error) {
      captureError(error, {
        category: ErrorCategory.AUTHENTICATION,
        source: ErrorSource.CLIENT,
      });
    }
  }, [error, captureError]);

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use the auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 