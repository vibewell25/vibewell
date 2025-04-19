'use client';

import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { PaymentFormWrapper } from './payment-form';
import { CreditCard, Banknote, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PaymentMethod {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface PaymentMethodSelectorProps {
  amount: number;
  currency?: string;
  description?: string;
  orderReference?: string;
  onSuccess?: (paymentId: string, method: string) => void;
  onError?: (error: Error) => void;
  availableMethods?: string[];
}

export function PaymentMethodSelector({
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
  const filteredMethods = PAYMENT_METHODS.filter(method => 
    availableMethods.includes(method.id)
  );

  // Handle payment success
  const handlePaymentSuccess = (paymentId: string) => {
    if (onSuccess) {
      onSuccess(paymentId, selectedMethod);
    }
  };

  // Handle payment error
  const handlePaymentError = (error: Error) => {
    console.error('Payment error:', error);
    setError(error.message);
    
    if (onError) {
      onError(error);
    }
  };

  // Render the selected payment form
  const renderPaymentForm = () => {
    switch (selectedMethod) {
      case 'card':
        return (
          <PaymentFormWrapper
            amount={amount}
            currency={currency}
            description={description}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
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
                <span className="text-sm">{orderReference || 'Please contact support'}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Please include the reference number in your payment details. 
              Once payment is received, your order will be processed.
            </p>
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
        
        <RadioGroup 
          value={selectedMethod} 
          onValueChange={setSelectedMethod}
          className="space-y-3"
        >
          {filteredMethods.map((method) => (
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
        <CardContent className="pt-6">
          {renderPaymentForm()}
        </CardContent>
      </Card>
    </div>
  );
} 