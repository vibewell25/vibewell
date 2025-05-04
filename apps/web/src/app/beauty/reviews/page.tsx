'use client';
import { useState } from 'react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
import { Icons } from '@/components/icons';
  StarIcon,
  ChartBarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  FlagIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
interface Review {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  provider: {
    name: string;
    id: string;
    avatar?: string;
  };
  service: string;
  rating: number;
  comment: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  response?: {
    text: string;
    date: string;
  };
}
const reviews: Review[] = [
  {
    id: 'review1',
    user: {
      name: 'Emily Smith',
      avatar: '/users/emily.jpg'
    },
    provider: {
      name: 'Sarah Johnson',
      id: 'provider1'
    },
    service: 'Bridal Makeup',
    rating: 5,
    comment: 'Sarah is amazing! She transformed my look for my wedding day. Highly recommend!',
    date: '2024-03-15',
    status: 'approved',
    response: {
      text: 'Thank you for your kind words, Emily! It was a pleasure working with you on your special day.',
      date: '2024-03-16'
    }
  }
];
const ratingStats = {
  average: 4.8,
  total: 128,
  distribution: {
    5: 85,
    4: 30,
    3: 8,
    2: 3,
    1: 2
  }
};
export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Handle review submission
    setTimeout(() => setIsSubmitting(false), 1000);
  };
  const handleModerateReview = (reviewId: string, action: 'approve' | 'reject') => {
    // Handle review moderation
  };
  return (
    <Layout>
      <div className="container-app py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Reviews & Ratings</h1>
          <p className="text-xl text-muted-foreground">
            Manage and analyze customer reviews
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {/* Stats Overview */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Rating Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold">{ratingStats.average}</div>
                  <div className="flex justify-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icons.StarIcon
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(ratingStats.average)
                            ? 'text-yellow-500'
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Based on {ratingStats.total} reviews
                  </p>
                </div>
                <div className="space-y-2">
                  {Object.entries(ratingStats.distribution)
                    .sort((a, b) => Number(b[0]) - Number(a[0]))
                    .map(([rating, count]) => (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="w-8">{rating} stars</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${(count / ratingStats.total) * 100}%`
                            }}
                          />
                        </div>
                        <span className="w-8 text-right">{count}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Reviews List */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Reviews</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Icons.MagnifyingGlassIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search reviews..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="icon">
                      <Icons.FunnelIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="all">All Reviews</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="mt-4">
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <Card key={review.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-4">
                                <Avatar>
                                  <AvatarImage src={review.user.avatar} />
                                  <AvatarFallback>{review.user.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-medium">{review.user.name}</h3>
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center">
                                      <Icons.StarIcon className="h-4 w-4 text-yellow-500" />
                                      <span className="ml-1">{review.rating}</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                      {review.date}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleModerateReview(review.id, 'approve')}
                                >
                                  <Icons.CheckCircleIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleModerateReview(review.id, 'reject')}
                                >
                                  <Icons.XCircleIcon className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon">
                                  <Icons.FlagIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="mt-4 text-muted-foreground">{review.comment}</p>
                            <div className="mt-2">
                              <Badge variant="outline">{review.service}</Badge>
                            </div>
                            {review.response && (
                              <div className="mt-4 p-4 bg-muted rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={review.provider.avatar} />
                                    <AvatarFallback>{review.provider.name[0]}</AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{review.provider.name}</span>
                                </div>
                                <p className="text-muted-foreground">{review.response.text}</p>
                                <span className="text-xs text-muted-foreground">
                                  {review.response.date}
                                </span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Review Submission Form */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Submit a Review</CardTitle>
            <CardDescription>
              Share your experience with our beauty services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Service</Label>
                  <Input placeholder="Select service" />
                </div>
                <div>
                  <Label>Rating</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10"
                      >
                        <Icons.StarIcon className="h-5 w-5" />
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <Label>Review</Label>
                <Textarea
                  placeholder="Share your experience..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 