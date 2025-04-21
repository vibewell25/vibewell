'use client';

/**
 * @deprecated This file is deprecated. Use the standardized hook from 'src/hooks/use-unified-auth.ts' instead.
 *
 * Example:
 * ```
 * import { useAuth } from '@/hooks/use-unified-auth';
 * ```
 *
 * This file will be removed in a future release.
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useAuth as useUnifiedAuth } from './use-unified-auth';

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
 *
 * @deprecated Use useAuth from './use-unified-auth.ts' instead.
 */
export function useAuth() {
  console.warn(
    '[DEPRECATED] useAuth from src/hooks/useAuth.ts is deprecated. ' +
      'Please migrate to useAuth from src/hooks/use-unified-auth.ts'
  );

  return useUnifiedAuth();
}
