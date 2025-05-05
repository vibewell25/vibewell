import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function PaymentConfirmationPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'success' | 'error' | 'processing' | 'unknown'>('unknown');
  const [isLoading, setIsLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    const checkPaymentStatus = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
      setIsLoading(true);

      // Check for payment_intent and payment_intent_client_secret in URL
      const paymentIntentId = searchParams.get('payment_intent');
      const redirectStatus = searchParams.get('redirect_status');

      if (!paymentIntentId) {
        // No payment intent in URL, assume user was redirected from a completed payment
        setStatus('success');
        setIsLoading(false);
        return;
try {
        // In a real app, you would check the payment status with your backend
        // For now, we'll just use the redirect_status from the URL
        if (redirectStatus === 'succeeded') {
          setStatus('success');
else if (redirectStatus === 'processing') {
          setStatus('processing');
else if (redirectStatus === 'failed') {
          setStatus('error');
else {
          setStatus('unknown');
// Fetch payment details (in a real app)
        // const response = await fetch(`/api/payments/${paymentIntentId}`);
        // const data = await response.json();
        // setPaymentDetails(data);

        // For demo purposes:
        setPaymentDetails({
          amount: 49.99,
          currency: 'USD',
          date: new Date().toLocaleDateString(),
          id: paymentIntentId,
          status: redirectStatus,
catch (err) {
        console.error('Error getting payment status:', err);
        setStatus('error');
finally {
        setIsLoading(false);
checkPaymentStatus();
[searchParams]);

  return (
    <div className="container mx-auto py-12">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {isLoading ? 'Checking Payment Status...' : 'Payment Confirmation'}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
            </div>
          ) : (
            <div className="text-center">
              {status === 'success' && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  </div>
                  <h3 className="text-xl font-medium">Payment Successful!</h3>
                  <p className="text-gray-600">
                    Thank you for your payment. Your transaction has been completed successfully.
                  </p>

                  {paymentDetails && (
                    <div className="mt-6 rounded-md border p-4 text-left">
                      <h4 className="mb-2 font-medium">Receipt</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-gray-600">Payment ID:</span>
                        <span>{paymentDetails.id}</span>
                        <span className="text-gray-600">Amount:</span>
                        <span>
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: paymentDetails.currency,
).format(paymentDetails.amount)}
                        </span>
                        <span className="text-gray-600">Date:</span>
                        <span>{paymentDetails.date}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {status === 'processing' && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="border-primary h-16 w-16 animate-spin rounded-full border-4 border-t-transparent" />
                  </div>
                  <h3 className="text-xl font-medium">Payment Processing</h3>
                  <p className="text-gray-600">
                    Your payment is being processed. This may take a moment.
                  </p>
                </div>
              )}

              {(status === 'error' || status === 'unknown') && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <AlertCircle className="h-16 w-16 text-red-500" />
                  </div>
                  <h3 className="text-xl font-medium">Payment Unsuccessful</h3>
                  <p className="text-gray-600">
                    There was an issue processing your payment. Please try again or contact support.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center space-x-2">
          <Button variant="outline" asChild>
            <Link href="/">Return to Home</Link>
          </Button>

          {status === 'error' && (
            <Button asChild>
              <Link href="/payment/checkout">Try Again</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
