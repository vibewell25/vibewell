'use client';

import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  name?: string;
  email: string;
  role?: 'user' | 'admin' | 'provider';
  avatar?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const fetchUser = useCallback(async () => {
    try {
      // This would be a real API call in production
      // For now we'll just simulate a fetch delay
      setState(prev => ({ ...prev, loading: true }));
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if we have user data in localStorage (or use your auth provider)
      const userData = localStorage.getItem('auth_user');
      
      if (userData) {
        const user = JSON.parse(userData);
        setState({
          user,
          loading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      setState({
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Authentication error',
      });
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // This is a placeholder. In a real app, you'd validate with your backend
      if (email === 'admin@vibewell.com' && password === 'admin123') {
        const user = {
          id: '1',
          name: 'Admin User',
          email: 'admin@vibewell.com',
          role: 'admin' as const,
          avatar: '/images/avatars/admin.png',
        };
        
        localStorage.setItem('auth_user', JSON.stringify(user));
        setState({
          user,
          loading: false,
          error: null,
        });
        
        return { success: true };
      }
      
      setState({
        user: null,
        loading: false,
        error: 'Invalid credentials',
      });
      
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setState({
        user: null,
        loading: false,
        error: errorMessage,
      });
      
      return { success: false, error: errorMessage };
    }
  }, []);

  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    localStorage.removeItem('auth_user');
    setState({
      user: null,
      loading: false,
      error: null,
    });
    
    return { success: true };
  }, []);

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.user,
    isAdmin: state.user?.role === 'admin',
    isProvider: state.user?.role === 'provider',
    signIn,
    signOut,
    refreshUser: fetchUser,
  };
}

export default useAuth; 