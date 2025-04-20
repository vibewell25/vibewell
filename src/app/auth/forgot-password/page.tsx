'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Icons } from '@/components/icons';
import { ROUTES } from '@/constants/routes';

/**
 * Forgot Password page component
 * Allows users to request a password reset link
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const { resetPassword } = useAuth();

  /**
   * Handle form submission for password reset request
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setError(error.message);
      } else {
        setIsSuccessful(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send password reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccessful) {
    return (
      <div className="container max-w-md mx-auto py-8 px-4">
        <div className="flex flex-col items-center mb-8">
          <Icons.logo className="h-12 w-12 mb-4 text-primary" />
          <h1 className="text-2xl font-bold mb-2">Check your email</h1>
          <p className="text-muted-foreground text-center">
            We've sent a password reset link to <strong>{email}</strong>. 
            Please check your email and click the link to reset your password.
          </p>
        </div>
        <Link
          href={ROUTES.AUTH.LOGIN}
          className="block text-center mt-6 text-primary hover:underline"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-8 px-4">
      <div className="flex flex-col items-center mb-8">
        <Icons.logo className="h-12 w-12 mb-4 text-primary" />
        <h1 className="text-2xl font-bold mb-2">Forgot your password?</h1>
        <p className="text-muted-foreground text-center">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/20 text-destructive p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border rounded-md"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      <p className="text-center mt-6 text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link href={ROUTES.AUTH.LOGIN} className="text-primary hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
} 