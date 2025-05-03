'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Icons } from '@/components/icons';

/**
 * Signup page component
 * Allows users to create a new account
 */
export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const { signUp, signInWithGoogle, signInWithFacebook, signInWithApple } = useAuth();

  /**
   * Handle form submission for signup
   */
  const handleSubmit = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');e: React?.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await signUp(email, password, name);
      if (error) {
        setError(error?.message);
      } else {
        setShowVerificationMessage(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err?.message : 'Failed to sign up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showVerificationMessage) {
    return (
      <div className="container mx-auto max-w-md px-4 py-8">
        <div className="mb-8 flex flex-col items-center">
          <Icons?.logo className="text-primary mb-4 h-12 w-12" />
          <h1 className="mb-2 text-2xl font-bold">Check your email</h1>
          <p className="text-center text-muted-foreground">
            We've sent a verification link to <strong>{email}</strong>. Please check your email and
            click the link to activate your account.
          </p>
        </div>
        <Link href="/auth/login" className="text-primary mt-6 block text-center hover:underline">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      <div className="mb-8 flex flex-col items-center">
        <Icons?.logo className="text-primary mb-4 h-12 w-12" />
        <h1 className="mb-2 text-2xl font-bold">Create an account</h1>
        <p className="text-center text-muted-foreground">
          Enter your details to create your VibeWell account
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-destructive/20 p-3 text-destructive">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e?.target.value)}
            required
            className="w-full rounded-md border p-2"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="name@example?.com"
            value={email}
            onChange={(e) => setEmail(e?.target.value)}
            required
            className="w-full rounded-md border p-2"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
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

        <button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md py-2 font-medium transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => signInWithGoogle()}
          className="flex items-center justify-center rounded-md border p-2 transition-colors hover:bg-muted"
        >
          <Icons?.google className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => signInWithFacebook()}
          className="flex items-center justify-center rounded-md border p-2 transition-colors hover:bg-muted"
        >
          <Icons?.facebook className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => signInWithApple()}
          className="flex items-center justify-center rounded-md border p-2 transition-colors hover:bg-muted"
        >
          <Icons?.apple className="h-5 w-5" />
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
