import { z } from 'zod';

// Password validation schema
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Email validation schema
const emailSchema = z.string().email('Invalid email format');

// Login validation schema
const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6)
});

// Signup validation schema
const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['user', 'provider']).default('user')
});

// Token refresh state
let refreshPromise: Promise<any> | null = null;
let isRefreshing = false;

export class AuthService {
  /**
   * Validates and processes login request
   */
  static async login(email: string, password: string) {
    try {
      // Validate input
      const validatedData = loginSchema.parse({ email, password });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
        credentials: 'include' // Important for cookie handling
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(error.errors[0].message || 'Invalid input');
      }
      throw error;
    }
  }

  /**
   * Validates and processes signup request
   */
  static async signup(data: {
    email: string;
    password: string;
    name: string;
    role?: 'user' | 'provider';
  }) {
    try {
      // Validate input
      const validatedData = signupSchema.parse(data);

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(error.errors[0].message || 'Invalid input');
      }
      throw error;
    }
  }

  /**
   * Initiates MFA enrollment process
   */
  static async enrollMFA(method: 'webauthn' | 'totp' | 'sms') {
    try {
      const response = await this.fetchWithRefresh('/api/auth/mfa/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method }),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'MFA enrollment failed');
      }

      return await response.json();
    } catch (error) {
      console.error('MFA enrollment error:', error);
      throw error;
    }
  }

  /**
   * Verifies MFA challenge
   */
  static async verifyMFA(method: 'webauthn' | 'totp' | 'sms', code: string) {
    try {
      const response = await this.fetchWithRefresh('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, code }),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'MFA verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('MFA verification error:', error);
      throw error;
    }
  }

  /**
   * Logs out the current user
   */
  static async logout() {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Logout failed');
      }

      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Checks if the current session is valid
   */
  static async checkSession() {
    try {
      const response = await this.fetchWithRefresh('/api/auth/session', {
        credentials: 'include'
      });

      if (!response.ok) {
        return { user: null };
      }

      return await response.json();
    } catch (error) {
      console.error('Session check failed:', error);
      return { user: null };
    }
  }

  /**
   * Refreshes the current session
   */
  static async refreshSession() {
    // If already refreshing, return the current promise
    if (isRefreshing && refreshPromise) {
      return refreshPromise;
    }

    try {
      isRefreshing = true;
      refreshPromise = fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to refresh session');
        }
        return response.json();
      });

      return await refreshPromise;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  }

  /**
   * Fetch with automatic token refresh if needed
   */
  static async fetchWithRefresh(url: string, options?: RequestInit) {
    // First attempt
    let response = await fetch(url, options);

    // If unauthorized, try to refresh token and retry
    if (response.status === 401) {
      try {
        await this.refreshSession();
        
        // Retry with fresh token
        response = await fetch(url, options);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Continue with original 401 response
      }
    }

    return response;
  }
}
