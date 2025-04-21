/**
 * @deprecated This module is deprecated. Use the unified auth context from '@/contexts/unified-auth-context' instead.
 * This is a compatibility layer that forwards to the unified auth context.
 */

import React, { createContext, useContext } from 'react';
import {
  AuthContextType as UnifiedAuthContextType,
  AuthProvider as UnifiedAuthProvider,
  useAuth as useUnifiedAuth
} from '../../src/contexts/unified-auth-context';

// Re-export the unified auth context type
export type AuthContextType = UnifiedAuthContextType;

// Create a compatibility context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a compatibility provider that uses the unified auth provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.warn(
    'Warning: The AuthProvider from mobile/src/contexts/AuthContext is deprecated. ' +
    'Use the AuthProvider from @/contexts/unified-auth-context instead.'
  );
  
  return <UnifiedAuthProvider>{children}</UnifiedAuthProvider>;
};

// Create a compatibility hook that uses the unified auth hook
export const useAuth = (): AuthContextType => {
  console.warn(
    'Warning: The useAuth hook from mobile/src/contexts/AuthContext is deprecated. ' +
    'Use the useAuth hook from @/contexts/unified-auth-context instead.'
  );
  
  return useUnifiedAuth();
};

export default AuthContext; 