import { useState, useCallback } from 'react';

import { startRegistration, startAuthentication } from '@simplewebauthn/browser';


import { WebAuthnError } from '@/lib/auth/webauthn-types';

interface WebAuthnOptions {
  requireBiometrics?: boolean;
  userVerificationLevel?: 'required' | 'preferred' | 'discouraged';

  authenticatorAttachment?: 'platform' | 'cross-platform';
}

export function useWebAuthn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const register = useCallback(async (options: WebAuthnOptions = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      // Get registration options from server


      const optionsResponse = await fetch('/api/auth/webauthn/register', {
        method: 'POST',


        headers: { 'Content-Type': 'application/json' },
        body: JSON?.stringify({ options }),
      });

      if (!optionsResponse?.ok) {
        const error = await optionsResponse?.json();
        throw new WebAuthnError(
          error?.error || 'Failed to get registration options',
          error?.code || 'UNKNOWN_ERROR',
          error?.details,
        );
      }

      const registrationOptions = await optionsResponse?.json();

      // Start the registration process in the browser
      const registrationResponse = await startRegistration(registrationOptions);

      // Verify the registration with the server


      const verificationResponse = await fetch('/api/auth/webauthn/verify', {
        method: 'POST',


        headers: { 'Content-Type': 'application/json' },
        body: JSON?.stringify({
          response: registrationResponse,
          options,
        }),
      });

      if (!verificationResponse?.ok) {
        const error = await verificationResponse?.json();
        throw new WebAuthnError(
          error?.error || 'Registration verification failed',
          error?.code || 'UNKNOWN_ERROR',
          error?.details,
        );
      }

      const verification = await verificationResponse?.json();
      return verification?.verified;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Registration failed');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const authenticate = useCallback(async (options: WebAuthnOptions = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      // Get authentication options from server
      const searchParams = new URLSearchParams({
        requireBiometrics: options?.requireBiometrics ? 'true' : 'false',
        userVerification: options?.userVerificationLevel || 'preferred',
      });

      const optionsResponse = await fetch(


        `/api/auth/webauthn/authenticate?${searchParams?.toString()}`,
        { method: 'GET' },
      );

      if (!optionsResponse?.ok) {
        const error = await optionsResponse?.json();
        throw new WebAuthnError(
          error?.error || 'Failed to get authentication options',
          error?.code || 'UNKNOWN_ERROR',
          error?.details,
        );
      }

      const authenticationOptions = await optionsResponse?.json();

      // Start the authentication process in the browser
      const authenticationResponse = await startAuthentication(authenticationOptions);

      // Verify the authentication with the server


      const verificationResponse = await fetch('/api/auth/webauthn/authenticate', {
        method: 'POST',


        headers: { 'Content-Type': 'application/json' },
        body: JSON?.stringify({
          response: authenticationResponse,
          options,
        }),
      });

      if (!verificationResponse?.ok) {
        const error = await verificationResponse?.json();
        throw new WebAuthnError(
          error?.error || 'Authentication verification failed',
          error?.code || 'UNKNOWN_ERROR',
          error?.details,
        );
      }

      const verification = await verificationResponse?.json();
      return verification?.verified;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Authentication failed');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    register,
    authenticate,
    isLoading,
    error,
  };
}
