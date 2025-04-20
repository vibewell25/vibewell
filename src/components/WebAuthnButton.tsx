import React from 'react';
import { Button } from './ui/button';
import { useWebAuthn } from '@/hooks/useWebAuthn';
import { toast } from './ui/use-toast';
import { Loader2 } from 'lucide-react';

interface WebAuthnButtonProps {
  mode: 'register' | 'authenticate';
  onSuccess?: () => void;
  onError?: (error: string) => void;
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
  const { register, authenticate, loading, error } = useWebAuthn();

  const handleClick = async () => {
    try {
      const success = await (mode === 'register' ? register() : authenticate());

      if (success) {
        toast({
          title: 'Success',
          description: `Biometric ${mode === 'register' ? 'registration' : 'authentication'} successful`,
        });
        onSuccess?.();
      } else {
        throw new Error('Operation failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Operation failed';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      onError?.(errorMessage);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`webauthn-button ${className}`}
      variant="secondary"
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {mode === 'register' ? 'Register Biometric Key' : 'Login with Biometric'}
    </Button>
  );
}; 