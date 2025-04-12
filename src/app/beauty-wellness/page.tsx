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
  HandThumbUpIcon,
  HeartIcon,
  StarIcon,
  CalendarIcon,
  MapPinIcon,
  SunIcon,
  MoonIcon,
  BeakerIcon,
  UserGroupIcon,
  BookmarkIcon,
  ChartBarIcon,
  BellIcon,
  GiftIcon,
  ShoppingBagIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

// Enhanced categories with wellness integration
const categories = [
  { 
    id: 'all', 
    name: 'All Services', 
    icon: SparklesIcon,
    description: 'Explore our complete range of beauty and wellness services',
    color: 'from-purple-100 to-pink-100'
  },
  { 
    id: 'hair', 
    name: 'Hair', 
    icon: ScissorsIcon,
    description: 'Cuts, colors, styling, and treatments',
    color: 'from-blue-100 to-indigo-100'
  },
  { 
    id: 'makeup', 
    name: 'Makeup', 
    icon: PaintBrushIcon,
    description: 'Professional makeup for any occasion',
    color: 'from-pink-100 to-rose-100'
  },
  { 
    id: 'nails', 
    name: 'Nails', 
    icon: HandThumbUpIcon,
    description: 'Manicures, pedicures, and nail art',
    color: 'from-red-100 to-orange-100'
  },
  { 
    id: 'skincare', 
    name: 'Skincare', 
    icon: BeakerIcon,
    description: 'Facials, treatments, and consultations',
    color: 'from-green-100 to-emerald-100'
  },
  { 
    id: 'spa', 
    name: 'Spa', 
    icon: HeartIcon,
    description: 'Relaxing spa treatments and massages',
    color: 'from-amber-100 to-yellow-100'
  },
  { 
    id: 'wellness', 
    name: 'Wellness', 
    icon: SunIcon,
    description: 'Holistic wellness and self-care',
    color: 'from-cyan-100 to-sky-100'
  },
  { 
    id: 'fitness', 
    name: 'Fitness', 
    icon: UserGroupIcon,
    description: 'Personal training and group classes',
    color: 'from-violet-100 to-purple-100'
  }
];

// Enhanced content with wellness integration
const content = [
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
    },
    tags: ['trending', 'summer', 'color'],
    popularity: 95,
    availableSlots: 5
  },
  {
    id: 2,
    title: 'Mindful Meditation Session',
    description: 'Guided meditation for stress relief and mental clarity.',
    category: 'wellness',
    duration: '30 mins',
    price: '$40',
    level: 'All Levels',
    image: '/placeholder.png',
    provider: {
      name: 'Michael Chen',
      avatar: '/avatars/michael.jpg',
      rating: 4.8,
      reviews: 75,
      location: 'Zen Wellness Center'
    },
    tags: ['meditation', 'mindfulness', 'stress-relief'],
    popularity: 88,
    availableSlots: 8
  },
  {
    id: 3,
    title: 'Yoga Flow Class',
    description: 'Dynamic yoga session for strength and flexibility.',
    category: 'fitness',
    duration: '60 mins',
    price: '$25',
    level: 'Intermediate',
    image: '/placeholder.png',
    provider: {
      name: 'Emma Wilson',
      avatar: '/avatars/emma.jpg',
      rating: 4.9,
      reviews: 92,
      location: 'Sunrise Yoga Studio'
    },
    tags: ['yoga', 'fitness', 'flexibility'],
    popularity: 92,
    availableSlots: 6
  }
];

// Enhanced user progress tracking
const userProgress = {
  wellnessStreak: 7,
  totalSessions: 24,
  favoriteCategories: ['yoga', 'meditation', 'skincare'],
  upcomingAppointments: 3,
  rewardsPoints: 1250,
  level: 'Silver Member',
  nextLevelPoints: 250
};

