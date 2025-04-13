'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '@/services/auth/authService';

/**
 * User interface representing an authenticated user
 */
export interface User {
  id: string;
  name?: string;
  email: string;
  role?: 'user' | 'admin' | 'provider';
  avatar?: string;
}

/**
 * Authentication state interface
 */
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

/**
 * Response interface for auth operations
 */
export interface AuthResponse<T = any> {
  success: boolean;
  data?: T | null;
  error?: string | null;
}

/**
 * Unified authentication hook that provides authentication functionalities
 */
export function useUnifiedAuth() {
  // Auth state
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Track initialization
  const initialized = useRef(false);

  /**
   * Fetch current user data
   */
  const fetchUser = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const user = await authService.getCurrentUser();
      
      setState({
        user,
        loading: false,
        error: null,
      });
      
      return user;
    } catch (error) {
      setState({
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Authentication error',
      });
      
      return null;
    }
  }, []);

  // Check auth status on mount
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      fetchUser();
    }
  }, [fetchUser]);

  /**
   * Sign up a new user
   */
  const signUp = useCallback(async (email: string, password: string, name: string): Promise<AuthResponse> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { user, session } = await authService.signUp(email, password, name);
      
      setState({
        user,
        loading: false,
        error: null,
      });
      
      return { 
        success: true, 
        data: { user, session }
      };
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Sign up failed'
      }));
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign up failed'
      };
    }
  }, []);

  /**
   * Sign in an existing user
   */
  const signIn = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { user, session } = await authService.signIn(email, password);
      
      setState({
        user,
        loading: false,
        error: null,
      });
      
      return { 
        success: true, 
        data: { user, session }
      };
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Sign in failed'
      }));
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign in failed'
      };
    }
  }, []);

  /**
   * Sign out the current user
   */
  const signOut = useCallback(async (): Promise<AuthResponse> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await authService.signOut();
      
      setState({
        user: null,
        loading: false,
        error: null,
      });
      
      return { success: true };
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Sign out failed'
      }));
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign out failed'
      };
    }
  }, []);

  /**
   * Reset user's password
   */
  const resetPassword = useCallback(async (email: string): Promise<AuthResponse> => {
    try {
      await authService.resetPassword(email);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Password reset failed'
      };
    }
  }, []);

  /**
   * Update user profile
   * Note: This is a client-side implementation since authService doesn't have updateProfile
   */
  const updateProfile = useCallback(async (updates: Partial<User>): Promise<AuthResponse> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Get the current user data
      const currentUser = await authService.getCurrentUser();
      
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }
      
      // Create updated user by combining current user with updates
      const updatedUser = {
        ...currentUser,
        ...updates
      };
      
      // In a real implementation, you would call an API here
      // For now, just update the local storage
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      
      setState({
        user: updatedUser,
        loading: false,
        error: null,
      });
      
      return { 
        success: true, 
        data: { user: updatedUser }
      };
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Profile update failed'
      }));
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Profile update failed'
      };
    }
  }, []);

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback((role: string | string[]): boolean => {
    if (!state.user || !state.user.role) return false;
    
    if (Array.isArray(role)) {
      return role.includes(state.user.role);
    }
    
    return state.user.role === role;
  }, [state.user]);

  return {
    // State
    user: state.user,
    loading: state.loading,
    error: state.error,
    
    // Derived state
    isAuthenticated: !!state.user,
    isAdmin: state.user?.role === 'admin',
    isProvider: state.user?.role === 'provider',
    
    // Auth methods
    signUp,
    signIn,
    login: signIn, // Alias for signIn
    signOut,
    logout: signOut, // Alias for signOut
    resetPassword,
    updateProfile,
    refreshUser: fetchUser,
    
    // Helper methods
    hasRole,
  };
}

export default useUnifiedAuth; 