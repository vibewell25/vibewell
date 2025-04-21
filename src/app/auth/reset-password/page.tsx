'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-unified-auth';
import { Icons } from '@/components/icons';

/**
 * Reset Password page component
 * Allows users to set a new password after receiving a reset link
 */
export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { updatePassword } = useAuth();

  // Get the token from URL parameters
  const token = searchParams?.get('token') ?? null;

  useEffect(() => {
    // Redirect if token is missing
    if (!token) {
      router.push('/auth/forgot-password');
    }
  }, [token, router]);

  /**
   * Handle form submission for password reset
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Check password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await updatePassword(password);
      if (error) {
        setError(error.message);
      } else {
        setIsSuccessful(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccessful) {
    return (
      <div className="container max-w-md mx-auto py-8 px-4">
        <div className="flex flex-col items-center mb-8">
          <Icons.logo className="h-12 w-12 mb-4 text-primary" />
          <h1 className="text-2xl font-bold mb-2">Password reset successful</h1>
          <p className="text-muted-foreground text-center">
            Your password has been updated successfully. You can now log in with your new password.
          </p>
        </div>
        <Link
          href="/auth/login"
          className="block w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors text-center"
        >
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-8 px-4">
      <div className="flex flex-col items-center mb-8">
        <Icons.logo className="h-12 w-12 mb-4 text-primary" />
        <h1 className="text-2xl font-bold mb-2">Reset your password</h1>
        <p className="text-muted-foreground text-center">Enter your new password below.</p>
      </div>

      {error && (
        <div className="bg-destructive/20 text-destructive p-3 rounded-md mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            New Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full p-2 border rounded-md"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Password must be at least 8 characters long
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
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
          {isLoading ? 'Resetting password...' : 'Reset password'}
        </button>
      </form>

      <p className="text-center mt-6 text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link href="/auth/login" className="text-primary hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
