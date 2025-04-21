'use client';
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReviewCard from '@/components/ReviewCard';
import ReviewForm from '@/components/ReviewForm';
import { Icons } from '@/components/icons';
// Mock data types
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
  provider_id: string;
  provider: Provider;
  booking_id: string;
}
interface Service {
  id: string;
  name: string;
  date: string;
  provider: Provider;
  price: number;
}
export default function MyReviewsPage() {
  const [activeTab, setActiveTab] = useState('my-reviews');
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [pendingReviews, setPendingReviews] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  // Fetch user reviews and pending reviews
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
          provider_id: 'p1',
          provider: {
            id: 'p1',
            name: 'Sarah Johnson',
            avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
          },
          booking_id: 'b1',
        },
        {
          id: '2',
          title: 'Great massage',
          text: "Michael's deep tissue massage was just what I needed. Helped with my back pain immensely.",
          rating: 4,
          created_at: '2023-09-22T11:15:00Z',
          provider_id: 'p2',
          provider: {
            id: 'p2',
            name: 'Michael Chen',
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
          },
          booking_id: 'b2',
        },
      ];
      const mockPendingReviews: Service[] = [
        {
          id: 's1',
          name: 'Facial Treatment',
          date: '2023-11-05T16:00:00Z',
          provider: {
            id: 'p3',
            name: 'Emily Rodriguez',
            avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
          },
          price: 85,
        },
        {
          id: 's2',
          name: 'Manicure',
          date: '2023-11-10T13:30:00Z',
          provider: {
            id: 'p4',
            name: 'Lisa Park',
            avatar_url: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56',
          },
          price: 45,
        },
      ];
      setUserReviews(mockReviews);
      setPendingReviews(mockPendingReviews);
      setIsLoading(false);
    }, 1000);
  }, []);
  // Handle review deletion
  const handleDeleteReview = (reviewId: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      // In a real app, we would call an API here
      setUserReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));
    }
  };
  // Handle review edit
  const handleEditReview = (review: Review) => {
    setEditingReview(review);
  };
  // Handle review update
  const handleUpdateReview = async (data: { title: string; text: string; rating: number }) => {
    if (editingReview) {
      // In a real app, we would call an API here
      const updatedReviews = userReviews.map(review =>
        review.id === editingReview.id ? { ...review, ...data } : review
      );
      setUserReviews(updatedReviews);
      setEditingReview(null);
    }
  };
  // Handle new review submission
  const handleSubmitReview = async (
    data: { title: string; text: string; rating: number },
    providerId: string,
    serviceId: string
  ) => {
    // In a real app, we would call an API here
    const newReview: Review = {
      id: `new-${Date.now()}`,
      ...data,
      created_at: new Date().toISOString(),
      provider_id: providerId,
      provider: pendingReviews.find(service => service.provider.id === providerId)?.provider!,
      booking_id: serviceId,
    };
    setUserReviews(prev => [newReview, ...prev]);
    setPendingReviews(prev => prev.filter(service => service.id !== serviceId));
  };
  return (
    <Layout>
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Reviews</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="my-reviews">My Reviews</TabsTrigger>
            <TabsTrigger value="pending">Pending Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="my-reviews">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map(index => (
                  <div key={index} className="animate-pulse bg-white rounded-lg shadow p-4">
                    <div className="flex items-start">
                      <div className="h-12 w-12 bg-gray-200 rounded-full mr-4"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : userReviews.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 mb-2">You haven't submitted any reviews yet</p>
                <p className="text-gray-400 text-sm mb-4">
                  Your reviews will appear here once you've reviewed a service
                </p>
                <Button onClick={() => setActiveTab('pending')}>View Pending Reviews</Button>
              </div>
            ) : (
              <div className="space-y-6">
                {editingReview && (
                  <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Edit Your Review</h2>
                    <ReviewForm
                      providerId={editingReview.provider_id}
                      initialData={{
                        title: editingReview.title,
                        text: editingReview.text,
                        rating: editingReview.rating,
                      }}
                      isEdit={true}
                      onSubmit={handleUpdateReview}
                      onCancel={() => setEditingReview(null)}
                    />
                  </div>
                )}
                <div className="space-y-4">
                  {userReviews.map(review => (
                    <div key={review.id} className="bg-white rounded-lg shadow">
                      <ReviewCard
                        id={review.id}
                        title={review.title}
                        text={review.text}
                        rating={review.rating}
                        createdAt={review.created_at}
                        customer={{
                          id: 'self',
                          name: 'You', // In a real app, we would use the user's name
                          avatar_url: undefined,
                        }}
                      />
                      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                        <div className="text-sm text-gray-500">
                          For: <span className="font-medium">{review.provider.name}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditReview(review)}
                            className="flex items-center"
                          >
                            <Icons.PencilIcon className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReview(review.id)}
                            className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Icons.TrashIcon className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="pending">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map(index => (
                  <div key={index} className="animate-pulse bg-white rounded-lg shadow p-4">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : pendingReviews.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 mb-2">No pending reviews</p>
                <p className="text-gray-400 text-sm">
                  You don't have any completed services to review at this time
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingReviews.map(service => (
                  <div key={service.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium">{service.name}</h3>
                        <p className="text-gray-500">
                          {new Date(service.date).toLocaleDateString()} • ${service.price}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div className="relative h-10 w-10 rounded-full overflow-hidden mr-2">
                          {service.provider.avatar_url ? (
                            <img
                              src={service.provider.avatar_url}
                              alt={service.provider.name}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="bg-indigo-100 h-full w-full flex items-center justify-center">
                              <span className="text-indigo-700 font-medium">
                                {service.provider.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="font-medium">{service.provider.name}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        // Show a form to submit a review
                        // In a real app, we might open a modal or navigate to a new page
                        const dummyReview = {
                          title: 'Great service!',
                          text: 'I really enjoyed my experience.',
                          rating: 5,
                        };
                        handleSubmitReview(dummyReview, service.provider.id, service.id);
                      }}
                    >
                      Leave a Review
                    </Button>
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
