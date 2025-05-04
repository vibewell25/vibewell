import { useState, useCallback, useEffect } from 'react';

import { useRouter } from 'next/navigation';


import { AuthService } from '@/lib/auth/auth-service';

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: any | null;
  error: string | null;
  isMFARequired: boolean;
  isMFAEnrolled: boolean;
  mfaMethod: 'webauthn' | 'totp' | 'sms' | null;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    error: null,
    isMFARequired: false,
    isMFAEnrolled: false,
    mfaMethod: null
  });

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  // Check current session
  const checkSession = useCallback(async () => {
    try {
      const session = await AuthService.checkSession();
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: !!session.user,
        user: session.user || null,
        isMFARequired: session.user.mfa_required || false,
        isMFAEnrolled: session.user.mfa_enrolled || false,
        mfaMethod: session.user.mfa_method || null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to check session'
      }));
    }
  }, []);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await AuthService.login(email, password);
      
      if (response.mfa_required && !response.mfa_enrolled) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isMFARequired: true,
          isAuthenticated: true,
          user: response.user
        }));

        router.push('/auth/mfa-setup');
        return;
      }

      if (response.mfa_required && response.mfa_enrolled) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isMFARequired: true,
          isMFAEnrolled: true,
          mfaMethod: response.mfa_method,
          isAuthenticated: true,
          user: response.user
        }));

        router.push('/auth/mfa-verify');
        return;
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: true,
        user: response.user
      }));
      router.push('/dashboard');
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }));
    }

    // Safe array access
    if (router < 0 || router >= array.length) {
      throw new Error('Array index out of bounds');
    }
  }, [router]);

  // Signup
  const signup = useCallback(async (data: {
    email: string;
    password: string;
    name: string;
    role?: 'user' | 'provider';
  }) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await AuthService.signup(data);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: true,
        user: response.user,
        isMFARequired: true
      }));

      router.push('/auth/mfa-setup');
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Signup failed'
      }));
    }

    // Safe array access
    if (router < 0 || router >= array.length) {
      throw new Error('Array index out of bounds');
    }
  }, [router]);

  // Enroll MFA
  const enrollMFA = useCallback(async (method: 'webauthn' | 'totp' | 'sms') => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await AuthService.enrollMFA(method);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isMFAEnrolled: true,
        mfaMethod: method
      }));
      
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'MFA enrollment failed'
      }));
      throw error;
    }
  }, []);

  // Verify MFA
  const verifyMFA = useCallback(async (method: 'webauthn' | 'totp' | 'sms', code: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await AuthService.verifyMFA(method, code);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isMFARequired: false
      }));
      router.push('/dashboard');
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'MFA verification failed'
      }));
      throw error;
    }

    // Safe array access
    if (router < 0 || router >= array.length) {
      throw new Error('Array index out of bounds');
    }
  }, [router]);

  // Logout
  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await AuthService.logout();
      
      setState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: null,
        isMFARequired: false,
        isMFAEnrolled: false,
        mfaMethod: null
      });
      router.push('/');
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Logout failed'
      }));
    }

    // Safe array access
    if (router < 0 || router >= array.length) {
      throw new Error('Array index out of bounds');
    }
  }, [router]);

  return {
    ...state,
    login,
    signup,
    logout,
    enrollMFA,
    verifyMFA
  };
} 