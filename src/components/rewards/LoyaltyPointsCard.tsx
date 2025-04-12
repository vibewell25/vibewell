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
export const LoyaltyPointsCard: React.FC<LoyaltyPointsCardProps> = ({
  points,
  level,
  nextLevelPoints,
  rewards,
  onRedeem,
}) => {
  const progress = (points / nextLevelPoints) * 100;
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Loyalty Points</h2>
          <p className="text-sm text-gray-500">Level {level}</p>
        </div>
        <div className="flex items-center">
          <Icons.StarIcon className="h-8 w-8 text-yellow-400" />
          <span className="ml-2 text-3xl font-bold text-gray-900">{points}</span>
        </div>
      </div>
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Progress to next level</span>
          <span>{points}/{nextLevelPoints} points</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-yellow-400 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Available Rewards</h3>
        {rewards.map((reward) => (
          <div
            key={reward.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center">
              <Icons.GiftIcon className="h-6 w-6 text-indigo-500" />
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">{reward.name}</h4>
                <p className="text-sm text-gray-500">{reward.description}</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-900 mr-4">
                {reward.points} points
              </span>
              <button
                onClick={() => onRedeem(reward.id)}
                disabled={!reward.isRedeemable}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium
                  ${reward.isRedeemable
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                Redeem
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center text-sm text-gray-500">
        <Icons.SparklesIcon className="h-5 w-5 mr-2" />
        <span>Earn points by booking services, completing wellness content, and making purchases</span>
      </div>
    </div>
  );
}; 