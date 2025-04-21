import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import type { Subscription, User } from '@prisma/client';

interface SubscriptionManagementProps {
  subscription: Subscription & {
    user: User;
  };
}

export function SubscriptionManagement({ subscription }: SubscriptionManagementProps) {
  const router = useRouter();
  const [status, setStatus] = useState(subscription.status);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription status');
      }

      setStatus(newStatus);
      toast({
        title: 'Success',
        description: 'Subscription status updated successfully',
      });
      router.refresh();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to update subscription status',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel this subscription?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      toast({
        title: 'Success',
        description: 'Subscription cancelled successfully',
      });
      router.refresh();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Details</CardTitle>
        <CardDescription>Manage subscription for {subscription.user.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Status</p>
              <Select value={status} onValueChange={handleStatusChange} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm font-medium">Plan</p>
              <p className="text-sm">{subscription.plan}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Start Date</p>
              <p className="text-sm">{new Date(subscription.startDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Next Billing Date</p>
              <p className="text-sm">
                {new Date(subscription.nextBillingDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={isLoading || status === 'cancelled'}
            >
              Cancel Subscription
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
