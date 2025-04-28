import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { NextPage } from 'next';
import Button from '../components/ui/Button';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type PaymentMethod = {
  id: string;
  card: { brand: string; last4: string };
};

const Content: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    fetch('/api/stripe/payment-methods')
      .then(res => res.json())
      .then(data => setMethods(data.paymentMethods || []));
  }, []);

  const startAdd = async () => {
    const res = await fetch('/api/stripe/setup-intent', { method: 'POST' });
    const j = await res.json();
    setClientSecret(j.clientSecret);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    const card = elements.getElement(CardElement);
    if (!card) return;
    const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: { card },
    });
    if (error) setMessage(error.message || 'Error');
    else {
      setMessage('Card added');
      setMethods(prev => [
        ...prev,
        { id: setupIntent.payment_method as string, card: (setupIntent as any).payment_method.card },
      ]);
      setClientSecret('');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-4">Payment Methods</h1>
      <h2 className="font-semibold mb-2">Saved Cards</h2>
      {methods.length ? (
        <ul className="list-disc pl-5 mb-4">
          {methods.map(m => (
            <li key={m.id}>{m.card.brand.toUpperCase()} **** {m.card.last4}</li>
          ))}
        </ul>
      ) : (
        <p>No saved cards.</p>
      )}
      <hr className="my-4" />
      <h2 className="font-semibold mb-2">Add New Card</h2>
      {message && <p className="mb-2 text-green-600">{message}</p>}
      {!clientSecret ? (
        <Button onClick={startAdd}>Add Card</Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <CardElement options={{ hidePostalCode: true }} />
          <Button type="submit">Save Card</Button>
        </form>
      )}
    </div>
  );
};

const PaymentMethods: NextPage = () => (
  <Elements stripe={stripePromise}>
    <Content />
  </Elements>
);

export default PaymentMethods;
