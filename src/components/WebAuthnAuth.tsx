import { useState } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface WebAuthnAuthProps {
  userId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function WebAuthnAuth({ userId, onSuccess, onError }: WebAuthnAuthProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRegistration = async () => {
    try {
      setIsLoading(true);

      // Get registration options from the server
      const optionsResponse = await fetch('/api/auth/webauthn/register-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!optionsResponse.ok) {
        throw new Error('Failed to get registration options');
      }

      const options = await optionsResponse.json();

      // Start the registration process in the browser
      const attResp = await startRegistration(options);

      // Verify the registration with the server
      const verificationResponse = await fetch('/api/auth/webauthn/verify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          response: attResp,
        }),
      });

      if (!verificationResponse.ok) {
        throw new Error('Failed to verify registration');
      }

      const verification = await verificationResponse.json();

      if (verification.verified) {
        toast.success('Successfully registered WebAuthn authenticator');
        onSuccess?.();
      } else {
        throw new Error('Registration verification failed');
      }
    } catch (error) {
      console.error('WebAuthn registration error:', error);
      toast.error('Failed to register: ' + (error as Error).message);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthentication = async () => {
    try {
      setIsLoading(true);

      // Get authentication options from the server
      const optionsResponse = await fetch('/api/auth/webauthn/auth-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!optionsResponse.ok) {
        throw new Error('Failed to get authentication options');
      }

      const options = await optionsResponse.json();

      // Start the authentication process in the browser
      const attResp = await startAuthentication(options);

      // Verify the authentication with the server
      const verificationResponse = await fetch('/api/auth/webauthn/verify-authentication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          response: attResp,
        }),
      });

      if (!verificationResponse.ok) {
        throw new Error('Failed to verify authentication');
      }

      const verification = await verificationResponse.json();

      if (verification.verified) {
        toast.success('Successfully authenticated with WebAuthn');
        onSuccess?.();
      } else {
        throw new Error('Authentication verification failed');
      }
    } catch (error) {
      console.error('WebAuthn authentication error:', error);
      toast.error('Failed to authenticate: ' + (error as Error).message);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Biometric Authentication</CardTitle>
        <CardDescription>
          Use your device's biometric authentication (fingerprint, face recognition, etc.)
          or security key to sign in securely.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button
          onClick={handleRegistration}
          disabled={isLoading}
          variant="outline"
          className="w-full"
        >
          {isLoading ? 'Registering...' : 'Register Device'}
        </Button>
        <Button
          onClick={handleAuthentication}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Authenticating...' : 'Authenticate with Device'}
        </Button>
      </CardContent>
    </Card>
  );
} 