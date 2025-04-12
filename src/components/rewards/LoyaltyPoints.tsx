import { Icons } from '@/components/icons';
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
    const fetchLoyaltyData = async () => {
      try {
        const response = await fetch('/api/rewards/points');
        if (!response.ok) {
          throw new Error('Failed to fetch loyalty data');
        }
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error('Error fetching loyalty data:', error);
        toast.error('Failed to load loyalty information');
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
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-32 bg-gray-200 rounded mb-8"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load loyalty information</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Points and Level Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{data.points} Points</h2>
              <p className="text-muted-foreground">Current Balance</p>
            </div>
            <Badge variant="secondary" className="text-lg">
              {data.level}
            </Badge>
          </div>
          {data.nextLevel && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{data.points} points</span>
                <span>{data.nextLevel} ({data.pointsToNextLevel} points needed)</span>
              </div>
              <Progress value={data.progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
      {/* Benefits Card */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icons.GiftIcon className="h-5 w-5" />
            Current Benefits
          </h3>
          <ul className="space-y-2">
            {data.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-2">
                <Icons.StarIcon className="h-4 w-4 text-yellow-400" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      {/* Recent Transactions Card */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icons.ClockIcon className="h-5 w-5" />
            Recent Transactions
          </h3>
          <div className="space-y-4">
            {data.transactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(transaction.date), 'MMM d, yyyy')}
                  </p>
                </div>
                <Badge
                  variant={transaction.points > 0 ? 'default' : 'destructive'}
                  className="text-sm"
                >
                  {transaction.points > 0 ? '+' : ''}{transaction.points} points
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 