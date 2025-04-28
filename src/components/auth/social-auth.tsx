'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-unified-auth';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/use-toast';
import { Icons } from '@/components/ui/icons';

export function SocialAuth() {
  const [isLoading, setIsLoading] = useState<'google' | 'facebook' | 'apple' | null>(null);
  const { signInWithGoogle, signInWithFacebook, signInWithApple } = useAuth();
  const { toast } = useToast();

  const handleSocialSignIn = async (provider: 'google' | 'facebook' | 'apple') => {
    setIsLoading(provider);
    try {
      switch (provider) {
        case 'google':
          await signInWithGoogle();
          break;
        case 'facebook':
          await signInWithFacebook();
          break;
        case 'apple':
          await signInWithApple();
          break;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to sign in with ${provider}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="grid gap-4">
      <Button
        variant="outline"
        onClick={() => handleSocialSignIn('google')}
        disabled={isLoading !== null}
      >
        {isLoading === 'google' ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}
        Continue with Google
      </Button>
      <Button
        variant="outline"
        onClick={() => handleSocialSignIn('facebook')}
        disabled={isLoading !== null}
      >
        {isLoading === 'facebook' ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.facebook className="mr-2 h-4 w-4" />
        )}
        Continue with Facebook
      </Button>
      <Button
        variant="outline"
        onClick={() => handleSocialSignIn('apple')}
        disabled={isLoading !== null}
      >
        {isLoading === 'apple' ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.apple className="mr-2 h-4 w-4" />
        )}
        Continue with Apple
      </Button>
    </div>
  );
}
