'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-unified-auth';
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await signUp(email, password, name);
      if (error) {
        setError(error.message);
      } else {
        setShowVerificationMessage(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showVerificationMessage) {
    return (
      <div className="container max-w-md mx-auto py-8 px-4">
        <div className="flex flex-col items-center mb-8">
          <Icons.logo className="h-12 w-12 mb-4 text-primary" />
          <h1 className="text-2xl font-bold mb-2">Check your email</h1>
          <p className="text-muted-foreground text-center">
            We've sent a verification link to <strong>{email}</strong>. Please check your email and
            click the link to activate your account.
          </p>
        </div>
        <Link href="/auth/login" className="block text-center mt-6 text-primary hover:underline">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-8 px-4">
      <div className="flex flex-col items-center mb-8">
        <Icons.logo className="h-12 w-12 mb-4 text-primary" />
        <h1 className="text-2xl font-bold mb-2">Create an account</h1>
        <p className="text-muted-foreground text-center">
          Enter your details to create your VibeWell account
        </p>
      </div>

      {error && (
        <div className="bg-destructive/20 text-destructive p-3 rounded-md mb-4">{error}</div>
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
            onChange={e => setName(e.target.value)}
            required
            className="w-full p-2 border rounded-md"
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
            placeholder="name@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full p-2 border rounded-md"
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

        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
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
          className="flex items-center justify-center p-2 border rounded-md hover:bg-muted transition-colors"
        >
          <Icons.google className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => signInWithFacebook()}
          className="flex items-center justify-center p-2 border rounded-md hover:bg-muted transition-colors"
        >
          <Icons.facebook className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => signInWithApple()}
          className="flex items-center justify-center p-2 border rounded-md hover:bg-muted transition-colors"
        >
          <Icons.apple className="h-5 w-5" />
        </button>
      </div>

      <p className="text-center mt-6 text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
