'use client';

import { Icons } from '@/components/icons';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

interface LoyaltyTransaction {
  id: string;
  points: number;
  type: string;
  description: string;
  date: string;
}

interface LoyaltyData {
  points: number;
  level: string;
  benefits: string[];
  progress: number;
  nextLevel: string | null;
  pointsToNextLevel: number;
  transactions: LoyaltyTransaction[];
}

export function LoyaltyPoints() {
  const [data, setData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoyaltyData = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
      try {
        const response = await fetch('/api/rewards/points');
        if (!response?.ok) {
          throw new Error('Failed to fetch loyalty data');
        }
        const data = await response?.json();
        setData(data);
      } catch (error) {
        console?.error('Error fetching loyalty data:', error);
        toast?.error('Failed to load loyalty information');
      } finally {
        setLoading(false);
      }
    };
    fetchLoyaltyData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="mb-4 h-8 w-1/4 rounded bg-gray-200"></div>
          <div className="mb-8 h-4 w-1/2 rounded bg-gray-200"></div>
          <div className="mb-8 h-32 rounded bg-gray-200"></div>
          <div className="mb-4 h-4 w-3/4 rounded bg-gray-200"></div>
          <div className="h-4 w-1/2 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Failed to load loyalty information</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Points and Level Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{data?.points} Points</h2>
              <p className="text-muted-foreground">Current Balance</p>
            </div>
            <Badge variant="secondary" className="text-lg">
              {data?.level}
            </Badge>
          </div>
          {data?.nextLevel && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{data?.points} points</span>
                <span>
                  {data?.nextLevel} ({data?.pointsToNextLevel} points needed)
                </span>
              </div>
              <Progress value={data?.progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
      {/* Benefits Card */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Icons?.GiftIcon className="h-5 w-5" />
            Current Benefits
          </h3>
          <ul className="space-y-2">
            {data?.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-2">
                <Icons?.StarIcon className="h-4 w-4 text-yellow-400" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      {/* Recent Transactions Card */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Icons?.ClockIcon className="h-5 w-5" />
            Recent Transactions
          </h3>
          <div className="space-y-4">
            {data?.transactions.map((transaction) => (
              <div key={transaction?.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{transaction?.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(transaction?.date), 'MMM d, yyyy')}
                  </p>
                </div>
                <Badge
                  variant={transaction?.points > 0 ? 'default' : 'destructive'}
                  className="text-sm"
                >
                  {transaction?.points > 0 ? '+' : ''}
                  {transaction?.points} points
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
