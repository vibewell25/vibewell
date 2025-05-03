import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, Phone, Mail } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AvailabilityCalendar } from './availability-calendar';
import { ServiceList } from './service-list';
import { ReviewList } from './review-list';

interface Service {
  id: string;
  name: string;
  duration: string;
  price: string;
  description: string;
}

interface Review {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  rating: number;
  comment: string;
  date: string;
}

interface ProviderProfileProps {
  provider: {
    id: string;
    name: string;
    image: string;
    rating: number;
    reviewCount: number;
    location: string;
    specialties: string[];
    bio: string;
    contact: {
      phone: string;
      email: string;
    };
    workingHours: {
      start: string;
      end: string;
    };
  };
}

export function ProviderProfile({ provider }: ProviderProfileProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={provider?.image} alt={provider?.name} />
              <AvatarFallback>{provider?.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{provider?.name}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{provider?.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{provider?.rating}</span>
                  <span className="text-sm text-muted-foreground">
                    ({provider?.reviewCount} reviews)
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {provider?.specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary">
                    {specialty}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{provider?.bio}</p>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">{provider?.contact.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{provider?.contact.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    {provider?.workingHours.start} - {provider?.workingHours.end}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="services">
          <ServiceList providerId={provider?.id} />
        </TabsContent>
        <TabsContent value="availability">
          <AvailabilityCalendar providerId={provider?.id} />
        </TabsContent>
        <TabsContent value="reviews">
          <ReviewList providerId={provider?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
