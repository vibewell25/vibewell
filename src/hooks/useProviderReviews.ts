import { useState, useEffect } from 'react';
import useReviews from './useReviews';

// Define the Review interface to match the one from useReviews
interface Review {
  id: string;
  title: string;
  text: string;
  rating: number;
  created_at: string;
  provider_id: string;
  customer_id: string;
  booking_id?: string;
  customer: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

// Extend the Review interface to include categories
interface ReviewWithCategories extends Review {
  categories?: {
    cleanliness?: number;
    value?: number;
    service?: number;
    communication?: number;
    expertise?: number;
  };
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  categories?: {
    cleanliness: number;
    value: number;
    service: number;
    communication: number;
    expertise: number;
  };
}

/**
 * Custom hook that provides enhanced review functionality specifically for provider profiles
 */
export default function useProviderReviews(providerId?: string) {
  const [summary, setSummary] = useState<ReviewSummary>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    },
    categories: {
      cleanliness: 0,
      value: 0,
      service: 0,
      communication: 0,
      expertise: 0,
    },
  });

  // Use the base reviews hook
  const {
    reviews: baseReviews,
    isLoading,
    error,
    fetchReviews,
    addReview,
    updateReview,
    deleteReview,
    getAverageRating,
  } = useReviews(providerId);

  // Cast reviews to include the categories
  const reviews = baseReviews as ReviewWithCategories[];

  // Calculate detailed stats when reviews change
  useEffect(() => {
    if (reviews.length === 0) {
      setSummary({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        categories: {
          cleanliness: 0,
          value: 0,
          service: 0,
          communication: 0,
          expertise: 0,
        },
      });
      return;
    }

    // Calculate rating distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      // Increment the corresponding rating count
      const rating = Math.floor(review.rating) as 1 | 2 | 3 | 4 | 5;
      distribution[rating]++;
    });

    // Calculate category averages if available
    const categoryTotals = {
      cleanliness: 0,
      value: 0,
      service: 0,
      communication: 0,
      expertise: 0,
    };

    let categoryCount = 0;

    reviews.forEach(review => {
      if (review.categories) {
        categoryCount++;
        categoryTotals.cleanliness += review.categories.cleanliness || 0;
        categoryTotals.value += review.categories.value || 0;
        categoryTotals.service += review.categories.service || 0;
        categoryTotals.communication += review.categories.communication || 0;
        categoryTotals.expertise += review.categories.expertise || 0;
      }
    });

    const categoryAverages =
      categoryCount > 0
        ? {
            cleanliness: parseFloat((categoryTotals.cleanliness / categoryCount).toFixed(1)),
            value: parseFloat((categoryTotals.value / categoryCount).toFixed(1)),
            service: parseFloat((categoryTotals.service / categoryCount).toFixed(1)),
            communication: parseFloat((categoryTotals.communication / categoryCount).toFixed(1)),
            expertise: parseFloat((categoryTotals.expertise / categoryCount).toFixed(1)),
          }
        : undefined;

    setSummary({
      averageRating: getAverageRating(),
      totalReviews: reviews.length,
      ratingDistribution: distribution,
      categories: categoryAverages,
    });
  }, [reviews, getAverageRating]);

  // Get the percentage of each rating
  const getRatingPercentage = (rating: 1 | 2 | 3 | 4 | 5): number => {
    if (summary.totalReviews === 0) return 0;
    return (summary.ratingDistribution[rating] / summary.totalReviews) * 100;
  };

  // Get the most recent n reviews
  const getRecentReviews = (count: number = 3) => {
    return reviews.slice(0, count);
  };

  // Get reviews filtered by rating
  const getReviewsByRating = (rating: number) => {
    return reviews.filter(review => Math.floor(review.rating) === rating);
  };

  return {
    reviews,
    summary,
    isLoading,
    error,
    fetchReviews,
    addReview,
    updateReview,
    deleteReview,
    getRatingPercentage,
    getRecentReviews,
    getReviewsByRating,
  };
}
