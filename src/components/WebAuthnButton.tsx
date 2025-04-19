import React, { useState } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { Button } from './ui/button';
import { toast } from './ui/use-toast';

interface WebAuthnButtonProps {
  mode: 'register' | 'login';
  onSuccess?: (response: any) => void;
  onError?: (error: Error) => void;
  className?: string;
  disabled?: boolean;
}

export const WebAuthnButton: React.FC<WebAuthnButtonProps> = ({
  mode,
  onSuccess,
  onError,
  className = '',
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleWebAuthn = async () => {
    try {
      setIsLoading(true);
      
      if (mode === 'register') {
        // Get registration options from your server
        const optionsResponse = await fetch('/api/auth/webauthn/register/options');
        const options = await optionsResponse.json();

        // Start registration
        const regResponse = await startRegistration(options);

        // Verify registration with your server
        const verificationResponse = await fetch('/api/auth/webauthn/register/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(regResponse),
        });

        if (!verificationResponse.ok) {
          throw new Error('Registration failed');
        }

        const verification = await verificationResponse.json();
        onSuccess?.(verification);
        toast({
          title: 'Success',
          description: 'Biometric registration successful',
          variant: 'default',
        });
      } else {
        // Get authentication options from your server
        const optionsResponse = await fetch('/api/auth/webauthn/login/options');
        const options = await optionsResponse.json();

        // Start authentication
        const authResponse = await startAuthentication(options);

        // Verify authentication with your server
        const verificationResponse = await fetch('/api/auth/webauthn/login/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(authResponse),
        });

        if (!verificationResponse.ok) {
          throw new Error('Authentication failed');
        }

        const verification = await verificationResponse.json();
        onSuccess?.(verification);
        toast({
          title: 'Success',
          description: 'Biometric authentication successful',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('WebAuthn error:', error);
      onError?.(error as Error);
      toast({
        title: 'Error',
        description: (error as Error).message || 'Authentication failed',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleWebAuthn}
      disabled={disabled || isLoading}
      className={`webauthn-button ${className}`}
      variant="secondary"
    >
      {isLoading ? (
        <span className="loading-spinner mr-2" />
      ) : (
        <span className="fingerprint-icon mr-2" />
      )}
      {mode === 'register' ? 'Register Biometric Key' : 'Login with Biometric'}
    </Button>
  );
}; 