import { UserProvider } from '@auth0/nextjs-auth0/client';
import type { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
/**
 * Auth0 provider component that wraps the application
 * Provides authentication context to all child components
 */
export function AuthProvider({ children }: AuthProviderProps) {
  return <UserProvider>{children}</UserProvider>;
