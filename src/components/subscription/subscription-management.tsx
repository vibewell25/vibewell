import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/icons';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth';

interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodEnd: string;
  plan: {
    id: string;
    name: string;
    price: number;
    interval: 'month' | 'year';
  };
}

interface SubscriptionManagementProps {
  className?: string;
}

export function SubscriptionManagement({ className = '' }: SubscriptionManagementProps) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions/me');
      if (!response.ok) throw new Error('Failed to fetch subscription');
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    try {
      setCancelling(true);
      const response = await fetch('/api/subscriptions/me/cancel', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to cancel subscription');

      const data = await response.json();
      setSubscription(data);

      toast({
        title: 'Subscription Cancelled',
        description: 'Your subscription will end at the current billing period',
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription',
        variant: 'destructive',
      });
    } finally {
      setCancelling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscription) return;

    try {
      const response = await fetch('/api/subscriptions/me/reactivate', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to reactivate subscription');

      const data = await response.json();
      setSubscription(data);

      toast({
        title: 'Subscription Reactivated',
        description: 'Your subscription has been successfully reactivated',
      });
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to reactivate subscription',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icons.Spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            You don't have an active subscription. Choose a plan to get started.
          </p>
          <Button onClick={() => window.location.href = '/pricing'}>
            View Plans
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Your Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{subscription.plan.name}</h3>
              <p className="text-sm text-gray-600">
                ${subscription.plan.price}/{subscription.plan.interval}
              </p>
            </div>
            <Badge variant={subscription.status === 'active' ? 'success' : 'warning'}>
              {subscription.status === 'active' ? 'Active' : 'Cancelled'}
            </Badge>
          </div>

          <div className="text-sm text-gray-600">
            {subscription.status === 'active' ? (
              <>
                <p>Next billing date: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
                <Button
                  variant="outline"
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  className="mt-4"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                </Button>
              </>
            ) : (
              <>
                <p>
                  Your subscription will end on{' '}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
                <Button
                  onClick={handleReactivateSubscription}
                  className="mt-4"
                >
                  Reactivate Subscription
                </Button>
              </>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium mb-2">Billing History</h4>
            <Button variant="outline" onClick={() => window.location.href = '/billing'}>
              View Billing History
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 