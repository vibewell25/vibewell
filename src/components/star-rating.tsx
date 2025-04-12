'use client';

import { Icons } from '@/components/icons';
import { useState, useEffect } from 'react';
interface StarRatingProps {
  initialRating?: number | null;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  onChange?: (rating: number) => void;
  showCount?: boolean;
  count?: number;
}
export function StarRating({
  initialRating = null,
  size = 'md',
  readonly = false,
  onChange,
  showCount = false,
  count = 0
}: StarRatingProps) {
  const [rating, setRating] = useState<number | null>(initialRating);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);
  // Size mapping
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };
  const starClass = sizeClasses[size];
  // Handle star click
  const handleStarClick = (selectedRating: number) => {
    if (readonly) return;
    setRating(selectedRating);
    onChange && onChange(selectedRating);
  };
  // Format the display of count
  const formatCount = (count: number): string => {
    if (count === 0) return '';
    if (count < 1000) return `(${count})`;
    return `(${(count / 1000).toFixed(1)}k)`;
  };
  return (
    <div className="flex items-center">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => {
          const isHighlighted = (hover || rating || 0) >= star;
          return (
            <button
              key={star}
              type="button"
              className={`${readonly ? 'cursor-default' : 'cursor-pointer'} p-1 focus:outline-none`}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => !readonly && setHover(star)}
              onMouseLeave={() => !readonly && setHover(null)}
              disabled={readonly}
              aria-label={`Rate ${star} out of 5 stars`}
            >
              {isHighlighted ? (
                <Icons.StarSolid className={`${starClass} text-yellow-400`} />
              ) : (
                <Icons.StarIcon className={`${starClass} text-gray-300`} />
              )}
            </button>
          );
        })}
      </div>
      {showCount && (
        <span className="ml-2 text-sm text-gray-500">
          {formatCount(count)}
        </span>
      )}
    </div>
  );
} 