'use client';
import { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { lazyLoad } from '@/utils/dynamic-import';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { useTranslation } from 'react-i18next';
// Import types
import type {
  CardProps,
  BadgeProps,
  TabsProps,
  AvatarProps,
  TooltipProps,
  ProgressProps,
} from '@/components/ui/types';
// Enhanced type definitions
interface UserProgress {
  wellnessStreak: number;
  rewardsPoints: number;
  nextLevelPoints: number;
}
interface ServiceProvider {
  name: string;
  avatar: string;
  rating: number;
  reviews: number;
  location: string;
  specialization?: string;
}
// Import content types
import type { ServiceItem as ImportedServiceItem } from '@/types/services';
// Local ServiceItem interface that extends the imported one
interface ServiceItem extends ImportedServiceItem {
  provider: ServiceProvider;
}
// Dynamically import components with proper typing
const DynamicCard = lazyLoad<CardProps>(() =>
  import('@/components/ui/card').then(mod => ({ default: mod.Card }))
);
const DynamicBadge = lazyLoad<BadgeProps>(() =>
  import('@/components/ui/badge').then(mod => ({ default: mod.Badge }))
);
const DynamicTabs = lazyLoad<TabsProps>(() =>
  import('@/components/ui/tabs').then(mod => ({ default: mod.Tabs }))
);
const DynamicAvatar = lazyLoad<AvatarProps>(() =>
  import('@/components/ui/avatar').then(mod => ({ default: mod.Avatar }))
);
const DynamicTooltip = lazyLoad<TooltipProps>(() =>
  import('@/components/ui/tooltip').then(mod => ({ default: mod.Tooltip }))
);
const DynamicProgress = lazyLoad<ProgressProps>(() =>
  import('@/components/ui/progress').then(mod => ({ default: mod.Progress }))
);
// Import categories and content from separate files
import { categories } from '@/data/beauty-wellness/categories';
import { content } from '@/data/beauty-wellness/content';
import { userProgress } from '@/data/beauty-wellness/user-progress';
import { Icons } from '@/components/icons';
// Add type for filtered content
type FilteredContent = typeof content;
// Define interfaces for component props and state
interface Filters {
  priceRange: [number, number];
  duration: 'any' | '30min' | '60min' | '90min';
  level: 'any' | 'beginner' | 'intermediate' | 'advanced';
}
interface CategoryType {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}
function BeautyWellnessContent(): JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('discover');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({
    priceRange: [0, 500],
    duration: 'any',
    level: 'any',
  });
  const [userProgress, setUserProgress] = useState<UserProgress>({
    wellnessStreak: 0,
    rewardsPoints: 0,
    nextLevelPoints: 100,
  });
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/beauty-wellness/services');
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        const data = await response.json();
        setServices(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);
  // Memoize handlers and computed values
  const filterContent = useMemo(() => {
    return content.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriceRange =
        Number(item.price.replace(/[^0-9.-]+/g, '')) >= filters.priceRange[0] &&
        Number(item.price.replace(/[^0-9.-]+/g, '')) <= filters.priceRange[1];
      const matchesDuration = filters.duration === 'any' || item.duration === filters.duration;
      const matchesLevel = filters.level === 'any' || item.level === filters.level;
      return (
        matchesCategory && matchesSearch && matchesPriceRange && matchesDuration && matchesLevel
      );
    });
  }, [selectedCategory, searchQuery, filters]);
  const filteredContent = useMemo(() => filterContent, [filterContent]);
  // Memoize category icons
  const CategoryIcon = useMemo(() => {
    const category = categories.find(c => c.id === selectedCategory);
    return category?.icon || null;
  }, [selectedCategory]);
  // Memoize handlers
  const handleCategoryChange = useMemo(
    () => (category: string) => setSelectedCategory(category),
    []
  );
  const handleSearchChange = useMemo(
    () => (event: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(event.target.value),
    []
  );
  const handleFilterChange = useMemo(
    () => (filterUpdate: Partial<typeof filters>) =>
      setFilters(prev => ({ ...prev, ...filterUpdate })),
    []
  );
  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <ErrorMessage message={error} />;
  }
  return (
    <Layout>
      <div className="container-app py-12">
        {/* Enhanced Header Section */}
        <Suspense fallback={<Skeleton className="h-24" />}>
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{t('welcome')}</h1>
            <p className="text-xl text-muted-foreground">
              Your journey to self-care and well-being starts here
            </p>
          </div>
        </Suspense>
        {/* Quick Action Cards */}
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          }
        >
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            role="region"
            aria-label="Quick Actions"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="bg-gradient-to-br from-pink-100 to-purple-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icons.CalendarIcon className="h-5 w-5" />
                        Book Now
                      </CardTitle>
                      <CardDescription>Schedule your next appointment</CardDescription>
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
                        <Icons.SparklesIcon className="h-5 w-5" />
                        Virtual Try-On
                      </CardTitle>
                      <CardDescription>Preview looks before your appointment</CardDescription>
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
                        <Icons.ChartBarIcon className="h-5 w-5" />
                        My Progress
                      </CardTitle>
                      <CardDescription>Track your wellness journey</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Wellness Streak</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="font-medium">
                                  {userProgress.wellnessStreak} days
                                </span>
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
                        <Icons.GiftIcon className="h-5 w-5" />
                        Rewards
                      </CardTitle>
                      <CardDescription>Earn points with every service</CardDescription>
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
                        <Progress
                          value={(userProgress.rewardsPoints / 1500) * 100}
                          className="h-2"
                        />
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
        </Suspense>
        {/* Enhanced Navigation */}
        <DynamicTabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4" aria-label="Content Sections">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="discover">
                    <Icons.SparklesIcon className="h-5 w-5 mr-2" />
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
                    <Icons.ChartBarIcon className="h-5 w-5 mr-2" />
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
                    <Icons.BookmarkIcon className="h-5 w-5 mr-2" />
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
                    <Icons.StarIcon className="h-5 w-5 mr-2" />
                    Recommended
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Personalized recommendations based on your preferences</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TabsList>
        </DynamicTabs>
        {/* Enhanced Search and Filters */}
        <div
          className="flex flex-col md:flex-row gap-4 mb-8"
          role="search"
          aria-label="Service Search"
        >
          <div className="flex-1">
            <div className="relative">
              <Icons.MagnifyingGlassIcon
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                placeholder="Search services, providers, or content..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
                aria-label="Search services, providers, or content"
              />
            </div>
          </div>
          <Button
            variant="outline"
            aria-expanded={showFilters}
            aria-controls="filters-panel"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Icons.AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" aria-hidden="true" />
            Filters
          </Button>
        </div>
        {/* Category Grid */}
        <Suspense fallback={<Skeleton className="h-32" />}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-4 rounded-lg text-center transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gradient-to-br ' + category.color
                }`}
              >
                {category.icon && <category.icon className="w-6 h-6 mx-auto mb-2" />}
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </Suspense>
        {/* Content Grid */}
        <Suspense
          fallback={
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-96" />
              ))}
            </div>
          }
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredContent.map((item: ServiceItem) => (
              <DynamicCard key={item.id} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DynamicBadge variant="secondary" className="absolute top-2 right-2">
                          {item.availableSlots} slots left
                        </DynamicBadge>
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
                      <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      <div className="flex gap-2 mb-4">
                        {item.tags.map(tag => (
                          <TooltipProvider key={tag}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <DynamicBadge variant="outline">{tag}</DynamicBadge>
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
                            <Icons.StarIcon className="h-4 w-4 text-yellow-500" />
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
                              <p className="text-xs text-muted-foreground">
                                {item.provider.location}
                              </p>
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
                            <Link href={`/beauty-wellness/services/${item.id}`}>Book Now</Link>
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
                            <Icons.BookmarkIcon className="h-5 w-5" />
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
                            <Icons.ChatBubbleLeftRightIcon className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Chat with provider</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardContent>
              </DynamicCard>
            ))}
          </div>
        </Suspense>
      </div>
    </Layout>
  );
}
BeautyWellnessContent.displayName = 'BeautyWellnessContent';
export default function BeautyWellnessPage(): JSX.Element {
  return (
    <Suspense fallback={<BeautyWellnessSkeleton />}>
      <BeautyWellnessContent />
    </Suspense>
  );
}
BeautyWellnessPage.displayName = 'BeautyWellnessPage';
// Add skeleton component for loading state
function BeautyWellnessSkeleton(): JSX.Element {
  return (
    <Layout>
      <div className="container-app py-12">
        <div className="animate-pulse">
          <div className="h-10 w-72 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 w-96 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
BeautyWellnessSkeleton.displayName = 'BeautyWellnessSkeleton';
const ServiceCard = ({ service }: { service: ServiceItem }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
      <p className="text-gray-600 mb-4">{service.description}</p>
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg font-bold">{service.price}</span>
        <span className="text-sm text-gray-500">{service.duration}</span>
      </div>
      <div className="mb-4">
        <h4 className="font-medium mb-2">Provider</h4>
        <div className="flex items-center">
          <div className="ml-3">
            <p className="font-medium">{service.provider.name}</p>
            {service.provider.specialization && (
              <p className="text-sm text-gray-500">{service.provider.specialization}</p>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">Level: {service.level}</span>
        <span className="text-sm text-gray-500">{service.availableSlots} slots available</span>
      </div>
      <button className="mt-4 w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition-colors">
        Book Now
      </button>
    </div>
  );
};
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: List of users
 */
throw new Error('Test error');
