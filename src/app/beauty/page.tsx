'use client';

import { useState } from 'react';
import { Layout } from '@/components/layout';
import { 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon,
  PlusIcon,
  SparklesIcon,
  ScissorsIcon,
  PaintBrushIcon,
  HandIcon,
  SparklesIcon as SparklesIconOutline,
  HeartIcon,
  StarIcon,
  CalendarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { BeautyContentModal } from '@/components/beauty/BeautyContentModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip } from '@/components/ui/tooltip';
import Link from 'next/link';

// Define beauty content categories with enhanced metadata
const categories = [
  { 
    id: 'all', 
    name: 'All Services', 
    icon: SparklesIcon,
    description: 'Explore our complete range of beauty services'
  },
  { 
    id: 'hair', 
    name: 'Hair', 
    icon: ScissorsIcon,
    description: 'Cuts, colors, styling, and treatments'
  },
  { 
    id: 'makeup', 
    name: 'Makeup', 
    icon: PaintBrushIcon,
    description: 'Professional makeup for any occasion'
  },
  { 
    id: 'nails', 
    name: 'Nails', 
    icon: HandIcon,
    description: 'Manicures, pedicures, and nail art'
  },
  { 
    id: 'skincare', 
    name: 'Skincare', 
    icon: SparklesIconOutline,
    description: 'Facials, treatments, and consultations'
  },
  { 
    id: 'spa', 
    name: 'Spa', 
    icon: HeartIcon,
    description: 'Relaxing spa treatments and massages'
  }
];

// Enhanced beauty content with more details
const beautyContent = [
  {
    id: 1,
    title: 'Summer Hair Color Trends',
    description: 'Discover the hottest hair color trends for the summer season.',
    category: 'hair',
    duration: '60 mins',
    price: '$150+',
    level: 'Professional Service',
    image: '/placeholder.png',
    provider: {
      name: 'Sarah Johnson',
      avatar: '/avatars/sarah.jpg',
      rating: 4.9,
      reviews: 128,
      location: 'Downtown Beauty Studio'
    }
  },
  {
    id: 2,
    title: 'Bridal Makeup Package',
    description: 'Complete bridal makeup service including trial and wedding day.',
    category: 'makeup',
    duration: '120 mins',
    price: '$250+',
    level: 'Premium Service',
    image: '/placeholder.png',
    provider: {
      name: 'Emily Chen',
      avatar: '/avatars/emily.jpg',
      rating: 5.0,
      reviews: 89,
      location: 'Glamour Artistry'
    }
  },
  // Add more services...
];

export default function BeautyPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state
  useState(() => {
    setTimeout(() => setIsLoading(false), 1000);
  });

  // Filter content by category and search query
  const filteredContent = beautyContent.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      <div className="container-app py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Beauty Services</h1>
          <p className="text-xl text-muted-foreground">
            Discover and book professional beauty services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-pink-100 to-purple-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Book Now
              </CardTitle>
              <CardDescription>
                Schedule your next beauty appointment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link href="/beauty/book">Find Available Slots</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-100 to-green-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SparklesIcon className="h-5 w-5" />
                Virtual Try-On
              </CardTitle>
              <CardDescription>
                Preview looks before your appointment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full" asChild>
                <Link href="/beauty/virtual-try-on">Try Now</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-100 to-orange-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPinIcon className="h-5 w-5" />
                Find Providers
              </CardTitle>
              <CardDescription>
                Explore top-rated beauty professionals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full" asChild>
                <Link href="/beauty/providers">Browse Providers</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="near-you">Near You</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
          </TabsList>

          <TabsContent value="discover">
            {/* Search and Categories */}
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search beauty services..."
                    className="form-input pl-10 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  className="md:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                  Filters
                </Button>
              </div>

              <div className={`${showFilters ? 'block' : 'hidden md:block'}`}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Card
                        key={category.id}
                        className={`cursor-pointer transition-all ${
                          selectedCategory === category.id ? 'border-primary' : ''
                        }`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <CardContent className="p-4 text-center">
                          <Icon className="h-8 w-8 mx-auto mb-2" />
                          <p className="font-medium">{category.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {category.description}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Service Listings */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-0">
                        <Skeleton className="h-48 w-full rounded-t-lg" />
                        <div className="p-6 space-y-4">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : filteredContent.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">No services found. Try adjusting your filters.</p>
                  </div>
                ) : (
                  filteredContent.map((service) => (
                    <Card key={service.id} className="group hover:shadow-lg transition-all">
                      <CardContent className="p-0">
                        <div className="relative">
                          <div className="h-48 bg-muted rounded-t-lg flex items-center justify-center">
                            <p className="text-muted-foreground">Service Image</p>
                          </div>
                          <div className="absolute top-4 right-4 flex gap-2">
                            <Badge variant="secondary" className="bg-white/90">
                              {service.price}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{service.level}</Badge>
                            <Badge variant="outline">{service.duration}</Badge>
                          </div>
                          <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                          <p className="text-muted-foreground mb-4">{service.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={service.provider.avatar} alt={service.provider.name} />
                                <AvatarFallback>{service.provider.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{service.provider.name}</p>
                                <p className="text-xs text-muted-foreground">{service.provider.location}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <StarIcon className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm font-medium">{service.provider.rating}</span>
                              <span className="text-sm text-muted-foreground">
                                ({service.provider.reviews})
                              </span>
                            </div>
                          </div>
                          <Button className="w-full mt-4" asChild>
                            <Link href={`/beauty/services/${service.id}`}>
                              Book Now
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* Add content for other tabs */}
        </Tabs>
      </div>
    </Layout>
  );
} 