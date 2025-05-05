import { useState } from 'react';
import { PaymentCheckout } from '@/components/payment/PaymentCheckout';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/use-toast';

export default function CheckoutPage() {
  const [showPayment, setShowPayment] = useState(false);
  const { toast } = useToast();

  const handlePaymentSuccess = (paymentIntentId: string) => {
    console.log('Payment successful:', paymentIntentId);
    // In a real app, you would do something with this payment ID
    // like updating an order status in your database
const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
return (
    <div className="container mx-auto py-12">
      <h1 className="mb-8 text-center text-3xl font-bold">Checkout</h1>

      {!showPayment ? (
        <div className="mx-auto max-w-md text-center">
          <p className="mb-6">
            Ready to complete your purchase? Click the button below to proceed to payment.
          </p>
          <Button onClick={() => setShowPayment(true)}>Proceed to Checkout</Button>
        </div>
      ) : (
        <PaymentCheckout
          amount={49.99}
          currency="USD"
          description="Premium Membership Subscription"
          metadata={{
            itemName: 'Premium Membership',
            itemId: 'membership-premium-monthly',
            planType: 'monthly',
onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          redirectUrl="/payment/confirmation"
          buttonText="Pay Now"
          showSummary={true}
        />
      )}
    </div>
