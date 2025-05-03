'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Icons } from '@/components/icons';
import { ROUTES } from '@/constants/routes';
import { AuthForm, AuthFormInput, AuthSubmitButton } from '@/components/auth/auth-form';

/**
 * Login page component
 * Allows users to sign in with email/password or social providers
 */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInWithGoogle, signInWithFacebook, signInWithApple } = useAuth();

  /**
   * Handle form submission for email/password login
   */
  const handleSubmit = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');e: React?.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error?.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err?.message : 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      type="login"
      title="Welcome back"
      subtitle="Sign in to your VibeWell account"
      error={error}
      isLoading={isLoading}
      footerText="Don't have an account?"
      footerLink={{
        text: 'Sign up',
        href: ROUTES?.AUTH.SIGNUP,
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthFormInput
          id="email"
          label="Email"
          type="email"
          placeholder="name@example?.com"
          value={email}
          onChange={(e) => setEmail(e?.target.value)}
          required
          disabled={isLoading}
        />

        <AuthFormInput
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e?.target.value)}
          required
          disabled={isLoading}
          rightElement={
            <Link
              href={ROUTES?.AUTH.FORGOT_PASSWORD}
              className="text-primary text-sm hover:underline"
            >
              Forgot password?
            </Link>
          }
        />

        <AuthSubmitButton isLoading={isLoading} loadingText="Signing in..." text="Sign in" />
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
    </AuthForm>
  );
}
