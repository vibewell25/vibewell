import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  StarIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  ChatBubbleLeftIcon,
  BookmarkIcon,
  ShareIcon,
  UserIcon,
from '@heroicons/react/24/outline';

interface Provider {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  location: string;
  phone: string;
  services: Service[];
  availability: Availability[];
interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
interface Availability {
  day: string;
  slots: string[];
interface Review {
  id: string;
  user: {
    name: string;
    avatar: string;
rating: number;
  comment: string;
  date: string;
  service: string;
interface PortfolioItem {
  id: string;
  image: string;
  title: string;
  category: string;
  description: string;
export default function ProviderProfilePage() {
  const { id } = useParams();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    // Fetch provider data
    // This would be replaced with an actual API call
    setProvider({
      id: '1',
      name: 'Sarah Johnson',
      avatar: '/avatars/sarah.jpg',
      rating: 4.8,
      reviewCount: 124,
      location: '123 Beauty Street, New York',
      phone: '+1 (555) 123-4567',
      services: [
        {
          id: '1',
          name: 'Haircut & Style',
          duration: 60,
          price: 85,
          description: 'Professional haircut and styling service',
// ... more services
      ],
      availability: [
        {
          day: 'Monday',
          slots: ['9:00 AM', '10:00 AM', '2:00 PM'],
// ... more availability
      ],
[id]);

  if (!provider) {
    return <div>Loading...</div>;
return (
    <Layout>
      <div className="container-app py-12">
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-8 md:flex-row">
          <div className="flex-1">
            <div className="mb-4 flex items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={provider.avatar} alt={provider.name} />
                <AvatarFallback>
                  <UserIcon className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-4xl font-bold">{provider.name}</h1>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex items-center">
                    <StarIcon className="h-5 w-5 text-yellow-500" />
                    <span className="ml-1 font-medium">{provider.rating}</span>
                  </div>
                  <span className="text-muted-foreground">({provider.reviewCount} reviews)</span>
                </div>
                <div className="mt-2 flex gap-2">{/* Add specialty badges here */}</div>
              </div>
            </div>
            <div className="flex gap-4">
              <Button>
                <CalendarIcon className="mr-2 h-5 w-5" />
                Book Appointment
              </Button>
              <Button variant="outline">
                <ChatBubbleLeftIcon className="mr-2 h-5 w-5" />
                Message
              </Button>
              <Button variant="outline">
                <BookmarkIcon className="mr-2 h-5 w-5" />
                Save
              </Button>
              <Button variant="outline">
                <ShareIcon className="mr-2 h-5 w-5" />
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
                  <MapPinIcon className="h-5 w-5 text-muted-foreground" />
                  <span>{provider.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneIcon className="h-5 w-5 text-muted-foreground" />
                  <span>{provider.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <EnvelopeIcon className="h-5 w-5 text-muted-foreground" />
                  {/* Add email link here */}
                </div>
                <div className="flex items-center gap-2">
                  <GlobeAltIcon className="h-5 w-5 text-muted-foreground" />
                  {/* Add website link here */}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>
          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Professional beauty service provider with over 10 years of experience.
                    Specializing in haircuts, styling, and color treatments.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Featured Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {provider.services.slice(0, 3).map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <h3 className="font-medium">{service.name}</h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="mr-1 h-4 w-4" />
                            {service.duration} min
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${service.price}</div>
                          <Button variant="outline" size="sm">
                            Book Now
                          </Button>
                        </div>
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
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${service.price}</p>
                        <p className="text-sm text-muted-foreground">{service.duration} min</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          {/* Reviews Tab */}
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-4">{/* Add review cards here */}</div>
          </TabsContent>
          {/* Availability Tab */}
          <TabsContent value="availability" className="mt-6">
            {/* Add availability content here */}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
