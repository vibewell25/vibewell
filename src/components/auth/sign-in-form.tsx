'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Icons } from '@/components/ui/icons';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  rememberMe: z.boolean().optional(),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaValue, setCaptchaValue] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signInWithProvider } = useAuth();

  useEffect(() => {
    // Check if biometric authentication is available
    if (window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(available => setIsBiometricAvailable(available));
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });

  const handleBiometricAuth = async () => {
    try {
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          rpId: window.location.hostname,
          allowCredentials: [],
          userVerification: 'required',
        },
      });
      
      if (credential) {
        // Handle successful biometric authentication
        const redirectTo = searchParams.get('redirect') || '/dashboard';
        router.push(redirectTo);
      }
    } catch (err) {
      setError('Biometric authentication failed. Please try another method.');
    }
  };

  const onSubmit = async (data: SignInFormValues) => {
    setIsLoading(true);
    setError(null);

    // Check for suspicious activity
    if (failedAttempts >= 3 && !showCaptcha) {
      setShowCaptcha(true);
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn(data.email, data.password);
      
      if (!result.success) {
        setFailedAttempts(prev => prev + 1);
        setError(result.error || 'Invalid credentials. Please try again.');
        return;
      }

      // Reset failed attempts on successful login
      setFailedAttempts(0);
      setShowCaptcha(false);

      // Handle remember me
      if (data.rememberMe) {
        localStorage.setItem('rememberedEmail', data.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      const redirectTo = searchParams.get('redirect') || '/dashboard';
      router.push(redirectTo);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'facebook' | 'apple') => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signInWithProvider(provider);
      
      if (!result.success) {
        setError(result.error || 'Failed to sign in with social provider.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Social sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register('email')}
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register('password')}
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <p id="password-error" className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="rememberMe"
              {...register('rememberMe')}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <Label htmlFor="rememberMe">Remember me</Label>
          </div>
          {showCaptcha && (
            <div className="space-y-2">
              <Label htmlFor="captcha">Enter the code shown below</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="captcha"
                  type="text"
                  value={captchaValue}
                  onChange={(e) => setCaptchaValue(e.target.value)}
                  placeholder="Enter CAPTCHA"
                />
                <div className="bg-gray-100 p-2 rounded">
                  {/* Add your CAPTCHA component here */}
                </div>
              </div>
            </div>
          )}
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {isBiometricAvailable && (
          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleBiometricAuth}
            >
              <Icons.fingerprint className="mr-2 h-4 w-4" />
              Sign in with Biometrics
            </Button>
          </div>
        )}

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Button
            variant="outline"
            type="button"
            disabled={isLoading}
            onClick={() => handleSocialSignIn('google')}
            aria-label="Sign in with Google"
          >
            <Icons.google className="mr-2 h-4 w-4" />
            Google
          </Button>
          <Button
            variant="outline"
            type="button"
            disabled={isLoading}
            onClick={() => handleSocialSignIn('facebook')}
            aria-label="Sign in with Facebook"
          >
            <Icons.facebook className="mr-2 h-4 w-4" />
            Facebook
          </Button>
          <Button
            variant="outline"
            type="button"
            disabled={isLoading}
            onClick={() => handleSocialSignIn('apple')}
            aria-label="Sign in with Apple"
          >
            <Icons.apple className="mr-2 h-4 w-4" />
            Apple
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Link
          href="/auth/forgot-password"
          className="text-sm text-muted-foreground hover:text-primary"
          aria-label="Forgot password"
        >
          Forgot your password?
        </Link>
        <div className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link
            href="/auth/sign-up"
            className="text-primary hover:underline"
            aria-label="Sign up"
          >
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
} 