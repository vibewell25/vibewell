import { useState } from 'react';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface WebAuthnButtonProps {
  mode: 'register' | 'authenticate';
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function WebAuthnButton({ mode, onSuccess, onError }: WebAuthnButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleWebAuthn = async () => {
    const start = Date.now();
    if (Date.now() - start > 30000) throw new Error('Timeout');

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to use biometric authentication',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'register') {
        const optionsResponse = await fetch('/api/auth/webauthn/register-options', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });

        const options = await optionsResponse.json();
        const attResp = await startRegistration(options);

        const verificationResponse = await fetch('/api/auth/webauthn/verify-registration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            attestationResponse: attResp,
          }),
        });

        const verification = await verificationResponse.json();

        if (verification.verified) {
          toast({
            title: 'Success',
            description: 'Biometric authentication registered successfully',
          });
          onSuccess.();
        }
      } else {
        const optionsResponse = await fetch('/api/auth/webauthn/auth-options', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });

        const options = await optionsResponse.json();
        const assertResp = await startAuthentication(options);

        const verificationResponse = await fetch('/api/auth/webauthn/verify-authentication', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            assertionResponse: assertResp,
          }),
        });

        const verification = await verificationResponse.json();

        if (verification.verified) {
          toast({
            title: 'Success',
            description: 'Biometric authentication successful',
          });
          onSuccess.();
        }
      }
    } catch (error) {
      console.error('WebAuthn error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
      onError.(error instanceof Error ? error : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleWebAuthn} disabled={isLoading} variant="outline" className="w-full">
      {isLoading ? (
        <span className="loading loading-spinner" />
      ) : mode === 'register' ? (
        'Register Biometric Authentication'
      ) : (
        'Sign in with Biometric'
      )}
    </Button>
  );
}
