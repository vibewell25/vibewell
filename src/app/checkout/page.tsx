'use client';

import { useState } from 'react';
import { PaymentFormWrapper } from '@/components/payment/payment-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, PaypalIcon } from 'lucide-react';
import Link from 'next/link';

// Mock PayPal icon since it doesn't exist in Lucide
function PaypalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M20.927 8.588a4.252 4.252 0 0 0-1.531-3.51C18.577 4.367 17.422 4 16.103 4H9.53c-.366 0-.683.262-.742.622L6.059 18.415c-.08.48.278.915.742.915h3.386l-.12.786c-.71.45.27.859.731.859h3.013c.338 0 .635-.255.69-.59l.028-.15.537-3.42.035-.189a.699.699 0 0 1 .69-.59h.435c2.816 0 5.015-1.146 5.66-4.462.272-1.386.131-2.544-.533-3.356a2.212 2.212 0 0 0-.626-.63z"
        fill="#012169"
      />
      <path
        d="M18.577 9.08a4.56 4.56 0 0 0-.57-.172 7.56 7.56 0 0 0-1.17-.085h-3.56a.7.7 0 0 0-.69.59l-.925 5.847-.026.17a.741.741 0 0 1 .731-.859h1.52c3.023 0 5.383-1.225 6.074-4.773.02-.108.038-.214.054-.317.145-.822.098-1.502-.438-2.005a2.177 2.177 0 0 0-1-.396z"
        fill="#003087"
      />
      <path
        d="M10.137 9.413a.7.7 0 0 1 .69-.59h3.56c.41 0 .794.027 1.17.086.371.058.704.145 1.003.26.247.093.468.205.662.336.145-.822.098-1.502-.437-2.005-.59-.555-1.655-.793-3.02-.793H9.529c-.367 0-.683.262-.742.622L6.06 18.415c-.08.48.278.915.742.915h3.386l.85-5.401.9-4.516z"
        fill="#001C64"
      />
    </svg>
  );
}

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 39.99,
    tax: 3.20,
    shipping: 6.80,
    total: 49.99,
  });
  
  // Simulated order details
  const orderItems = [
    {
      id: '1',
      name: 'Premium Makeup Bundle',
      price: 39.99,
      quantity: 1,
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Choose how you want to pay
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs 
                defaultValue="card"
                className="w-full"
                onValueChange={(value) => setPaymentMethod(value as 'card' | 'paypal')}
              >
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="card" className="flex items-center gap-2" data-cy="payment-method-card">
                    <CreditCard className="h-4 w-4" />
                    Credit Card
                  </TabsTrigger>
                  <TabsTrigger value="paypal" className="flex items-center gap-2" data-cy="payment-method-paypal">
                    <PaypalIcon className="h-4 w-4" />
                    PayPal
                  </TabsTrigger>
                </TabsList>
                
                <div className="mt-4 space-y-4" data-cy="payment-methods">
                  <TabsContent value="card">
                    <PaymentFormWrapper
                      amount={orderSummary.total}
                      currency="usd"
                      description="Payment for Premium Makeup Bundle"
                    />
                  </TabsContent>
                  
                  <TabsContent value="paypal">
                    <div className="text-center p-8 border rounded-md">
                      <PaypalIcon className="h-16 w-16 mx-auto mb-4 text-blue-600" />
                      <p className="text-lg font-medium mb-4">Pay with PayPal</p>
                      <p className="text-gray-500 mb-8">
                        You will be redirected to PayPal to complete your payment securely.
                      </p>
                      <Button className="w-full bg-[#0070ba] hover:bg-[#003087]">
                        Continue to PayPal
                      </Button>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p>${item.price.toFixed(2)}</p>
                </div>
              ))}
              
              <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>${orderSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax</span>
                  <span>${orderSummary.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span>${orderSummary.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>${orderSummary.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Alert>
                <AlertTitle>Secure Checkout</AlertTitle>
                <AlertDescription>
                  Your payment information is encrypted and secure.
                </AlertDescription>
              </Alert>
              <div className="text-center text-sm text-gray-500">
                <p>By completing this purchase, you agree to our</p>
                <div className="flex justify-center space-x-2">
                  <Link href="/terms" className="underline">Terms of Service</Link>
                  <span>and</span>
                  <Link href="/privacy" className="underline">Privacy Policy</Link>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 