import { Icons } from '@/components/icons';
import React from 'react';
interface LoyaltyPointsCardProps {
  points: number;
  level: number;
  nextLevelPoints: number;
  rewards: {
    id: string;
    name: string;
    points: number;
    description: string;
    isRedeemable: boolean;
  }[];
  onRedeem: (rewardId: string) => void;
}
export {};
