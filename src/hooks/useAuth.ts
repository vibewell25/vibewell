'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, Session, AuthState } from '@/types/auth';
import { authService } from '@/services/auth/authService';

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
  });
  const router = useRouter();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const user = await authService.getCurrentUser();
        setState({ user, loading: false });
      } catch (error) {
        setState({ user: null, loading: false });
      }
    };

    checkAuthStatus();
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      setState((prev) => ({ ...prev, loading: true }));
      try {
        const { user, session } = await authService.signUp(email, password, name);
        setState({ user, loading: false });
        return { success: true, data: { user, session }, error: null };
      } catch (error) {
        setState((prev) => ({ ...prev, loading: false }));
        return { 
          success: false, 
          data: null, 
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },
    []
  );

  const signIn = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const { user, session } = await authService.signIn(email, password);
      setState({ user, loading: false });
      return { success: true, data: { user, session }, error: null };
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }));
      return { 
        success: false, 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    return signIn(email, password);
  }, [signIn]);

  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      await authService.signOut();
      setState({ user: null, loading: false });
      return { success: true };
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }));
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await authService.resetPassword(email);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, []);

  return {
    user: state.user,
    loading: state.loading,
    signUp,
    signIn,
    login,
    signOut,
    resetPassword,
  };
}; 