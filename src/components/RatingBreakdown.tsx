import { Star } from 'lucide-react';

interface RatingDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

interface RatingBreakdownProps {
  distribution: RatingDistribution;
  totalReviews: number;
  averageRating: number;
}

export default function RatingBreakdown({
  distribution,
  totalReviews,
  averageRating,
}: RatingBreakdownProps) {
  // Function to calculate percentage for a given rating
  const calculatePercentage = (rating: 1 | 2 | 3 | 4 | 5): number => {
    if (totalReviews === 0) return 0;
    return (distribution[rating] / totalReviews) * 100;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-6">
        <div className="flex items-center">
          <span className="text-4xl font-bold mr-2">{averageRating.toFixed(1)}</span>
          <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" fill="currentColor" />
        </div>
        <div className="ml-4 text-sm text-gray-500">
          Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
        </div>
      </div>
      <div className="space-y-3">
        {/* 5 star rating */}
        <div className="flex items-center">
          <div className="w-24 flex items-center">
            <span className="text-sm font-medium mr-2">5</span>
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" fill="currentColor" />
          </div>
          <div className="flex-1">
            <div className="bg-gray-200 rounded-full h-2.5 w-full">
              <div
                className="bg-yellow-400 h-2.5 rounded-full"
                style={{ width: `${calculatePercentage(5)}%` }}
              ></div>
            </div>
          </div>
          <div className="w-16 text-right text-sm text-gray-600">
            {distribution[5]} ({calculatePercentage(5).toFixed(0)}%)
          </div>
        </div>
        {/* 4 star rating */}
        <div className="flex items-center">
          <div className="w-24 flex items-center">
            <span className="text-sm font-medium mr-2">4</span>
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" fill="currentColor" />
          </div>
          <div className="flex-1">
            <div className="bg-gray-200 rounded-full h-2.5 w-full">
              <div
                className="bg-yellow-400 h-2.5 rounded-full"
                style={{ width: `${calculatePercentage(4)}%` }}
              ></div>
            </div>
          </div>
          <div className="w-16 text-right text-sm text-gray-600">
            {distribution[4]} ({calculatePercentage(4).toFixed(0)}%)
          </div>
        </div>
        {/* 3 star rating */}
        <div className="flex items-center">
          <div className="w-24 flex items-center">
            <span className="text-sm font-medium mr-2">3</span>
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" fill="currentColor" />
          </div>
          <div className="flex-1">
            <div className="bg-gray-200 rounded-full h-2.5 w-full">
              <div
                className="bg-yellow-400 h-2.5 rounded-full"
                style={{ width: `${calculatePercentage(3)}%` }}
              ></div>
            </div>
          </div>
          <div className="w-16 text-right text-sm text-gray-600">
            {distribution[3]} ({calculatePercentage(3).toFixed(0)}%)
          </div>
        </div>
        {/* 2 star rating */}
        <div className="flex items-center">
          <div className="w-24 flex items-center">
            <span className="text-sm font-medium mr-2">2</span>
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" fill="currentColor" />
          </div>
          <div className="flex-1">
            <div className="bg-gray-200 rounded-full h-2.5 w-full">
              <div
                className="bg-yellow-400 h-2.5 rounded-full"
                style={{ width: `${calculatePercentage(2)}%` }}
              ></div>
            </div>
          </div>
          <div className="w-16 text-right text-sm text-gray-600">
            {distribution[2]} ({calculatePercentage(2).toFixed(0)}%)
          </div>
        </div>
        {/* 1 star rating */}
        <div className="flex items-center">
          <div className="w-24 flex items-center">
            <span className="text-sm font-medium mr-2">1</span>
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" fill="currentColor" />
          </div>
          <div className="flex-1">
            <div className="bg-gray-200 rounded-full h-2.5 w-full">
              <div
                className="bg-yellow-400 h-2.5 rounded-full"
                style={{ width: `${calculatePercentage(1)}%` }}
              ></div>
            </div>
          </div>
          <div className="w-16 text-right text-sm text-gray-600">
            {distribution[1]} ({calculatePercentage(1).toFixed(0)}%)
          </div>
        </div>
      </div>
    </div>
  );
}
