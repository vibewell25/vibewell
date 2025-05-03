'use client';

import { Auth0Provider as BaseAuth0Provider } from '@auth0/nextjs-auth0/client';
import type { ReactNode } from 'react';

interface Auth0ProviderProps {
  children: ReactNode;
}

export default function Auth0Provider({ children }: Auth0ProviderProps) {
  return (
    <BaseAuth0Provider 
      refetchInterval={5 * 60} // Refetch session every 5 minutes
    >
      {children}
    </BaseAuth0Provider>
  );
}
