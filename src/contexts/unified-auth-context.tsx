'use client';

/**
 * Unified Authentication Context
 * 
 * Provides authentication state and methods for the entire application.
 * Consolidates functionality from previous separate auth implementations.
 * Supports both web (Supabase) and mobile authentication.
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { User, Session } from '@supabase/supabase-js';
import { useErrorHandler } from '@/utils/error-handler';
import { ErrorCategory, ErrorSource } from '@/utils/error-handler';
import { isError } from '@/utils/type-guards';
import { rateLimit, RateLimitError } from '../utils/rateLimit';
import { logger } from '../utils/logger';
import { sessionManager } from '../utils/sessionManager';

// Define user roles for role-based access control
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  PREMIUM = 'premium',
}

// Define the mobile user interface if available
export interface MobileUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Define the shape of our unified authentication context
export interface AuthContextType {
  // User state
  user: User | MobileUser | null;
  session: Session | null;
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
  
  // Email verification
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  
  // Role-based access control
  hasRole: (role: UserRole) => boolean;
  isAdmin: () => boolean;
  
  // Profile management
  updateProfile: (data: { name?: string; avatar_url?: string }) => Promise<{ error: Error | null }>;
}

// Create the context with undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Detect platform (web or mobile)
const isMobile = typeof window !== 'undefined' && 
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Props for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that wraps the application and provides authentication state
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | MobileUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.USER);
  const router = useRouter();
  const { captureError } = useErrorHandler();

  const handleError = (error: unknown) => {
    if (error instanceof RateLimitError) {
      logger.warn('Rate limit exceeded', user?.id, { error });
    } else {
      logger.error('Authentication error', user?.id, { error });
    }
    return error instanceof Error ? error : new Error(String(error));
  };

  // Check for existing session and set up auth state listener
  useEffect(() => {
    if (isMobile) {
      // Mobile-specific initialization would go here
      // This is a placeholder for mobile auth initialization
      // setLoading(false);
      return;
    }
    
    // Web authentication with Supabase
    const initializeAuth = async () => {
      setLoading(true);
      
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setSession(session);
          setUser(session.user);
          
          // Determine user role
          if (session.user?.app_metadata?.role) {
            setUserRole(session.user.app_metadata.role as UserRole);
          }
        }
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user?.app_metadata?.role) {
          setUserRole(session.user.app_metadata.role as UserRole);
        } else {
          setUserRole(UserRole.USER);
        }
        
        setLoading(false);
      }
    );

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [captureError]);

  useEffect(() => {
    // Initialize session monitoring
    sessionManager.startSessionMonitoring(
      session,
      // On timeout
      () => {
        signOut();
      },
      // On refresh needed
      async () => {
        try {
          const { data: { session: newSession }, error } = await supabase.auth.refreshSession();
          if (error) throw error;
          if (!newSession) throw new Error('Failed to refresh session');
        } catch (error) {
          handleError(error);
          signOut();
        }
      }
    );

    return () => {
      sessionManager.clearTimeouts();
    };
  }, [session]);

  /**
   * Sign in a user with email and password
   */
  const signIn = async (email: string, password: string) => {
    try {
      // Apply rate limiting
      rateLimit(`signin-${email}`, 5, 15 * 60 * 1000);

      logger.security('Sign in attempt', null, { email });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      logger.security('Sign in successful', data.user?.id);
      return { error: null };
    } catch (error) {
      return { error: handleError(error) };
    }
  };

  /**
   * Sign up a new user with email, password, and name
   */
  const signUp = async (email: string, password: string, name: string) => {
    try {
      if (isMobile) {
        // Mobile-specific sign up would go here
        // This is a placeholder
        return { error: null };
      }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });
      
      if (!error) {
        // Navigate to a success page or email verification page
        router.push('/auth/verify-email');
      }
      
      return { error };
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
      logger.security('Sign out initiated', user?.id);
      await supabase.auth.signOut();
      sessionManager.clearTimeouts();
      logger.security('Sign out successful', user?.id);
    } catch (error) {
      handleError(error);
    }
  };

  /**
   * Send a password reset email
   */
  const resetPassword = async (email: string) => {
    try {
      // Apply rate limiting
      rateLimit(`reset-password-${email}`, 3, 60 * 60 * 1000);

      logger.security('Password reset requested', null, { email });
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: handleError(error) };
    }
  };

  /**
   * Update the user's password with a new one
   */
  const updatePassword = async (password: string) => {
    try {
      if (isMobile) {
        // Mobile-specific password update would go here
        // This is a placeholder
        return { error: null };
      }
      
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      return { error };
    } catch (error) {
      handleError(error);
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  /**
   * Verify email with a token
   */
  const verifyEmail = async (token: string) => {
    try {
      if (isMobile) {
        // Mobile-specific email verification would go here
        // This is a placeholder
        return;
      }
      
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });
      
      if (error) throw error;
    } catch (error) {
      handleError(error);
      throw (error instanceof Error ? error : new Error(String(error)));
    }
  };

  /**
   * Resend verification email to the current user
   */
  const resendVerificationEmail = async () => {
    try {
      if (isMobile) {
        // Mobile-specific resend verification would go here
        // This is a placeholder
        return;
      }
      
      if (!user || !('email' in user) || !user.email) {
        throw new Error('No user email available');
      }
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });
      
      if (error) throw error;
    } catch (error) {
      handleError(error);
      throw (error instanceof Error ? error : new Error(String(error)));
    }
  };

  /**
   * Sign in with Google
   */
  const signInWithGoogle = async () => {
    try {
      if (isMobile) {
        // Mobile-specific Google sign in would go here
        // This is a placeholder
        return;
      }
      
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
    } catch (error) {
      handleError(error);
    }
  };

  /**
   * Sign in with Facebook
   */
  const signInWithFacebook = async () => {
    try {
      if (isMobile) {
        // Mobile-specific Facebook sign in would go here
        // This is a placeholder
        return;
      }
      
      await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
    } catch (error) {
      handleError(error);
    }
  };

  /**
   * Sign in with Apple
   */
  const signInWithApple = async () => {
    try {
      if (isMobile) {
        // Mobile-specific Apple sign in would go here
        // This is a placeholder
        return;
      }
      
      await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
    } catch (error) {
      handleError(error);
    }
  };

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    
    // For Supabase users
    if ('app_metadata' in user && user.app_metadata?.role) {
      return user.app_metadata.role === role;
    }
    
    // For mobile users
    if ('role' in user) {
      return user.role === role;
    }
    
    return false;
  };

  /**
   * Check if user is an admin
   */
  const isAdmin = (): boolean => {
    return hasRole(UserRole.ADMIN);
  };

  /**
   * Update user profile
   */
  const updateProfile = async (data: { name?: string; avatar_url?: string }) => {
    try {
      if (isMobile) {
        // Mobile-specific profile update would go here
        // This is a placeholder
        return { error: null };
      }
      
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: data.name ?? '',
          avatar_url: data.avatar_url ?? '',
        },
      });
      
      return { error };
    } catch (error) {
      handleError(error);
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  // The value that will be provided to consumers of this context
  const value: AuthContextType = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    userRole,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    verifyEmail,
    resendVerificationEmail,
    signInWithGoogle,
    signInWithFacebook,
    signInWithApple,
    hasRole,
    isAdmin,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use the unified auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 