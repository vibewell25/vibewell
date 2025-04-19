'use client';

import { Icons } from '@/components/icons';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StarRating } from '@/components/star-rating';
import { getUserRating, saveRating, getAverageRating } from '@/lib/ratings';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/clerk-auth-context';
// Types for reviews
export interface Review {
  id: string;
  resourceId: string;
  resourceType: 'resource' | 'tool' | 'article';
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  isVerified?: boolean;
}
interface ResourceReviewProps {
  resourceId: string;
  resourceType: 'resource' | 'tool' | 'article';
  onReviewAdded?: (review: Review) => void;
}
// Local storage key for reviews
const REVIEWS_STORAGE_KEY = 'vibewell_resource_reviews';
// Get all reviews for a specific resource
export function getResourceReviews(resourceId: string, resourceType: string): Review[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const storedReviews = localStorage.getItem(REVIEWS_STORAGE_KEY);
    const allReviews: Review[] = storedReviews ? JSON.parse(storedReviews) : [];
    return allReviews.filter(
      review => review.resourceId === resourceId && review.resourceType === resourceType
    );
  } catch (error) {
    console.error('Error retrieving reviews:', error);
    return [];
  }
}
// Add a new review
export function addReview(review: Omit<Review, 'id' | 'createdAt'>): Review {
  if (typeof window === 'undefined') {
    throw new Error('Cannot add review in server context');
  }
  try {
    const storedReviews = localStorage.getItem(REVIEWS_STORAGE_KEY);
    const allReviews: Review[] = storedReviews ? JSON.parse(storedReviews) : [];
    // Check if user already reviewed this resource
    const existingIndex = allReviews.findIndex(
      r => r.resourceId === review.resourceId && 
           r.resourceType === review.resourceType && 
           r.userId === review.userId
    );
    const newReview = {
      ...review,
      id: existingIndex >= 0 ? allReviews[existingIndex].id : `review_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    if (existingIndex >= 0) {
      // Update existing review
      allReviews[existingIndex] = newReview;
    } else {
      // Add new review
      allReviews.push(newReview);
    }
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(allReviews));
    return newReview;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
}
export function ResourceReview({ resourceId, resourceType, onReviewAdded }: ResourceReviewProps) {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<{ average: number, count: number }>({ average: 0, count: 0 });
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userReviewed, setUserReviewed] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  // Load initial data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get user's rating for this resource
      const rating = getUserRating(resourceId, resourceType);
      setUserRating(rating);
      // Get average rating
      const avgRating = getAverageRating(resourceId, resourceType);
      setAverageRating(avgRating);
      // Get all reviews for this resource
      const resourceReviews = getResourceReviews(resourceId, resourceType);
      setReviews(resourceReviews);
      // Check if user already reviewed
      if (user) {
        const hasReviewed = resourceReviews.some(review => review.userId === user.id);
        setUserReviewed(hasReviewed);
        if (hasReviewed) {
          const userReview = resourceReviews.find(review => review.userId === user.id);
          if (userReview) {
            setReviewTitle(userReview.title);
            setReviewComment(userReview.comment);
          }
        }
      }
    }
  }, [resourceId, resourceType, user]);
  // Handle rating change
  const handleRatingChange = (rating: number) => {
    setUserRating(rating);
    // Save the rating
    saveRating(resourceId, resourceType, rating);
    // Update average rating
    const newAverage = getAverageRating(resourceId, resourceType);
    setAverageRating(newAverage);
  };
  // Submit review
  const handleSubmitReview = async () => {
    if (!user || !userRating) return;
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call
      const review = {
        resourceId,
        resourceType,
        userId: user.id,
        userName: user.email || 'Anonymous User',
        rating: userRating,
        title: reviewTitle,
        comment: reviewComment,
        isVerified: true
      };
      const savedReview = addReview(review);
      // Update local state
      setUserReviewed(true);
      setReviews(prev => {
        const newReviews = [...prev];
        const existingIndex = newReviews.findIndex(r => r.userId === user.id);
        if (existingIndex >= 0) {
          newReviews[existingIndex] = savedReview;
        } else {
          newReviews.push(savedReview);
        }
        return newReviews;
      });
      // Call the callback if provided
      if (onReviewAdded) {
        onReviewAdded(savedReview);
      }
      // Reset form if editing
      if (!userReviewed) {
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'some time ago';
    }
  };
  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <h3 className="text-xl font-semibold mb-4">Ratings & Reviews</h3>
      {/* Average Rating Display */}
      <div className="flex items-center mb-6">
        <div className="flex flex-col items-center mr-6">
          <span className="text-3xl font-bold text-gray-900">
            {averageRating.average.toFixed(1)}
          </span>
          <StarRating
            initialRating={averageRating.average}
            readonly={true}
            size="md"
          />
          <span className="text-sm text-gray-500 mt-1">
            {averageRating.count} {averageRating.count === 1 ? 'review' : 'reviews'}
          </span>
        </div>
        <div className="flex-grow">
          {user ? (
            userReviewed ? (
              <div>
                <p className="mb-2 text-gray-700">You've already reviewed this {resourceType}.</p>
                <Button 
                  variant="outline" 
                  onClick={() => setShowForm(!showForm)}
                >
                  {showForm ? 'Cancel Edit' : 'Edit Your Review'}
                </Button>
              </div>
            ) : (
              <div>
                <p className="mb-2 text-gray-700">Share your thoughts about this {resourceType}.</p>
                <Button 
                  variant="outline" 
                  onClick={() => setShowForm(!showForm)}
                >
                  Write a Review
                </Button>
              </div>
            )
          ) : (
            <p className="text-gray-700">
              <a href="/auth/sign-in" className="text-blue-600 hover:underline">Sign in</a> to leave a review.
            </p>
          )}
        </div>
      </div>
      {/* Review Form */}
      {user && showForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="font-semibold mb-3">Your Review</h4>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating
            </label>
            <StarRating
              initialRating={userRating}
              onChange={handleRatingChange}
              size="lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <Input
              value={reviewTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReviewTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Review
            </label>
            <textarea
              value={reviewComment}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReviewComment(e.target.value)}
              placeholder="Share your experience with this resource"
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitReview}
              disabled={!userRating || isSubmitting || !reviewTitle.trim() || !reviewComment.trim()}
            >
              {userReviewed ? 'Update Review' : 'Submit Review'}
            </Button>
          </div>
        </div>
      )}
      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-gray-500 italic">No reviews yet. Be the first to review this {resourceType}!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center">
                    <StarRating
                      initialRating={review.rating}
                      readonly={true}
                      size="sm"
                    />
                    <h4 className="ml-2 font-semibold">{review.title}</h4>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Icons.UserIcon className="h-4 w-4 mr-1" />
                    <span>{review.userName}</span>
                    {review.isVerified && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {formatRelativeTime(review.createdAt)}
                </div>
              </div>
              <div className="mt-2 text-gray-700">
                <p>{review.comment}</p>
              </div>
              <div className="mt-2 flex justify-end">
                <button 
                  className="text-xs text-gray-500 flex items-center hover:text-gray-700"
                  title="Report review"
                >
                  <Icons.FlagIcon className="h-3 w-3 mr-1" />
                  Report
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 