'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Layout } from '@/components/layout';
import ReviewsList from '@/components/ReviewsList';
import ReviewForm from '@/components/ReviewForm';
import useReviews from '@/hooks/useReviews';

function ReviewsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const providerId = searchParams.get('providerId');

  const [showReviewForm, setShowReviewForm] = useState(false);

  // Get reviews for the specified provider
  const { reviews, isLoading, error, addReview, getAverageRating } = useReviews(
    providerId || undefined
  );

  const handleAddReview = async (data: { title: string; text: string; rating: number }) => {
    if (!providerId) {
      alert('Provider ID is required to submit a review');
      return;
    }

    try {
      await addReview(data, providerId);
      setShowReviewForm(false);
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  if (!providerId) {
    return (
      <Layout>
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Provider Reviews</h2>
            <p className="text-gray-600 mb-6">
              No provider specified. Please select a provider to view or leave reviews.
            </p>
            <button
              onClick={() => router.push('/providers')}
              className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
            >
              Browse Providers
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Provider Reviews</h1>
              {!isLoading && (
                <div className="flex items-center mt-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(getAverageRating())
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600">
                    {getAverageRating().toFixed(1)} out of 5 ({reviews.length}{' '}
                    {reviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
            >
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </button>
          </div>

          {showReviewForm && (
            <div className="mb-8">
              <ReviewForm
                providerId={providerId}
                onSubmit={handleAddReview}
                onCancel={() => setShowReviewForm(false)}
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
        </div>

        <ReviewsList reviews={reviews} isLoading={isLoading} />
      </div>
    </Layout>
  );
}

export default function ReviewsPage() {
  return (
    <Suspense
      fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}
    >
      <ReviewsContent />
    </Suspense>
  );
}
