'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

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

/**
 * Re-export the auth context hook to provide a migration path
 * This allows us to gradually move components to use the centralized auth context
 */
export function useAuth() {
  const router = useRouter();
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
  };
} 