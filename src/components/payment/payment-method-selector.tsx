'use client';

import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { PaymentFormWrapper } from './payment-form';
import { CreditCard, Banknote, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { processEventPayment } from '@/lib/api/events';

interface PaymentMethod {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface PaymentMethodSelectorProps {
  eventId: string;
  userId: string;
  amount: number;
  currency?: string;
  description?: string;
  orderReference?: string;
  onSuccess?: (paymentId: string, method: string) => void;
  onError?: (error: Error) => void;
  availableMethods?: string[];
}

export function PaymentMethodSelector({
  eventId,
  userId,
  amount,
  currency = 'USD',
  description,
  orderReference,
  onSuccess,
  onError,
  availableMethods = ['card', 'bank'],
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>(availableMethods[0] || 'card');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const { toast } = useToast();

  const PAYMENT_METHODS: PaymentMethod[] = [
    {
      id: 'card',
      label: 'Credit or Debit Card',
      icon: <CreditCard className="h-5 w-5" />,
      description: 'Pay securely with your credit or debit card',
    },
    {
      id: 'bank',
      label: 'Bank Transfer',
      icon: <Banknote className="h-5 w-5" />,
      description: 'Pay directly from your bank account',
    },
  ];

  // Filter methods based on available methods
  const filteredMethods = PAYMENT_METHODS.filter(method => availableMethods.includes(method.id));

  // Handle direct payment without Stripe integration
  const handleDirectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      // For simulation, we create a fake payment method ID
      const fakePaymentMethodId = `pm_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      
      // Process the payment using our API
      const result = await processEventPayment(eventId, userId, {
        paymentMethodId: fakePaymentMethodId,
        amount,
        metadata: {
          method: selectedMethod,
          cardName: selectedMethod === 'card' ? cardName : undefined,
          lastFour: selectedMethod === 'card' ? cardNumber.slice(-4) : undefined,
        }
      });

      if (result.success) {
        toast({
          title: 'Payment successful',
          description: 'Your payment has been processed successfully.',
          type: 'success',
          duration: 5000,
        });
        
        if (onSuccess) {
          onSuccess(result.paymentIntentId || 'unknown', selectedMethod);
        }
      } else {
        setError(result.message || 'Payment failed. Please try again.');
        toast({
          title: 'Payment failed',
          description: result.message || 'There was an error processing your payment.',
          type: 'error',
          duration: 5000,
        });
        
        if (onError) {
          onError(new Error(result.message));
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: 'Payment error',
        description: errorMessage,
        type: 'error',
        duration: 5000,
      });
      
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Render the selected payment form
  const renderPaymentForm = () => {
    switch (selectedMethod) {
      case 'card':
        return (
          <form onSubmit={handleDirectPayment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-name">Name on Card</Label>
              <Input 
                id="card-name" 
                value={cardName} 
                onChange={(e) => setCardName(e.target.value)} 
                placeholder="John Doe" 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="card-number">Card Number</Label>
              <Input 
                id="card-number" 
                value={cardNumber} 
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))} 
                placeholder="1234 5678 9012 3456" 
                required 
                pattern="\d{16}" 
                title="Card number must be 16 digits" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="card-expiry">Expiry Date</Label>
                <Input 
                  id="card-expiry" 
                  value={cardExpiry} 
                  onChange={(e) => setCardExpiry(e.target.value.replace(/\D/g, '').slice(0, 4))} 
                  placeholder="MM/YY" 
                  required 
                  pattern="\d{4}" 
                  title="Expiry date must be in MMYY format" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="card-cvc">CVC</Label>
                <Input 
                  id="card-cvc" 
                  value={cardCvc} 
                  onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3))} 
                  placeholder="123" 
                  required 
                  pattern="\d{3}" 
                  title="CVC must be 3 digits" 
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : `Pay ${amount} ${currency}`}
            </Button>
          </form>
        );

      case 'bank':
        return (
          <div className="p-6 bg-muted rounded-lg text-center">
            <h3 className="font-medium mb-2">Bank Transfer Details</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Please transfer {currency} {amount.toFixed(2)} to the following account:
            </p>
            <div className="text-left space-y-2 bg-background p-4 rounded-md">
              <div className="grid grid-cols-2 gap-1">
                <span className="text-sm font-medium">Bank Name:</span>
                <span className="text-sm">VibeWell Financial</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="text-sm font-medium">Account Name:</span>
                <span className="text-sm">VibeWell Payments Ltd</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="text-sm font-medium">Account Number:</span>
                <span className="text-sm">XXXX-XXXX-XXXX-1234</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="text-sm font-medium">Reference:</span>
                <span className="text-sm">{orderReference || eventId}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Please include the reference number in your payment details. Once payment is received,
              your registration will be confirmed.
            </p>
            <Button 
              className="mt-4 w-full" 
              variant="outline"
              onClick={() => {
                toast({
                  title: 'Bank transfer selected',
                  description: 'Please complete the bank transfer using the details provided.',
                  type: 'info',
                  duration: 5000,
                });
                
                if (onSuccess) {
                  onSuccess('bank_transfer_' + Date.now(), 'bank');
                }
              }}
            >
              I've Completed The Transfer
            </Button>
          </div>
        );

      default:
        return (
          <div className="p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p>Please select a payment method</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Payment Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Payment Method</h2>

        <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod} className="space-y-3">
          {filteredMethods.map(method => (
            <div key={method.id} className="flex items-center space-x-2">
              <RadioGroupItem value={method.id} id={method.id} className="peer" />
              <Label
                htmlFor={method.id}
                className="flex flex-1 items-center space-x-3 rounded-md border border-transparent p-3 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {method.icon}
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{method.label}</p>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Card>
        <CardContent className="pt-6">{renderPaymentForm()}</CardContent>
      </Card>
    </div>
  );
}
