'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { LoyaltyPoints } from '@/components/rewards/LoyaltyPoints';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GiftIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function RewardsPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getServerSession(authOptions);
      if (!session) {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Rewards & Loyalty</h1>
          <Button onClick={() => router.push('/rewards/catalog')}>
            <GiftIcon className="h-5 w-5 mr-2" />
            View Rewards Catalog
          </Button>
        </div>

        <LoyaltyPoints />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SparklesIcon className="h-5 w-5" />
              How to Earn Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="font-semibold">Service Bookings</h3>
                <ul className="list-disc list-inside text-muted-foreground">
                  <li>10 points per $1 spent</li>
                  <li>50 bonus points for first booking</li>
                  <li>100 bonus points for referrals</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Engagement</h3>
                <ul className="list-disc list-inside text-muted-foreground">
                  <li>25 points for leaving a review</li>
                  <li>50 points for social media sharing</li>
                  <li>100 points for completing your profile</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 