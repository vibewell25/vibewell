'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Layout } from '@/components/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/Button';
import ReviewsList from '@/components/ReviewsList';
import ReviewForm from '@/components/ReviewForm';
import RatingBreakdown from '@/components/RatingBreakdown';
import useProviderReviews from '@/hooks/useProviderReviews';
import { Icons } from '@/components/icons';
interface ProviderData {
  id: string;
  name: string;
  profileImage: string;
  coverImage: string;
  tagline: string;
  description: string;
  location: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  services: {
    id: string;
    name: string;
    price: number;
    duration: number;
    description: string;
  }[];
  certifications: {
    id: string;
    name: string;
    issuer: string;
    year: number;
  }[];
  availability: {
    day: string;
    slots: {
      start: string;
      end: string;
    }[];
  }[];
  rating: number;
  reviewCount: number;
}
export default function ProviderProfilePage() {
  const { id } = useParams();
  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  // Use the custom hook for provider reviews
  const {
    reviews,
    summary,
    isLoading: reviewsLoading,
    addReview,
    getRatingPercentage,
  } = useProviderReviews(id as string);
  // Fetch provider data
  useEffect(() => {
    const fetchProviderData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // This would be a real API call in production
        // Simulate fetch with timeout for demo
        setTimeout(() => {
          // Mock data for demo purposes
          const mockProvider: ProviderData = {
            id: id as string,
            name: 'Sarah Johnson',
            profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
            coverImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f',
            tagline: 'Expert Hair Stylist & Makeup Artist',
            description:
              'With over 10 years of experience in the beauty industry, I specialize in cutting-edge hair styling techniques and professional makeup for all occasions. My passion is to help clients look and feel their best.',
            location: 'New York, NY',
            address: '123 Beauty Lane, New York, NY 10001',
            coordinates: {
              lat: 40.7128,
              lng: -74.006,
            },
            services: [
              {
                id: 's1',
                name: 'Haircut & Styling',
                price: 85,
                duration: 60,
                description: 'Includes consultation, shampoo, cut, and style.',
              },
              {
                id: 's2',
                name: 'Full Makeup Application',
                price: 120,
                duration: 75,
                description: 'Complete makeup look for any occasion.',
              },
              {
                id: 's3',
                name: 'Hair Coloring',
                price: 150,
                duration: 120,
                description: 'Custom hair color including consultation.',
              },
            ],
            certifications: [
              {
                id: 'c1',
                name: 'Professional Makeup Artist Certificate',
                issuer: 'Beauty Academy of New York',
                year: 2015,
              },
              {
                id: 'c2',
                name: 'Advanced Hair Coloring Techniques',
                issuer: 'International Hair Association',
                year: 2018,
              },
            ],
            availability: [
              {
                day: 'Monday',
                slots: [
                  { start: '09:00', end: '12:00' },
                  { start: '13:00', end: '17:00' },
                ],
              },
              {
                day: 'Wednesday',
                slots: [
                  { start: '09:00', end: '12:00' },
                  { start: '13:00', end: '17:00' },
                ],
              },
              {
                day: 'Friday',
                slots: [
                  { start: '10:00', end: '14:00' },
                  { start: '15:00', end: '19:00' },
                ],
              },
            ],
            rating: 4.8,
            reviewCount: summary.totalReviews || 24,
          };
          setProvider(mockProvider);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load provider data');
        setIsLoading(false);
        console.error('Error fetching provider data:', err);
      }
    };
    if (id) {
      fetchProviderData();
    }
  }, [id, summary.totalReviews]);
  // Handle review submission
  const handleAddReview = async (data: { title: string; text: string; rating: number }) => {
    try {
      await addReview(data, id as string);
      setShowReviewForm(false);
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="mb-6 h-64 rounded-lg bg-gray-200"></div>
            <div className="flex flex-col gap-6 md:flex-row">
              <div className="md:w-1/3">
                <div className="mb-4 h-80 rounded-lg bg-gray-200"></div>
                <div className="mb-4 h-10 rounded-lg bg-gray-200"></div>
                <div className="mb-2 h-4 rounded-lg bg-gray-200"></div>
                <div className="mb-2 h-4 rounded-lg bg-gray-200"></div>
                <div className="h-4 rounded-lg bg-gray-200"></div>
              </div>
              <div className="md:w-2/3">
                <div className="mb-4 h-10 rounded-lg bg-gray-200"></div>
                <div className="mb-6 h-40 rounded-lg bg-gray-200"></div>
                <div className="h-60 rounded-lg bg-gray-200"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  if (error || !provider) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error || 'Provider not found'}
          </div>
        </div>
      </Layout>
    );
  }
  return (
    <Layout>
      <div className="relative h-64 w-full">
        <Image
          src={provider.coverImage}
          alt={`${provider.name}'s cover image`}
          fill
          className="rounded-b-lg object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-4 left-4 text-white">
          <h1 className="text-3xl font-bold">{provider.name}</h1>
          <p className="text-lg">{provider.tagline}</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Left sidebar */}
          <div className="md:w-1/3">
            <div className="mb-6 rounded-lg bg-white p-6 shadow">
              <div className="mb-4 flex items-center">
                <div className="relative mr-4 h-16 w-16 overflow-hidden rounded-full">
                  <Image
                    src={provider.profileImage}
                    alt={provider.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{provider.name}</h2>
                  <div className="flex items-center">
                    <Icons.StarSolid className="h-5 w-5 text-yellow-400" />
                    <span className="ml-1 text-gray-700">
                      {provider.rating.toFixed(1)} ({provider.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>
              <div className="mb-4 border-t border-gray-200 pt-4">
                <div className="mb-3 flex items-start">
                  <Icons.MapPinSolid className="mr-2 mt-0.5 h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-gray-600">{provider.address}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Icons.ClockSolid className="mr-2 mt-0.5 h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Availability</p>
                    <ul className="text-gray-600">
                      {provider.availability.map((item, index) => (
                        <li key={index}>
                          {item.day}:{' '}
                          {item.slots.map((slot) => `${slot.start}-${slot.end}`).join(', ')}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <Button className="w-full">Book an Appointment</Button>
            </div>
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-semibold">Certifications</h3>
              <ul className="space-y-3">
                {provider.certifications.map((cert) => (
                  <li key={cert.id} className="flex items-start">
                    <Icons.CheckSolid className="mr-2 mt-0.5 h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">{cert.name}</p>
                      <p className="text-sm text-gray-600">
                        {cert.issuer}, {cert.year}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Main content */}
          <div className="md:w-2/3">
            <Tabs defaultValue="about">
              <TabsList className="mb-6">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="about">
                <div className="rounded-lg bg-white p-6 shadow">
                  <h2 className="mb-4 text-2xl font-semibold">About {provider.name}</h2>
                  <p className="mb-4 text-gray-700">{provider.description}</p>
                </div>
              </TabsContent>
              <TabsContent value="services">
                <div className="rounded-lg bg-white p-6 shadow">
                  <h2 className="mb-4 text-2xl font-semibold">Services Offered</h2>
                  <div className="space-y-4">
                    {provider.services.map((service) => (
                      <div key={service.id} className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-start justify-between">
                          <h3 className="text-lg font-medium">{service.name}</h3>
                          <div className="flex flex-col items-end">
                            <span className="text-lg font-bold">${service.price}</span>
                            <span className="flex items-center text-sm text-gray-500">
                              <Icons.ClockSolid className="mr-1 h-4 w-4" /> {service.duration} min
                            </span>
                          </div>
                        </div>
                        <p className="mt-2 text-gray-600">{service.description}</p>
                        <Button variant="outline" className="mt-3">
                          <Icons.CalendarSolid className="mr-2 h-4 w-4" /> Book Now
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="reviews">
                <div className="mb-6 rounded-lg bg-white p-6 shadow">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Customer Reviews</h2>
                    <Button onClick={() => setShowReviewForm(!showReviewForm)}>
                      {showReviewForm ? 'Cancel' : 'Write a Review'}
                    </Button>
                  </div>
                  {showReviewForm && (
                    <div className="mb-8">
                      <ReviewForm
                        providerId={id as string}
                        onSubmit={handleAddReview}
                        onCancel={() => setShowReviewForm(false)}
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-6 lg:flex-row">
                    <div className="lg:w-1/3">
                      <RatingBreakdown
                        distribution={summary.ratingDistribution}
                        totalReviews={summary.totalReviews}
                        averageRating={summary.averageRating}
                      />
                      {summary.categories && (
                        <div className="mt-6 rounded-lg bg-white p-6 shadow">
                          <h3 className="mb-4 text-lg font-semibold">Rating Details</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Cleanliness</span>
                              <span>{summary.categories.cleanliness.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Value</span>
                              <span>{summary.categories.value.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Service</span>
                              <span>{summary.categories.service.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Communication</span>
                              <span>{summary.categories.communication.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Expertise</span>
                              <span>{summary.categories.expertise.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="lg:w-2/3">
                      <ReviewsList reviews={reviews} isLoading={reviewsLoading} />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}
