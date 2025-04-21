'use client';
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import Link from 'next/link';
import { GoalCreationModal } from '@/components/wellness/GoalCreationModal';
import { useWellnessData } from '@/hooks/useWellnessData';
import { Goal } from '@/types/progress';
import { WellnessContentModal } from '@/components/wellness/WellnessContentModal';
import { ContentType } from '@/components/wellness/ContentTypeSelector';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip } from '@/components/ui/tooltip';
import { Icons } from '@/components/icons';
// Define wellness content categories
const categories = [
  { id: 'all', name: 'All', icon: SparklesIcon },
  { id: 'mindfulness', name: 'Mindfulness', icon: HeartIcon },
  { id: 'yoga', name: 'Yoga', icon: FireIcon },
  { id: 'nutrition', name: 'Nutrition', icon: StarIcon },
  { id: 'fitness', name: 'Fitness', icon: ArrowPathIcon },
  { id: 'sleep', name: 'Sleep', icon: ClockIcon },
  { id: 'mental-health', name: 'Mental Health', icon: UserGroupIcon },
];
// Define wellness content with enhanced data
const wellnessContent = [
  {
    id: 1,
    title: 'Introduction to Meditation',
    description: 'A beginner-friendly guide to starting a meditation practice.',
    category: 'mindfulness',
    duration: '15 mins',
    level: 'beginner',
    image: '/placeholder.png',
    rating: 4.8,
    reviews: 128,
    likes: 256,
    author: {
      name: 'Sarah Johnson',
      avatar: '/avatars/sarah.jpg',
      expertise: 'Mindfulness Coach',
    },
    tags: ['meditation', 'beginner', 'stress-relief'],
    progress: 75,
    isBookmarked: false,
    isLiked: false,
  },
  {
    id: 2,
    title: 'Morning Yoga Flow',
    description: 'Start your day with energizing yoga poses to awaken the body.',
    category: 'yoga',
    duration: '20 mins',
    level: 'intermediate',
    image: '/placeholder.png',
  },
  {
    id: 3,
    title: 'Healthy Meal Planning',
    description: 'Learn how to plan nutritious meals for the week ahead.',
    category: 'nutrition',
    duration: '10 mins',
    level: 'beginner',
    image: '/placeholder.png',
  },
  {
    id: 4,
    title: 'High-Intensity Interval Training',
    description: 'A quick but effective HIIT workout to boost your metabolism.',
    category: 'fitness',
    duration: '25 mins',
    level: 'advanced',
    image: '/placeholder.png',
  },
  {
    id: 5,
    title: 'Sleep Meditation',
    description: 'A calming meditation to help you fall asleep faster and sleep better.',
    category: 'sleep',
    duration: '15 mins',
    level: 'beginner',
    image: '/placeholder.png',
  },
  {
    id: 6,
    title: 'Stress Management Techniques',
    description: 'Practical techniques to manage stress in your daily life.',
    category: 'mental-health',
    duration: '12 mins',
    level: 'intermediate',
    image: '/placeholder.png',
  },
  {
    id: 7,
    title: 'Breathing Exercises for Anxiety',
    description: 'Simple breathing techniques to reduce anxiety and promote calm.',
    category: 'mindfulness',
    duration: '8 mins',
    level: 'beginner',
    image: '/placeholder.png',
  },
  {
    id: 8,
    title: 'Vinyasa Yoga Flow',
    description: 'A dynamic yoga sequence linking breath with movement.',
    category: 'yoga',
    duration: '30 mins',
    level: 'intermediate',
    image: '/placeholder.png',
  },
];
interface UserProgress {
  completed: number;
  inProgress: number;
  bookmarked: number;
  total: number;
}
interface WellnessContent {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'meditation' | 'exercise';
  content: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  category: string;
  thumbnail: string;
  author?: {
    name: string;
    avatar: string;
    expertise: string;
  };
}
export default function WellnessPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    completed: 0,
    inProgress: 0,
    bookmarked: 0,
    total: wellnessContent.length,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');
  const { createGoal } = useWellnessData();
  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);
  // Handle creating a new goal
  const handleCreateGoal = (newGoal: Omit<Goal, 'id' | 'current' | 'status'>) => {
    createGoal(newGoal);
  };
  const handleCreateContent = async (content: {
    title: string;
    description: string;
    type: ContentType;
    content: string;
    tags: string[];
  }) => {
    try {
      const response = await fetch('/api/wellness/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      });
      if (!response.ok) {
        throw new Error('Failed to create content');
      }
      const newContent = await response.json();
      setIsCreateModalOpen(false);
      toast.success('Content created successfully');
    } catch (error) {
      console.error('Error creating content:', error);
      toast.error('Failed to create content');
    }
  };
  const handleBookmark = (id: number) => {
    // Update bookmark status
    toast.success('Content bookmarked');
  };
  const handleLike = (id: number) => {
    // Update like status
    toast.success('Content liked');
  };
  const handleShare = (id: number) => {
    // Implement share functionality
    toast.success('Content shared');
  };
  // Filter content by category and search query
  const filteredContent = wellnessContent.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  return (
    <Layout>
      <div className="container-app py-12 md:py-24">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Wellness Library</h1>
            <p className="text-muted-foreground">
              Discover personalized content to support your wellness journey
            </p>
          </div>
          <div className="flex gap-2 self-start">
            <Button
              onClick={() => setShowGoalModal(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Icons.PlusIcon className="h-5 w-5" />
              Create Goal
            </Button>
            <Link href="/wellness/progress" className="btn-primary flex items-center gap-2">
              <Icons.ChartBarIcon className="h-5 w-5" />
              Track Progress
            </Link>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="progress">My Progress</TabsTrigger>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
          </TabsList>
          <TabsContent value="discover" className="space-y-6">
            {/* Search and Filter */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icons.MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search wellness content..."
                    className="form-input pl-10"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  className="md:hidden flex items-center justify-center"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Icons.AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
            {/* Category Filters */}
            <div className={`mb-8 ${showFilters ? 'block' : 'hidden md:block'}`}>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      className="flex items-center gap-2"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <Icon className="h-4 w-4" />
                      {category.name}
                    </Button>
                  );
                })}
              </div>
            </div>
            {/* Wellness Content Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
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
                ))}
              </div>
            ) : filteredContent.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No wellness content found. Try adjusting your filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContent.map(item => (
                  <Card key={item.id} className="group hover:shadow-lg transition-all">
                    <CardContent className="p-0">
                      <div className="relative">
                        <div className="h-48 bg-muted rounded-t-lg flex items-center justify-center">
                          <p className="text-muted-foreground">Content Image</p>
                        </div>
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Tooltip content="Bookmark">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleBookmark(item.id)}
                            >
                              <Icons.BookmarkIcon className="h-5 w-5" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Like">
                            <Button variant="ghost" size="icon" onClick={() => handleLike(item.id)}>
                              <Icons.HeartIcon className="h-5 w-5" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Share">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleShare(item.id)}
                            >
                              <Icons.ShareIcon className="h-5 w-5" />
                            </Button>
                          </Tooltip>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{item.level}</Badge>
                          <Badge variant="outline">{item.duration}</Badge>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                        <p className="text-muted-foreground mb-4">{item.description}</p>
                        <div className="flex items-center justify-between">
                          {item.author && (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={item.author.avatar} alt={item.author.name} />
                                <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{item.author.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.author.expertise}
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Icons.StarIcon className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{item.rating}</span>
                            <span className="text-sm text-muted-foreground">({item.reviews})</span>
                          </div>
                        </div>
                        {item.progress > 0 && (
                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{item.progress}%</span>
                            </div>
                            <Progress value={item.progress} />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Completed</CardTitle>
                  <CardDescription>Content you've finished</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{userProgress.completed}</div>
                  <Progress
                    value={(userProgress.completed / userProgress.total) * 100}
                    className="mt-2"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>In Progress</CardTitle>
                  <CardDescription>Content you're currently working on</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{userProgress.inProgress}</div>
                  <Progress
                    value={(userProgress.inProgress / userProgress.total) * 100}
                    className="mt-2"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Bookmarked</CardTitle>
                  <CardDescription>Content you've saved for later</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{userProgress.bookmarked}</div>
                  <Progress
                    value={(userProgress.bookmarked / userProgress.total) * 100}
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="bookmarks" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent
                .filter(item => item.isBookmarked)
                .map(item => (
                  <Card key={item.id}>{/* Same card content as in discover tab */}</Card>
                ))}
            </div>
          </TabsContent>
          <TabsContent value="recommended" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 6)
                .map(item => (
                  <Card key={item.id}>{/* Same card content as in discover tab */}</Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
        {/* Goal Creation Modal */}
        <GoalCreationModal
          isOpen={showGoalModal}
          onClose={() => setShowGoalModal(false)}
          onSave={handleCreateGoal}
        />
        {/* Wellness Content Modal */}
        <WellnessContentModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateContent}
        />
      </div>
    </Layout>
  );
}
