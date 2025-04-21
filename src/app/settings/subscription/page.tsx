'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/unified-auth-context';
import { analytics } from '@/utils/analytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDeviceType } from '@/utils/responsive';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
}

interface UserSubscription {
  status: string;
  plan: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

const plans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    interval: 'month',
    features: ['Access to basic workouts', 'Progress tracking', 'Community forum access'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    interval: 'month',
    features: [
      'All Basic features',
      'Personalized workout plans',
      'Video consultations',
      'Priority support',
      'Exclusive content',
    ],
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 29.99,
    interval: 'month',
    features: [
      'All Premium features',
      'One-on-one coaching',
      'Custom meal plans',
      'Advanced analytics',
      'API access',
    ],
  },
];

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const deviceType = useDeviceType();

  useEffect(() => {
    fetchSubscription();
    analytics.trackPageView('/settings/subscription');
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions/current');
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      analytics.trackError(error as Error);
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      setProcessing(true);
      analytics.trackEvent({
        name: 'subscription_started',
        properties: { planId },
        category: 'user',
      });

      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      analytics.trackError(error as Error);
      console.error('Error creating subscription:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    try {
      setProcessing(true);
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
      });

      if (response.ok) {
        analytics.trackEvent({
          name: 'subscription_cancelled',
          category: 'user',
        });
        await fetchSubscription();
      }
    } catch (error) {
      analytics.trackError(error as Error);
      console.error('Error cancelling subscription:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Subscription Management</h1>

      {subscription && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>Your {subscription.plan} plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium">
                  Status:{' '}
                  <span
                    className={`${
                      subscription.status === 'active' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {subscription.status}
                  </span>
                </p>
                <p>Renews on: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
              </div>

              {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                <Button variant="destructive" onClick={handleCancel} disabled={processing}>
                  Cancel Subscription
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map(plan => (
          <Card
            key={plan.id}
            className={`${subscription?.plan === plan.id ? 'ring-2 ring-primary' : ''}`}
          >
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                ${plan.price}/{plan.interval}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                variant={subscription?.plan === plan.id ? 'secondary' : 'default'}
                className="w-full"
                size={deviceType === 'mobile' ? 'sm' : 'default'}
                disabled={processing || subscription?.plan === plan.id}
                onClick={() => handleSubscribe(plan.id)}
              >
                {subscription?.plan === plan.id ? 'Current Plan' : 'Subscribe'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
