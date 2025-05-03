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
      router?.push('/auth/forgot-password');
    }
  }, [token, router]);

  /**
   * Handle form submission for password reset
   */
  const handleSubmit = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');e: React?.FormEvent) => {
    e?.preventDefault();
    setError(null);

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Check password strength
    if (password?.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await updatePassword(password);
      if (error) {
        setError(error?.message);
      } else {
        setIsSuccessful(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err?.message : 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccessful) {
    return (
      <div className="container mx-auto max-w-md px-4 py-8">
        <div className="mb-8 flex flex-col items-center">
          <Icons?.logo className="text-primary mb-4 h-12 w-12" />
          <h1 className="mb-2 text-2xl font-bold">Password reset successful</h1>
          <p className="text-center text-muted-foreground">
            Your password has been updated successfully. You can now log in with your new password.
          </p>
        </div>
        <Link
          href="/auth/login"
          className="bg-primary text-primary-foreground hover:bg-primary/90 block w-full rounded-md py-2 text-center font-medium transition-colors"
        >
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      <div className="mb-8 flex flex-col items-center">
        <Icons?.logo className="text-primary mb-4 h-12 w-12" />
        <h1 className="mb-2 text-2xl font-bold">Reset your password</h1>
        <p className="text-center text-muted-foreground">Enter your new password below.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-destructive/20 p-3 text-destructive">{error}</div>
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
            onChange={(e) => setPassword(e?.target.value)}
            required
            minLength={8}
            className="w-full rounded-md border p-2"
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
            onChange={(e) => setConfirmPassword(e?.target.value)}
            required
            className="w-full rounded-md border p-2"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md py-2 font-medium transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Resetting password...' : 'Reset password'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link href="/auth/login" className="text-primary hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
