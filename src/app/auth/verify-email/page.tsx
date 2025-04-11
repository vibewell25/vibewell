'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { verifyEmail, resendVerificationEmail } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const token = searchParams.get('token');

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      await resendVerificationEmail();
      toast({
        title: 'Success',
        description: 'Verification email sent. Please check your inbox.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send verification email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (token) {
    verifyEmail(token)
      .then(() => {
        toast({
          title: 'Success',
          description: 'Email verified successfully',
        });
        router.push('/dashboard');
      })
      .catch((error) => {
        toast({
          title: 'Error',
          description: 'Failed to verify email. Please try again.',
          variant: 'destructive',
        });
      });
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Verify your email
          </h1>
          <p className="text-sm text-muted-foreground">
            We've sent a verification email to your inbox. Please check your email and click the verification link.
          </p>
        </div>
        <div className="grid gap-4">
          <Button
            onClick={handleResendEmail}
            disabled={isLoading}
          >
            {isLoading && (
              <span className="mr-2 h-4 w-4 animate-spin" />
            )}
            Resend Verification Email
          </Button>
        </div>
        <p className="px-8 text-center text-sm text-muted-foreground">
          Already verified?{' '}
          <a
            href="/auth/sign-in"
            className="hover:text-brand underline underline-offset-4"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
} 