import type { Metadata } from '@/types/metadata';
import Link from 'next/link';
import { UserAuthForm } from '@/components/auth/user-auth-form';
import { WebAuthnAuth } from '@/components/WebAuthnAuth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata: Metadata = {
  title: 'Sign In - VibeWell',
  description: 'Sign in to your VibeWell account',
};

export default function SignInPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Choose your preferred sign in method
            </CardDescription>
          </CardHeader>
          <Tabs defaultValue="credentials" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="credentials">Credentials</TabsTrigger>
              <TabsTrigger value="biometric">Biometric</TabsTrigger>
            </TabsList>
            <TabsContent value="credentials">
              <CardContent className="grid gap-4">
                <UserAuthForm />
              </CardContent>
            </TabsContent>
            <TabsContent value="biometric">
              <CardContent>
                <div className="grid gap-4">
                  <WebAuthnAuth
                    userId="current-user-id" // This will be replaced with actual user ID from the email input
                    onSuccess={() => {
                      // Handle successful authentication
                      console.log('WebAuthn authentication successful');
                    }}
                    onError={error => {
                      console.error('WebAuthn authentication failed:', error);
                    }}
                  />
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-muted-foreground text-center">
              Don't have an account?{' '}
              <Link href="/sign-up" className="text-primary underline-offset-4 hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
