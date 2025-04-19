import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { prisma } from '@/lib/database/client';
import { toast } from '@/components/ui/use-toast';

interface EmailVerificationProps {
  email: string;
  onSuccess?: () => void;
}

export function EmailVerification({ email, onSuccess }: EmailVerificationProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendVerification = async () => {
    try {
      setSending(true);
      setError(null);
      
      // Send verification email via Supabase Auth
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/verify-email`,
      });
      
      if (error) throw error;
      
      setSent(true);
      toast({
        title: 'Verification Email Sent',
        description: 'Please check your inbox for the verification link',
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error sending verification email:', err);
      setError(err.message || 'Failed to send verification email');
      toast({
        title: 'Error',
        description: 'Failed to send verification email',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Verification
        </CardTitle>
        <CardDescription>
          Verify your email address to ensure account security
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4 py-4">
        {sent ? (
          <div className="flex flex-col items-center space-y-4 text-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <div>
              <h3 className="text-lg font-medium">Verification Email Sent</h3>
              <p className="text-muted-foreground mt-1">
                We've sent a verification email to <span className="font-medium">{email}</span>.
                Please check your inbox and click on the verification link.
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center space-y-4 text-center">
            <AlertCircle className="h-16 w-16 text-red-500" />
            <div>
              <h3 className="text-lg font-medium">Verification Failed</h3>
              <p className="text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4 text-center">
            <Mail className="h-16 w-16 text-primary" />
            <div>
              <h3 className="text-lg font-medium">Verify Your Email</h3>
              <p className="text-muted-foreground mt-1">
                Click the button below to send a verification email to <span className="font-medium">{email}</span>
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        {!sent ? (
          <Button
            onClick={handleSendVerification}
            disabled={sending}
            className="w-full sm:w-auto"
          >
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Verification Email
              </>
            )}
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={handleSendVerification}
            className="w-full sm:w-auto"
          >
            Resend Verification Email
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 