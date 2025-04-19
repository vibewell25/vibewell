'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Layout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
;
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
export default function BusinessDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await fetch(`/api/business/${id}`);
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
    if (id) {
      fetchBusiness();
    }
  }, [id]);
  if (loading) {
    return (
      <Layout>
        <div className="container-app py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
            <h1 className="text-2xl font-bold mb-4">Business not found</h1>
            <p className="text-muted-foreground mb-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Business Image */}
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <img
              src={business.imageUrl}
              alt={business.name}
              className="object-cover w-full h-full"
            />
          </div>
          {/* Business Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{business.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{business.category}</Badge>
                <div className="flex items-center">
                  <Icons.StarIcon className="h-5 w-5 text-yellow-400" />
                  <span className="ml-1">{business.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground ml-1">
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
          <h2 className="text-2xl font-bold mb-6">Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {business.services.map((service) => (
              <Card key={service.id}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-lg font-semibold">${service.price}</span>
                      <span className="text-muted-foreground ml-2">
                        ({service.duration} min)
                      </span>
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
          <h2 className="text-2xl font-bold mb-6">Reviews</h2>
          <div className="space-y-6">
            {business.reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{review.userName}</span>
                    <div className="flex items-center">
                      <Icons.StarIcon className="h-4 w-4 text-yellow-400" />
                      <span className="ml-1">{review.rating}</span>
                    </div>
                    <span className="text-muted-foreground text-sm">
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