'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { Icons } from '@/components/icons';
interface Reward {
  id: string;
  name: string;
  description: string;
  points: number;
  imageUrl: string;
  category: string;
  available: boolean;
}
export default function RewardsCatalogPage() {
  const router = useRouter();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);
  useEffect(() => {
    const checkAuth = async () => {
      const session = await getServerSession(authOptions);
      if (!session) {
        router.push('/login');
      }
    };
    checkAuth();
    const fetchData = async () => {
      try {
        const [rewardsResponse, pointsResponse] = await Promise.all([
          fetch('/api/rewards/catalog'),
          fetch('/api/rewards/points'),
        ]);
        if (!rewardsResponse.ok || !pointsResponse.ok) {
          throw new Error('Failed to fetch data');
        }
        const rewardsData = await rewardsResponse.json();
        const pointsData = await pointsResponse.json();
        setRewards(rewardsData);
        setUserPoints(pointsData.points);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load rewards catalog');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);
  const handleRedeem = async (rewardId: string, points: number) => {
    if (userPoints < points) {
      toast.error('Not enough points to redeem this reward');
      return;
    }
    try {
      const response = await fetch(`/api/rewards/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rewardId }),
      });
      if (!response.ok) {
        throw new Error('Failed to redeem reward');
      }
      const data = await response.json();
      setUserPoints(data.newPoints);
      toast.success('Reward redeemed successfully!');
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast.error('Failed to redeem reward');
    }
  };
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-1/4 rounded bg-gray-200"></div>
            <div className="grid gap-6 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 rounded bg-gray-200"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Rewards Catalog</h1>
          <div className="flex items-center gap-2">
            <Icons.StarIcon className="h-5 w-5 text-yellow-400" />
            <span className="font-semibold">{userPoints} points</span>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {rewards.map((reward) => (
            <Card key={reward.id} className="overflow-hidden">
              <div className="relative aspect-video bg-gray-100">
                <img
                  src={reward.imageUrl}
                  alt={reward.name}
                  className="h-full w-full object-cover"
                />
                <Badge
                  variant={reward.available ? 'default' : 'secondary'}
                  className="absolute right-2 top-2"
                >
                  {reward.available ? 'Available' : 'Out of Stock'}
                </Badge>
              </div>
              <CardHeader>
                <CardTitle>{reward.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">{reward.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icons.StarIcon className="h-5 w-5 text-yellow-400" />
                    <span className="font-semibold">{reward.points} points</span>
                  </div>
                  <Button
                    onClick={() => handleRedeem(reward.id, reward.points)}
                    disabled={!reward.available || userPoints < reward.points}
                  >
                    <Icons.GiftIcon className="mr-2 h-5 w-5" />
                    Redeem
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
