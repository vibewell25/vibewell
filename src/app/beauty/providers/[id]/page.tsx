'use client';
import { useState } from 'react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { 
import { Icons } from '@/components/icons';
  StarIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  ChatBubbleLeftIcon,
  PhotoIcon,
  BookmarkIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
interface Service {
  id: string;
  name: string;
  category: 'hair' | 'makeup' | 'nails' | 'spa';
  duration: number;
  price: number;
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
  service: string;
}
interface PortfolioItem {
  id: string;
  image: string;
  title: string;
  category: string;
  description: string;
}
const provider = {
  id: 'provider1',
  name: 'Sarah Johnson',
  avatar: '/providers/sarah.jpg',
  rating: 4.8,
  reviewCount: 128,
  specialties: ['Hair Styling', 'Color', 'Makeup'],
  experience: '8 years',
  location: 'Downtown Beauty Studio',
  address: '123 Beauty Street, Suite 456',
  phone: '+1 (555) 123-4567',
  email: 'sarah@beautystudio.com',
  website: 'www.sarahjohnsonbeauty.com',
  bio: 'Certified beauty professional with 8 years of experience in hair styling and makeup artistry. Specializing in bridal and special occasion looks.',
  services: [
    {
      id: 'hair1',
      name: 'Haircut & Styling',
      category: 'hair',
      duration: 60,
      price: 75,
      description: 'Professional haircut and styling service'
    },
    {
      id: 'makeup1',
      name: 'Full Face Makeup',
      category: 'makeup',
      duration: 90,
      price: 120,
      description: 'Complete makeup application for any occasion'
    }
  ],
  reviews: [
    {
      id: 'review1',
      user: {
        name: 'Emily Smith',
        avatar: '/users/emily.jpg'
      },
      rating: 5,
      comment: 'Sarah is amazing! She transformed my look for my wedding day. Highly recommend!',
      date: '2024-03-15',
      service: 'Bridal Makeup'
    }
  ],
  portfolio: [
    {
      id: 'portfolio1',
      image: '/portfolio/bridal-1.jpg',
      title: 'Bridal Makeup',
      category: 'Makeup',
      description: 'Natural bridal look with soft curls'
    }
  ],
  availability: {
    workingHours: {
      monday: { start: '09:00', end: '18:00' },
      tuesday: { start: '09:00', end: '18:00' },
      wednesday: { start: '09:00', end: '18:00' },
      thursday: { start: '09:00', end: '18:00' },
      friday: { start: '09:00', end: '18:00' },
      saturday: { start: '10:00', end: '16:00' },
      sunday: 'closed'
    }
  }
};
export default function ProviderProfilePage() {
  const [activeTab, setActiveTab] = useState('about');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  return (
    <Layout>
      <div className="container-app py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={provider.avatar} />
                <AvatarFallback>{provider.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-4xl font-bold">{provider.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center">
                    <Icons.StarIcon className="h-5 w-5 text-yellow-500" />
                    <span className="ml-1 font-medium">{provider.rating}</span>
                  </div>
                  <span className="text-muted-foreground">
                    ({provider.reviewCount} reviews)
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  {provider.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <Button>
                <Icons.CalendarIcon className="h-5 w-5 mr-2" />
                Book Appointment
              </Button>
              <Button variant="outline">
                <Icons.ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                Message
              </Button>
              <Button variant="outline">
                <Icons.BookmarkIcon className="h-5 w-5 mr-2" />
                Save
              </Button>
              <Button variant="outline">
                <Icons.ShareIcon className="h-5 w-5 mr-2" />
                Share
              </Button>
            </div>
          </div>
          <div className="w-full md:w-80">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Icons.MapPinIcon className="h-5 w-5 text-muted-foreground" />
                  <span>{provider.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.PhoneIcon className="h-5 w-5 text-muted-foreground" />
                  <span>{provider.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.EnvelopeIcon className="h-5 w-5 text-muted-foreground" />
                  <span>{provider.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.GlobeAltIcon className="h-5 w-5 text-muted-foreground" />
                  <a href={provider.website} className="text-primary hover:underline">
                    {provider.website}
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          {/* About Tab */}
          <TabsContent value="about" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>About Me</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{provider.bio}</p>
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Experience</h3>
                    <p className="text-muted-foreground">{provider.experience}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Working Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(provider.availability.workingHours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <span className="capitalize">{day}</span>
                        <span className="text-muted-foreground">
                          {typeof hours === 'string' ? hours : `${hours.start} - ${hours.end}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          {/* Services Tab */}
          <TabsContent value="services" className="mt-6">
            <div className="grid gap-4">
              {provider.services.map((service) => (
                <Card key={service.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {service.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${service.price}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.duration} min
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {provider.portfolio.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="aspect-square bg-muted" />
                  <CardContent className="p-4">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          {/* Reviews Tab */}
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-4">
              {provider.reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 mb-4">
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
                    <p className="text-muted-foreground">{review.comment}</p>
                    <div className="mt-2">
                      <Badge variant="outline">{review.service}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
} 