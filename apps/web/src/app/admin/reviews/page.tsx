'use client';
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReviewCard from '@/components/ReviewCard';
import { Icons } from '@/components/icons';
interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}
interface Provider {
  id: string;
  name: string;
  avatar_url?: string;
}
interface Review {
  id: string;
  title: string;
  text: string;
  rating: number;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  customer: User;
  provider: Provider;
  moderationNotes?: string;
  isReported?: boolean;
  reportReason?: string;
  reportedBy?: User;
}
export default function AdminReviewsPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [moderationNote, setModerationNote] = useState('');
  // Fetch reviews
  useEffect(() => {
    setIsLoading(true);
    // Mock data - would be replaced with API calls
    setTimeout(() => {
      const mockReviews: Review[] = [
        {
          id: '1',
          title: 'Excellent service',
          text: 'Sarah was amazing! She really understood what style I was going for and executed it perfectly. The salon was clean and welcoming.',
          rating: 5,
          created_at: '2023-10-15T14:30:00Z',
          status: 'pending',
          customer: {
            id: 'u1',
            name: 'John Doe',
            email: 'john@example.com',
            avatar_url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36',
          },
          provider: {
            id: 'p1',
            name: 'Sarah Johnson',
            avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
          },
        },
        {
          id: '2',
          title: 'Great massage',
          text: "Michael's deep tissue massage was just what I needed. Helped with my back pain immensely.",
          rating: 4,
          created_at: '2023-09-22T11:15:00Z',
          status: 'approved',
          customer: {
            id: 'u2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            avatar_url: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12',
          },
          provider: {
            id: 'p2',
            name: 'Michael Chen',
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
          },
        },
        {
          id: '3',
          title: 'Terrible experience',
          text: 'The stylist was an hour late and then rushed through my appointment. My hair looks nothing like what I asked for.',
          rating: 1,
          created_at: '2023-10-05T09:30:00Z',
          status: 'flagged',
          customer: {
            id: 'u3',
            name: 'Amy Wilson',
            email: 'amy@example.com',
            avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
          },
          provider: {
            id: 'p3',
            name: 'Jennifer Adams',
            avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04',
          },
          isReported: true,
          reportReason: 'Provider disputes the facts of this review',
          reportedBy: {
            id: 'p3',
            name: 'Jennifer Adams',
            email: 'jennifer@example.com',
          },
        },
        {
          id: '4',
          title: 'Rude and unprofessional',
          text: 'This person should be fired. Extremely rude and dismissive the entire time.',
          rating: 1,
          created_at: '2023-10-10T13:45:00Z',
          status: 'rejected',
          customer: {
            id: 'u4',
            name: 'Tom Brown',
            email: 'tom@example.com',
            avatar_url: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf',
          },
          provider: {
            id: 'p4',
            name: 'David Lee',
            avatar_url: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c',
          },
          moderationNotes:
            'Review violates our community guidelines by using inflammatory language.',
        },
      ];
      setReviews(mockReviews);
      setIsLoading(false);
    }, 1000);
  }, []);
  // Filter reviews by status and search term
  const filteredReviews = reviews.filter((review) => {
    const matchesStatus = review.status === activeTab || activeTab === 'all';
    const searchContent =
      `${review.title} ${review.text} ${review.customer.name} ${review.provider.name}`.toLowerCase();
    const matchesSearch = searchTerm === '' || searchContent.includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });
  // Approve a review
  const handleApproveReview = (reviewId: string) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === reviewId ? { ...review, status: 'approved' } : review,
      ),
    );
  };
  // Reject a review
  const handleRejectReview = (reviewId: string) => {
    if (selectedReview.id === reviewId && !moderationNote) {
      alert('Please provide a reason for rejection');
      return;
    }
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              status: 'rejected',
              moderationNotes:
                selectedReview.id === reviewId ? moderationNote : review.moderationNotes,
            }
          : review,
      ),
    );
    setSelectedReview(null);
    setModerationNote('');
  };
  // Resolve a flagged review
  const handleResolveFlagged = (reviewId: string) => {
    if (selectedReview.id === reviewId && !moderationNote) {
      alert('Please provide resolution notes');
      return;
    }
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              status: 'approved',
              isReported: false,
              moderationNotes:
                selectedReview.id === reviewId
                  ? `${review.moderationNotes || ''}\n${new Date().toISOString()}: Flag resolved - ${moderationNote}`
                  : review.moderationNotes,
            }
          : review,
      ),
    );
    setSelectedReview(null);
    setModerationNote('');
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Icons.ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <Icons.CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <Icons.XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'flagged':
        return <Icons.FlagIcon className="h-5 w-5 text-orange-500" />;
      default:
        return null;
    }
  };
  return (
    <Layout>
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Review Management</h1>
          <div className="relative">
            <Icons.MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              className="rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-indigo-500 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="pending">
          <TabsList className="mb-8">
            <TabsTrigger value="pending">
              Pending ({reviews.filter((r) => r.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="flagged">
              Flagged ({reviews.filter((r) => r.status === 'flagged').length})
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            {isLoading ? (
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
            ) : filteredReviews.length === 0 ? (
              <div className="rounded-lg bg-white p-8 text-center shadow">
                <p className="mb-2 text-gray-500">No reviews found</p>
                <p className="text-sm text-gray-400">
                  {searchTerm
                    ? 'Try adjusting your search terms'
                    : `There are no ${activeTab} reviews at this time`}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredReviews.map((review) => (
                  <div key={review.id} className="rounded-lg bg-white shadow">
                    <div className="flex items-center justify-between rounded-t-lg border-b border-gray-200 bg-gray-50 px-6 py-4">
                      <div className="flex items-center">
                        {getStatusIcon(review.status)}
                        <span className="ml-2 font-medium capitalize">{review.status}</span>
                        {review.isReported && (
                          <span className="ml-2 rounded bg-red-100 px-2 py-1 text-xs text-red-800">
                            Reported
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Submitted: {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="p-2">
                      <ReviewCard
                        id={review.id}
                        title={review.title}
                        text={review.text}
                        rating={review.rating}
                        createdAt={review.created_at}
                        customer={{
                          id: review.customer.id,
                          name: review.customer.name,
                          avatar_url: review.customer.avatar_url,
                        }}
                      />
                    </div>
                    <div className="flex flex-col border-t border-gray-100 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-gray-500">Customer:</span> {review.customer.name} (
                          {review.customer.email})
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Provider:</span> {review.provider.name}
                        </div>
                      </div>
                      {review.moderationNotes && (
                        <div className="mb-3 rounded bg-gray-50 p-3 text-sm">
                          <div className="mb-1 font-medium text-gray-700">Moderation Notes:</div>
                          <div className="whitespace-pre-line text-gray-600">
                            {review.moderationNotes}
                          </div>
                        </div>
                      )}
                      {review.isReported && (
                        <div className="mb-3 rounded bg-red-50 p-3 text-sm">
                          <div className="mb-1 font-medium text-red-700">Report Reason:</div>
                          <div className="text-red-600">{review.reportReason}</div>
                          <div className="mt-1 text-gray-500">
                            Reported by: {review.reportedBy.name}
                          </div>
                        </div>
                      )}
                      {selectedReview.id === review.id && (
                        <div className="mb-3">
                          <textarea
                            value={moderationNote}
                            onChange={(e) => setModerationNote(e.target.value)}
                            placeholder={
                              review.status === 'flagged'
                                ? 'Enter resolution notes'
                                : 'Enter reason for rejection'
                            }
                            className="w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
                            rows={3}
                          />
                        </div>
                      )}
                      <div className="flex justify-end space-x-2">
                        {review.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50"
                              onClick={() => {
                                setSelectedReview(review);
                                setModerationNote('');
                              }}
                            >
                              <Icons.XCircleIcon className="mr-1 h-4 w-4" />
                              Reject
                            </Button>
                            <Button onClick={() => handleApproveReview(review.id)}>
                              <Icons.CheckCircleIcon className="mr-1 h-4 w-4" />
                              Approve
                            </Button>
                          </>
                        )}
                        {review.status === 'flagged' && (
                          <>
                            <Button
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50"
                              onClick={() => {
                                setSelectedReview(review);
                                setModerationNote('');
                              }}
                            >
                              <Icons.XCircleIcon className="mr-1 h-4 w-4" />
                              Reject
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedReview(review);
                                setModerationNote('');
                              }}
                            >
                              <Icons.CheckCircleIcon className="mr-1 h-4 w-4" />
                              Resolve & Approve
                            </Button>
                          </>
                        )}
                        {selectedReview.id === review.id && (
                          <>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedReview(null);
                                setModerationNote('');
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() =>
                                review.status === 'flagged'
                                  ? handleResolveFlagged(review.id)
                                  : handleRejectReview(review.id)
                              }
                            >
                              Submit
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
