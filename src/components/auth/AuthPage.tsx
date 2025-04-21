import React from 'react';
import { OAuthButton } from './OAuthButton';
import { MagicLinkForm } from './MagicLinkForm';
import { WebAuthnButton } from '../WebAuthnButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { SupportedOAuthProvider } from '../../services/auth/oauth-service';

interface AuthPageProps {
  mode: 'login' | 'register';
  onOAuthLogin: (provider: SupportedOAuthProvider) => Promise<void>;
  onMagicLinkSubmit: (email: string) => Promise<void>;
  onWebAuthnSuccess: (response: any) => void;
  onWebAuthnError: (error: Error) => void;
  className?: string;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  mode,
  onOAuthLogin,
  onMagicLinkSubmit,
  onWebAuthnSuccess,
  onWebAuthnError,
  className = '',
}) => {
  return (
    <div className={`container max-w-md px-4 py-8 ${className}`}>
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </CardTitle>
          <CardDescription>
            {mode === 'login'
              ? 'Sign in to your account using any of these methods'
              : 'Choose your preferred way to create an account'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* OAuth Providers */}
          <div className="grid gap-2">
            <OAuthButton provider="google" onLogin={onOAuthLogin} />
            <OAuthButton provider="facebook" onLogin={onOAuthLogin} />
            <OAuthButton provider="apple" onLogin={onOAuthLogin} />
            <OAuthButton provider="twitter" onLogin={onOAuthLogin} />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Tabs defaultValue="magic-link" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
              <TabsTrigger value="webauthn">Biometric</TabsTrigger>
            </TabsList>
            <TabsContent value="magic-link" className="space-y-4">
              <MagicLinkForm onSubmit={onMagicLinkSubmit} />
            </TabsContent>
            <TabsContent value="webauthn" className="space-y-4">
              <div className="flex justify-center">
                <WebAuthnButton
                  mode={mode}
                  onSuccess={onWebAuthnSuccess}
                  onError={onWebAuthnError}
                  className="w-full"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="text-center text-sm">
            {mode === 'login' ? (
              <p className="text-muted-foreground">
                Don't have an account?{' '}
                <a
                  href="/auth/register"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Sign up
                </a>
              </p>
            ) : (
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <a href="/auth/login" className="text-primary underline-offset-4 hover:underline">
                  Sign in
                </a>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
