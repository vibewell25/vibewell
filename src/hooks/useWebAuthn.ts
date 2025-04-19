import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { useState } from 'react';

interface WebAuthnHookReturn {
  error: string | null;
  loading: boolean;
  register: (userId: string, username: string) => Promise<boolean>;
  authenticate: (userId: string) => Promise<boolean>;
}

export function useWebAuthn(): WebAuthnHookReturn {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const register = async (userId: string, username: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Get registration options from server
      const optionsResponse = await fetch('/api/auth/webauthn/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, username }),
      });

      const options = await optionsResponse.json();

      if (!optionsResponse.ok) {
        throw new Error(options.error || 'Failed to get registration options');
      }

      // Create credentials
      const credential = await startRegistration(options);

      // Verify with server
      const verificationResponse = await fetch('/api/auth/webauthn/register/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, credential }),
      });

      const verification = await verificationResponse.json();

      if (!verificationResponse.ok) {
        throw new Error(verification.error || 'Failed to verify registration');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const authenticate = async (userId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Get authentication options from server
      const optionsResponse = await fetch('/api/auth/webauthn/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const options = await optionsResponse.json();

      if (!optionsResponse.ok) {
        throw new Error(options.error || 'Failed to get authentication options');
      }

      // Create assertion
      const credential = await startAuthentication(options);

      // Verify with server
      const verificationResponse = await fetch('/api/auth/webauthn/authenticate/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, credential }),
      });

      const verification = await verificationResponse.json();

      if (!verificationResponse.ok) {
        throw new Error(verification.error || 'Failed to verify authentication');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    error,
    loading,
    register,
    authenticate,
  };
} 