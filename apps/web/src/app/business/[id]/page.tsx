'use client';;
import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { ServiceBookingModal } from '@/components/business/ServiceBookingModal';
import { Icons } from '@/components/icons';
interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  location: string;
  phone: string;
  hours: string;
  services: Service[];
  reviews: Review[];
}
interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
}
interface Review {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  date: string;
}
export default function BusinessPage({ params }: { params: { businessId: string } }) {
  const { businessId } = params;
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  useEffect(() => {
    const fetchBusiness = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
      try {
        const response = await fetch(`/api/business/${businessId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch business details');
        }
        const data = await response.json();
        setBusiness(data.business);
      } catch (error) {
        console.error('Error fetching business:', error);
        toast.error('Failed to load business details');
      } finally {
        setLoading(false);
      }
    };
    if (businessId) {
      fetchBusiness();
    }
  }, [businessId]);
  if (loading) {
    return (
      <Layout>
        <div className="container-app py-12">
          <div className="animate-pulse">
            <div className="mb-4 h-8 w-1/4 rounded bg-gray-200"></div>
            <div className="mb-8 h-4 w-1/2 rounded bg-gray-200"></div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="h-64 rounded bg-gray-200"></div>
              <div className="space-y-4">
                <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                <div className="h-4 w-2/3 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  if (!business) {
    return (
      <Layout>
        <div className="container-app py-12">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold">Business not found</h1>
            <p className="mb-6 text-muted-foreground">
              The business you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <a href="/business">Back to Directory</a>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  return (
    <Layout>
      <div className="container-app py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Business Image */}
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <img
              src={business.imageUrl}
              alt={business.name}
              className="h-full w-full object-cover"
            />
          </div>
          {/* Business Info */}
          <div className="space-y-6">
            <div>
              <h1 className="mb-2 text-3xl font-bold">{business.name}</h1>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary">{business.category}</Badge>
                <div className="flex items-center">
                  <Icons.StarIcon className="h-5 w-5 text-yellow-400" />
                  <span className="ml-1">{business.rating.toFixed(1)}</span>
                  <span className="ml-1 text-muted-foreground">
                    ({business.reviewCount} reviews)
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground">{business.description}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Icons.MapPinIcon className="h-5 w-5 text-muted-foreground" />
                <span>{business.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icons.PhoneIcon className="h-5 w-5 text-muted-foreground" />
                <span>{business.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icons.ClockIcon className="h-5 w-5 text-muted-foreground" />
                <span>{business.hours}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Services */}
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold">Services</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {business.services.map((service) => (
              <Card key={service.id}>
                <CardContent className="p-6">
                  <h3 className="mb-2 text-lg font-semibold">{service.name}</h3>
                  <p className="mb-4 text-muted-foreground">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-semibold">${service.price}</span>
                      <span className="ml-2 text-muted-foreground">({service.duration} min)</span>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedService(service);
                        setShowBookingModal(true);
                      }}
                    >
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        {/* Reviews */}
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold">Reviews</h2>
          <div className="space-y-6">
            {business.reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-semibold">{review.userName}</span>
                    <div className="flex items-center">
                      <Icons.StarIcon className="h-4 w-4 text-yellow-400" />
                      <span className="ml-1">{review.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(review.date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        {/* Booking Modal */}
        {selectedService && (
          <ServiceBookingModal
            service={selectedService}
            business={business}
            open={showBookingModal}
            onOpenChange={setShowBookingModal}
          />
        )}
      </div>
    </Layout>
  );
}
