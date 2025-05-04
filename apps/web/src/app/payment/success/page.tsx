'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { CheckCircle } from 'lucide-react';

// Component that uses useSearchParams
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); getPaymentDetails() {
      if (!paymentId) {
        setError('Invalid payment information');
        setLoading(false);
        return;
      }

      try {
        // In a real application, you would fetch payment details from your backend
        // This is just a simulated response
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setPaymentDetails({
          id: paymentId,
          amount: 49.99,
          currency: 'USD',
          date: new Date().toISOString(),
          status: 'succeeded',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
        });
      } catch (err) {
        setError('Could not retrieve payment details');
        console.error('Error fetching payment details:', err);
      } finally {
        setLoading(false);
      }
    }

    getPaymentDetails();
  }, [paymentId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <h2 className="mt-4 text-xl font-semibold">Processing Payment</h2>
          <p className="mt-2 text-gray-500">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }

  if (error || !paymentDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Payment Error</CardTitle>
            <CardDescription>There was a problem with your payment</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error || 'No payment details found'}</p>
          </CardContent>
          <CardFooter>
            <Link href="/checkout" passHref>
              <Button className="w-full">Try Again</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const formattedDate = new Date(paymentDetails.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-xl">Payment Successful!</CardTitle>
          <CardDescription>Your payment has been processed successfully</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Payment ID:</span>
              <span className="font-medium">{paymentDetails.id}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Amount:</span>
              <span className="font-medium">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: paymentDetails.currency,
                }).format(paymentDetails.amount)}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Status:</span>
              <span className="font-medium text-green-600">
                {paymentDetails.status.charAt(0).toUpperCase() + paymentDetails.status.slice(1)}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Date:</span>
              <span className="font-medium">{formattedDate}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Name:</span>
              <span className="font-medium">{paymentDetails.customerName}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-gray-500">Email:</span>
              <span className="font-medium">{paymentDetails.customerEmail}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="mb-2 text-center text-sm text-gray-500">
            A receipt has been sent to your email address.
          </p>
          <Link href="/" passHref>
            <Button className="w-full">Return to Home</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

// Export with Suspense boundary
export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-b-2"></div>
            <h2 className="mt-4 text-xl font-semibold">Loading Payment Details</h2>
            <p className="mt-2 text-gray-500">Please wait...</p>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
