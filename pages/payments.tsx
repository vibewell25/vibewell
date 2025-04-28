import type { NextPage } from 'next';
import { useState, useEffect, FormEvent } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

type Subscription = {
  stripeSubscriptionId: string;
  priceId: string;
  status: string;
};

const Payments: NextPage = () => {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [newPriceId, setNewPriceId] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchSubs = async () => {
    const res = await fetch('/api/stripe/subscriptions');
    const data = await res.json();
    setSubs(data.subscriptions || []);
  };

  useEffect(() => { fetchSubs(); }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this subscription?')) return;
    await fetch('/api/stripe/subscriptions/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId: id }),
    });
    fetchSubs();
  };

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPriceId) return alert('Enter a price ID');
    setLoading(true);
    const res = await fetch('/api/stripe/checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId: newPriceId, successUrl: window.location.href, cancelUrl: window.location.href, mode: 'subscription' }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else {
      alert('Error creating checkout session');
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Payments</h1>
      <form onSubmit={handleSubscribe} className="flex mb-4">
        <Input
          type="text"
          placeholder="Price ID"
          value={newPriceId}
          onChange={e => setNewPriceId(e.target.value)}
          className="mr-2 flex-grow"
        />
        <Button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Subscribe'}</Button>
      </form>
      <h2>Current Subscriptions</h2>
      <div>
        {subs.map(s => (
          <Card key={s.stripeSubscriptionId} className="mb-2 flex justify-between items-center">
            <div>
              <strong>{s.priceId}</strong> – {s.status}
            </div>
            <Button className="px-2 py-1 text-sm" onClick={() => handleCancel(s.stripeSubscriptionId)}>Cancel</Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Payments;
