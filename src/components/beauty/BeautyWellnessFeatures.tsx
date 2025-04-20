import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface BeautyServiceReview {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: Date;
}

interface BeautyWellnessFeaturesProps {
  serviceId: string;
  serviceName: string;
  reviews: BeautyServiceReview[];
}

export function BeautyWellnessFeatures({
  serviceId,
  serviceName,
  reviews
}: BeautyWellnessFeaturesProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  const handleSubmitReview = async () => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          rating,
          comment
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      toast({
        title: 'Review Submitted',
        description: 'Thank you for your feedback!'
      });

      setShowReviewForm(false);
      setComment('');
      setRating(5);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Beauty & Wellness Tips</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Preparation Tips</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Arrive 10 minutes before your appointment</li>
              <li>Avoid heavy meals before the session</li>
              <li>Wear comfortable clothing</li>
              <li>Bring any relevant medical history</li>
            </ul>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Aftercare Instructions</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Stay hydrated</li>
              <li>Follow recommended product routine</li>
              <li>Book follow-up appointments as advised</li>
              <li>Note any unusual reactions</li>
            </ul>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Client Reviews</h3>
          <Button
            variant="outline"
            onClick={() => setShowReviewForm(!showReviewForm)}
          >
            {showReviewForm ? 'Cancel Review' : 'Write Review'}
          </Button>
        </div>

        {showReviewForm && (
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    variant={rating === value ? 'default' : 'outline'}
                    onClick={() => setRating(value)}
                    className="w-10 h-10"
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Your Review</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                className="min-h-[100px]"
              />
            </div>
            <Button onClick={handleSubmitReview}>Submit Review</Button>
          </Card>
        )}

        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{review.userName}</span>
                    <span className="text-sm text-muted-foreground">
                      {review.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-2 text-sm">{review.comment}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 