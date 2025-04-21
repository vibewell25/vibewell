import { useState, useEffect } from 'react';
import { prisma } from '@/lib/database/client';

// Define types for the reviews
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

interface ReviewInput {
  title: string;
  text: string;
  rating: number;
}

// Create supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Custom hook for managing reviews
 */
export default function useReviews(providerId?: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch reviews (optionally filtered by provider ID)
  const fetchReviews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase.from('reviews').select('*, customer:profiles(*)');

      if (providerId) {
        query = query.eq('provider_id', providerId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw new Error(error.message);

      setReviews(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching reviews');
      console.error('Error fetching reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new review
  const addReview = async (review: ReviewInput, providerId: string, bookingId?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Call the API endpoint
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...review,
          providerId,
          bookingId,
        }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Could not create review');

      // Refresh the list of reviews
      await fetchReviews();

      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while adding the review');
      console.error('Error adding review:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update a review
  const updateReview = async (reviewId: string, updates: Partial<ReviewInput>) => {
    setIsLoading(true);
    setError(null);

    try {
      // Call the API endpoint
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Could not update review');

      // Refresh the list of reviews
      await fetchReviews();

      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the review');
      console.error('Error updating review:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a review
  const deleteReview = async (reviewId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Call the API endpoint
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Could not delete review');

      // Refresh the list of reviews
      await fetchReviews();

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the review');
      console.error('Error deleting review:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch a single review by ID
  const getReviewById = async (reviewId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, customer:profiles(*)')
        .eq('id', reviewId)
        .single();

      if (error) throw new Error(error.message);

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching the review');
      console.error('Error fetching review:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate average rating
  const getAverageRating = (): number => {
    if (reviews.length === 0) return 0;

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return parseFloat((sum / reviews.length).toFixed(1));
  };

  // Load reviews on mount or when providerId changes
  useEffect(() => {
    fetchReviews();
  }, [providerId]);

  return {
    reviews,
    isLoading,
    error,
    fetchReviews,
    addReview,
    updateReview,
    deleteReview,
    getReviewById,
    getAverageRating,
  };
}
