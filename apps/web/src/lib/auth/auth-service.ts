import { z } from 'zod';

import { auth0 } from '@/lib/auth0';

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


    const response = await fetch('/api/auth/mfa/enroll', {
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
  }

  /**
   * Verifies MFA challenge
   */
  static async verifyMFA(method: 'webauthn' | 'totp' | 'sms', code: string) {


    const response = await fetch('/api/auth/mfa/verify', {
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
  }

  /**
   * Logs out the current user
   */
  static async logout() {

    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Logout failed');
    }

    return true;
  }

  /**
   * Checks if the current session is valid
   */
  static async checkSession() {

    const response = await fetch('/api/auth/session', {
      credentials: 'include'
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  }

  /**
   * Refreshes the current session
   */
  static async refreshSession() {

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to refresh session');
    }

    return await response.json();
  }
} 