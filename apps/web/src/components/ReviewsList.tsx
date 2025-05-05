import { useState } from 'react';
import ReviewCard from './ReviewCard';

interface Review {
  id: string;
  title: string;
  text: string;
  rating: number;
  created_at: string;
  customer: {
    id: string;
    name: string;
    avatar_url?: string;
interface ReviewsListProps {
  reviews: Review[];
  isLoading?: boolean;
  compact?: boolean;
export default function ReviewsList({
  reviews,
  isLoading = false,
  compact = false,
: ReviewsListProps) {
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');

  // Sort reviews based on the selected option
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
else if (sortBy === 'highest') {
      return b.rating - a.rating;
else {
      return a.rating - b.rating;
if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((index) => (
          <div key={index} className="animate-pulse rounded-lg bg-white p-4 shadow">
            <div className="flex items-start">
              <div className="mr-4 h-12 w-12 rounded-full bg-gray-200"></div>
              <div className="flex-1">
                <div className="mb-2 h-4 w-1/4 rounded bg-gray-200"></div>
                <div className="mb-4 h-4 w-1/3 rounded bg-gray-200"></div>
                <div className="mb-2 h-4 w-full rounded bg-gray-200"></div>
                <div className="h-4 w-5/6 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
if (reviews.length === 0) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow">
        <p className="mb-2 text-gray-500">No reviews yet</p>
        <p className="text-sm text-gray-400">Be the first to leave a review!</p>
      </div>
return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Customer Reviews ({reviews.length})</h3>
        <div>
          <label htmlFor="sort-by" className="sr-only">
            Sort by
          </label>
          <select
            id="sort-by"
            className="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'highest' | 'lowest')}
          >
            <option value="newest">Newest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {sortedReviews.map((review) => (
          <ReviewCard
            key={review.id}
            id={review.id}
            title={review.title}
            text={review.text}
            rating={review.rating}
            createdAt={review.created_at}
            customer={review.customer}
            compact={compact}
          />
        ))}
      </div>
    </div>
