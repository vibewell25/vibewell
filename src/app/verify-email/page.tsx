'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { prisma } from '@/lib/database/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

// Content component that uses useSearchParams
function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function verifyEmail() {
      try {
        setVerifying(true);

        // Get current user (if any)
        const { data: { user } } = await supabase.auth.getUser();
        setUserId(user?.id || null);

        // Check for token in URL
        const token = searchParams?.get('token');
        
        if (!token) {
          setSuccess(false);
          setMessage('Verification link is invalid or has expired');
          return;
        }

        // In Supabase, email verification is handled automatically
        // We just need to check if the user's email is verified and update our profile
        if (user) {
          // Check if email is verified
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('email_verified')
            .eq('id', user.id)
            .single();
          
          if (profileError) {
            throw profileError;
          }
          
          if (profile && !profile.email_verified) {
            // Update profile to mark email as verified
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ email_verified: true })
              .eq('id', user.id);
            
            if (updateError) {
              throw updateError;
            }
          }
          
          setSuccess(true);
          setMessage('Your email has been verified successfully');
        } else {
          // User not logged in - we'll show a generic success message
          setSuccess(true);
          setMessage('Please log in to complete the verification process');
        }
      } catch (error) {
        console.error('Error verifying email:', error);
        setSuccess(false);
        setMessage('An error occurred during verification');
      } finally {
        setVerifying(false);
      }
    }

    verifyEmail();
  }, [searchParams]);

  const handleContinue = () => {
    if (userId) {
      router.push('/profile');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="container mx-auto flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <CardDescription>Verifying your email address</CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center justify-center py-8">
          {verifying ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <p className="text-center text-lg">Verifying your email...</p>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-center text-lg">{message}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-16 w-16 text-red-500" />
              <p className="text-center text-lg">{message}</p>
              <p className="text-sm text-muted-foreground text-center">
                If you're having trouble, please contact our support team.
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Button 
            onClick={handleContinue} 
            className="w-full" 
            disabled={verifying}
          >
            {userId ? 'Go to Profile' : 'Go to Login'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Main export with Suspense boundary
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto flex justify-center items-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Email Verification</CardTitle>
            <CardDescription>Loading verification page...</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
            <p className="text-center text-lg mt-4">Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
} 