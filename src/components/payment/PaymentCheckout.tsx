import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { PaymentFormWrapper } from './PaymentForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

type PaymentStatus = 'idle' | 'processing' | 'succeeded' | 'failed';

interface PaymentCheckoutProps {
  amount: number;
  currency?: string;
  description: string;
  metadata?: Record<string, string>;
  onPaymentSuccess?: (paymentIntentId: string) => void;
  onPaymentError?: (error: any) => void;
  redirectUrl?: string;
  buttonText?: string;
  showSummary?: boolean;
}

export function PaymentCheckout({
  amount,
  currency = 'USD',
  description,
  metadata = {},
  onPaymentSuccess,
  onPaymentError,
  redirectUrl,
  buttonText = 'Proceed to Payment',
  showSummary = true,
}: PaymentCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Create payment intent when component mounts
  const createPaymentIntent = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/payments/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: currency.toLowerCase(),
          description,
          metadata,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.id);
    } catch (err: any) {
      console.error('Error creating payment intent:', err);
      setError(err.message || 'Failed to initialize payment');
      if (onPaymentError) onPaymentError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentIntent: any) => {
    setPaymentStatus('succeeded');
    toast({
      title: 'Payment Successful',
      description: 'Your payment has been processed successfully.',
    });

    if (onPaymentSuccess) {
      onPaymentSuccess(paymentIntent.id);
    }

    if (redirectUrl) {
      // Redirect after a short delay to allow user to see the success message
      setTimeout(() => {
        router.push(redirectUrl);
      }, 2000);
    }
  };

  const handlePaymentError = (error: any) => {
    setPaymentStatus('failed');
    setError(error.message || 'Payment processing failed');
    
    toast({
      title: 'Payment Failed',
      description: error.message || 'There was an error processing your payment.',
    });

    if (onPaymentError) {
      onPaymentError(error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Payment</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {paymentStatus === 'succeeded' && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <AlertTitle>Payment Successful</AlertTitle>
            <AlertDescription>
              Your payment has been processed successfully.
              {redirectUrl && ' You will be redirected shortly.'}
            </AlertDescription>
          </Alert>
        )}

        {showSummary && (
          <div className="mb-6 p-4 bg-secondary/20 rounded-lg">
            <div className="text-sm font-medium mb-2">Payment Summary</div>
            <div className="flex justify-between mb-2">
              <span>Amount:</span>
              <span className="font-semibold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)}
              </span>
            </div>
            {metadata['itemName'] && (
              <div className="flex justify-between mb-2">
                <span>Item:</span>
                <span>{metadata['itemName']}</span>
              </div>
            )}
          </div>
        )}

        {!clientSecret && paymentStatus === 'idle' && (
          <Button 
            onClick={createPaymentIntent} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Initializing...' : buttonText}
          </Button>
        )}

        {clientSecret && (
          <PaymentFormWrapper
            clientSecret={clientSecret}
            amount={amount}
            currency={currency}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
          />
        )}
      </CardContent>

      {paymentStatus === 'succeeded' && redirectUrl && (
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={() => router.push(redirectUrl)}
            className="w-full"
          >
            Continue
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default PaymentCheckout; 