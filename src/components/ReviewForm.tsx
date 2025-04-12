import { Icons } from '@/components/icons';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// Define form schema with zod
const reviewSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be at most 100 characters'),
  text: z.string().min(10, 'Review text must be at least 10 characters').max(1000, 'Review text must be at most 1000 characters'),
  rating: z.number().min(1, 'Please select a rating').max(5, 'Maximum rating is 5 stars')
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
  onCancel
}: ReviewFormProps) {
  const [hover, setHover] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ReviewFormInputs>({
    resolver: zodResolver(reviewSchema),
    defaultValues: initialData || {
      title: '',
      text: '',
      rating: 0
    }
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
    <form onSubmit={handleSubmit(submitHandler)} className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">
        {isEdit ? 'Edit Your Review' : 'Write a Review'}
      </h2>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Rating</label>
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
              {rating <= (hover !== null ? hover : currentRating) ? (
                <Icons.StarSolid className="h-8 w-8 text-yellow-400" />
              ) : (
                <Icons.StarIcon className="h-8 w-8 text-yellow-400" />
              )}
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className="text-red-500 text-sm mt-1">{errors.rating.message}</p>
        )}
      </div>
      <div className="mb-4">
        <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
          Title
        </label>
        <input
          id="title"
          type="text"
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Summarize your experience"
          {...register('title')}
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>
      <div className="mb-6">
        <label htmlFor="text" className="block text-gray-700 font-medium mb-2">
          Review
        </label>
        <textarea
          id="text"
          rows={4}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Share your experience with this service provider"
          {...register('text')}
        ></textarea>
        {errors.text && (
          <p className="text-red-500 text-sm mt-1">{errors.text.message}</p>
        )}
      </div>
      <div className="flex justify-end space-x-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={submitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          disabled={submitting}
        >
          {submitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            isEdit ? 'Update Review' : 'Submit Review'
          )}
        </button>
      </div>
    </form>
  );
} 