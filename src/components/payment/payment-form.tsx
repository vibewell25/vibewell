'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Elements, 
  PaymentElement, 
  useStripe, 
  useElements,
  AddressElement
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

// Load Stripe outside of a component
// Make sure to include your publishable key from the environment variables
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentFormProps {
  amount: number;
  currency?: string;
  description?: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: Error) => void;
  clientSecret?: string;
}

export function PaymentFormWrapper(props: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | undefined>(props.clientSecret);
  const [loading, setLoading] = useState(!props.clientSecret);
  const [error, setError] = useState<string | null>(null);

  // Fetch a payment intent client secret if not provided
  useState(() => {
    if (props.clientSecret) return;

    async function createPaymentIntent() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: props.amount,
            currency: props.currency || 'usd',
            description: props.description,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError('Unable to process payment at the moment. Please try again later.');
        if (props.onError && err instanceof Error) {
          props.onError(err);
        }
      } finally {
        setLoading(false);
      }
    }

    createPaymentIntent();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Preparing payment form...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Payment Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!clientSecret) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Configuration Error</AlertTitle>
        <AlertDescription>
          Unable to initialize payment form. Please contact support.
        </AlertDescription>
      </Alert>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#6366f1',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm {...props} clientSecret={clientSecret} />
    </Elements>
  );
}

function PaymentForm({
  amount,
  currency = 'usd',
  description,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Reset errors
    setNameError(null);
    setEmailError(null);
    setError(null);

    // Validate inputs
    let hasError = false;
    if (!name.trim()) {
      setNameError('Name is required');
      hasError = true;
    }

    if (!email.trim()) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    }

    if (hasError) return;

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    try {
      setProcessing(true);

      // Confirm the payment
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
          receipt_email: email,
          payment_method_data: {
            billing_details: {
              name,
              email,
            },
          },
        },
        redirect: 'if_required',
      });

      if (result.error) {
        // Show error to customer
        setError(result.error.message || 'An unexpected error occurred');
        if (onError) {
          onError(result.error);
        }
      } else if (result.paymentIntent) {
        // Payment succeeded
        if (onSuccess) {
          onSuccess(result.paymentIntent.id);
        }
        router.push(`/payment/success?payment_id=${result.paymentIntent.id}`);
      }
    } catch (err) {
      setError('Payment processing failed. Please try again.');
      if (onError && err instanceof Error) {
        onError(err);
      }
    } finally {
      setProcessing(false);
    }
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-6" 
      data-cy="payment-form"
      autoComplete="off"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            data-cy="customer-name"
          />
          {nameError && (
            <p className="text-sm text-red-500" data-cy="name-error">{nameError}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            data-cy="customer-email"
          />
          {emailError && (
            <p className="text-sm text-red-500" data-cy="email-error">{emailError}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Card Details</Label>
          <div className="rounded-md border p-3">
            <PaymentElement />
          </div>
          {error && (
            <p className="text-sm text-red-500" data-cy="card-error">{error}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Billing Address</Label>
          <div className="rounded-md border p-3">
            <AddressElement options={{ mode: 'billing' }} />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          className="w-full"
          disabled={!stripe || processing}
          data-cy="submit-payment"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${amount.toFixed(2)} ${currency.toUpperCase()}`
          )}
        </Button>
      </div>

      <div className="mt-4 text-center text-sm text-gray-500">
        <p>Your payment is processed securely through Stripe.</p>
        <p>We do not store your card details on our servers.</p>
      </div>
    </form>
  );
} 