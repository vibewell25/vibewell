import { Star } from 'lucide-react';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// Define form schema with zod
const reviewSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be at most 100 characters'),
  text: z
    .string()
    .min(10, 'Review text must be at least 10 characters')
    .max(1000, 'Review text must be at most 1000 characters'),
  rating: z.number().min(1, 'Please select a rating').max(5, 'Maximum rating is 5 stars'),
});
type ReviewFormInputs = z.infer<typeof reviewSchema>;
interface ReviewFormProps {
  providerId: string;
  bookingId?: string; // Optional booking ID
  initialData?: {
    title: string;
    text: string;
    rating: number;
  };
  isEdit?: boolean;
  onSubmit: (data: ReviewFormInputs) => Promise<void>;
  onCancel?: () => void;
}
export default function ReviewForm({
  providerId,
  bookingId,
  initialData,
  isEdit = false,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const [hover, setHover] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch
  } = useForm<ReviewFormInputs>({
    resolver: zodResolver(reviewSchema),
    defaultValues: initialData || {
      title: '',
      text: '',
      rating: 0,
    },
  });
  const currentRating = watch('rating');
  const handleRatingClick = (rating: number) => {
    setValue('rating', rating, { shouldValidate: true });
  };
  const submitHandler: SubmitHandler<ReviewFormInputs> = async (data) => {
    setSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <form onSubmit={handleSubmit(submitHandler)} className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold">
        {isEdit ? 'Edit Your Review' : 'Write a Review'}
      </h2>
      <div className="mb-4">
        <label className="mb-2 block font-medium text-gray-700">Rating</label>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              type="button"
              key={rating}
              onClick={() => handleRatingClick(rating)}
              onMouseEnter={() => setHover(rating)}
              onMouseLeave={() => setHover(null)}
              className="focus:outline-none"
            >
              <Star
                className={`h-8 w-8 text-yellow-400 ${rating <= (hover !== null ? hover : currentRating) ? 'fill-yellow-400' : ''}`}
                fill={rating <= (hover !== null ? hover : currentRating) ? 'currentColor' : 'none'}
              />
            </button>
          ))}
        </div>
        {errors.rating && <p className="mt-1 text-sm text-red-500">{errors.rating.message}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="title" className="mb-2 block font-medium text-gray-700">
          Title
        </label>
        <input
          id="title"
          type="text"
          className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Summarize your experience"
          {...register('title')}
        />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
      </div>
      <div className="mb-6">
        <label htmlFor="text" className="mb-2 block font-medium text-gray-700">
          Review
        </label>
        <textarea
          id="text"
          rows={4}
          className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Share your experience with this service provider"
          {...register('text')}
        ></textarea>
        {errors.text && <p className="mt-1 text-sm text-red-500">{errors.text.message}</p>}
      </div>
      <div className="flex justify-end space-x-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            disabled={submitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
          disabled={submitting}
        >
          {submitting ? (
            <span className="flex items-center">
              <svg
                className="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : isEdit ? (
            'Update Review'
          ) : (
            'Submit Review'
          )}
        </button>
      </div>
    </form>
  );
}