export default function BeautyWellnessPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('discover');

  const filteredContent = content.filter(item => 
    (selectedCategory === 'all' || item.category === selectedCategory) &&
    (searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Layout>
      <div className="container-app py-12">
        {/* Enhanced Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Beauty & Wellness</h1>
          <p className="text-xl text-muted-foreground">
            Your journey to self-care and well-being starts here
          </p>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="bg-gradient-to-br from-pink-100 to-purple-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      Book Now
                    </CardTitle>
                    <CardDescription>
                      Schedule your next appointment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" asChild>
                      <Link href="/beauty-wellness/book">Find Available Slots</Link>
                    </Button>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Browse and book services from top providers</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
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
                      <Link href="/beauty-wellness/virtual-try-on">Try Now</Link>
                    </Button>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Experiment with different styles using AR technology</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="bg-gradient-to-br from-amber-100 to-yellow-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ChartBarIcon className="h-5 w-5" />
                      My Progress
                    </CardTitle>
                    <CardDescription>
                      Track your wellness journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Wellness Streak</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="font-medium">{userProgress.wellnessStreak} days</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Keep your streak going!</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Progress value={userProgress.wellnessStreak * 10} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>View your wellness journey and achievements</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="bg-gradient-to-br from-cyan-100 to-sky-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GiftIcon className="h-5 w-5" />
                      Rewards
                    </CardTitle>
                    <CardDescription>
                      Earn points with every service
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Points</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="font-medium">{userProgress.rewardsPoints}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Redeem points for exclusive benefits</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Progress value={(userProgress.rewardsPoints / 1500) * 100} className="h-2" />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-xs text-muted-foreground">
                              {userProgress.nextLevelPoints} points to next level
                            </p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Level up to unlock more rewards</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Earn and redeem points for exclusive benefits</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Enhanced Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="discover">
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    Discover
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Explore new services and providers</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="progress">
                    <ChartBarIcon className="h-5 w-5 mr-2" />
                    My Progress
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Track your wellness journey and achievements</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="bookmarks">
                    <BookmarkIcon className="h-5 w-5 mr-2" />
                    Bookmarks
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View your saved services and providers</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="recommended">
                    <StarIcon className="h-5 w-5 mr-2" />
                    Recommended
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Personalized recommendations based on your preferences</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TabsList>
        </Tabs>

        {/* Enhanced Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        placeholder="Search services, providers, or content..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Search by service, provider, or keyword</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">
                  <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                  Filters
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter by price, rating, availability, and more</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {categories.map((category) => (
            <TooltipProvider key={category.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex flex-col items-center justify-center p-6 rounded-lg transition-all ${
                      selectedCategory === category.id
                        ? 'bg-primary text-primary-foreground'
                        : `bg-gradient-to-br ${category.color} hover:shadow-md`
                    }`}
                  >
                    <category.icon className="h-8 w-8 mb-2" />
                    <span className="font-medium">{category.name}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{category.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-all">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="secondary"
                        className="absolute top-2 right-2"
                      >
                        {item.availableSlots} slots left
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Limited availability - Book soon!</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.description}
                    </p>
                    <div className="flex gap-2 mb-4">
                      {item.tags.map((tag) => (
                        <TooltipProvider key={tag}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline">
                                {tag}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Click to see more {tag} services</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1">
                          <StarIcon className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{item.provider.rating}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Based on {item.provider.reviews} reviews</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="flex items-center justify-between">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={item.provider.avatar} alt={item.provider.name} />
                            <AvatarFallback>{item.provider.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{item.provider.name}</p>
                            <p className="text-xs text-muted-foreground">{item.provider.location}</p>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View {item.provider.name}'s profile</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-right">
                          <p className="text-sm font-medium">{item.price}</p>
                          <p className="text-xs text-muted-foreground">{item.duration}</p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Includes consultation and aftercare</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Popularity</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="font-medium">{item.popularity}%</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Based on bookings and reviews</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Progress value={item.popularity} className="h-2" />
                </div>

                <div className="mt-4 flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button className="flex-1" asChild>
                          <Link href={`/beauty-wellness/services/${item.id}`}>
                            Book Now
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Check available time slots</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon">
                          <BookmarkIcon className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Save for later</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon">
                          <ChatBubbleLeftRightIcon className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Chat with provider</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
} 