'use client';

import { useState } from 'react';
import { Layout } from '@/components/layout';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon,
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { GoalCreationModal } from '@/components/wellness/GoalCreationModal';
import { useWellnessData } from '@/hooks/useWellnessData';
import { Goal } from '@/types/progress';

// Define wellness content categories
const categories = [
  { id: 'all', name: 'All' },
  { id: 'mindfulness', name: 'Mindfulness' },
  { id: 'yoga', name: 'Yoga' },
  { id: 'nutrition', name: 'Nutrition' },
  { id: 'fitness', name: 'Fitness' },
  { id: 'sleep', name: 'Sleep' },
  { id: 'mental-health', name: 'Mental Health' },
];

// Define dummy wellness content
const wellnessContent = [
  {
    id: 1,
    title: 'Introduction to Meditation',
    description: 'A beginner-friendly guide to starting a meditation practice.',
    category: 'mindfulness',
    duration: '15 mins',
    level: 'beginner',
    image: '/placeholder.png',
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

export default function WellnessPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  
  const { createGoal } = useWellnessData();

  // Handle creating a new goal
  const handleCreateGoal = (newGoal: Omit<Goal, 'id' | 'current' | 'status'>) => {
    createGoal(newGoal);
  };

  // Filter content by category and search query
  const filteredContent = wellnessContent.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
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
            <button
              onClick={() => setShowGoalModal(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Create Goal
            </button>
            <Link 
              href="/wellness/progress" 
              className="btn-primary flex items-center gap-2"
            >
              <ChartBarIcon className="h-5 w-5" />
              Track Progress
            </Link>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search wellness content..."
                className="form-input pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              className="md:hidden btn-secondary flex items-center justify-center"
              onClick={() => setShowFilters(!showFilters)}
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className={`mb-8 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`px-4 py-2 rounded-full text-sm ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-muted text-foreground hover:bg-muted-foreground/20'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Goal Creation Modal */}
        <GoalCreationModal
          isOpen={showGoalModal}
          onClose={() => setShowGoalModal(false)}
          onSave={handleCreateGoal}
        />
        
        {/* Wellness Content Grid */}
        {filteredContent.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No wellness content found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item) => (
              <Link key={item.id} href={`/wellness/${item.category}/${item.id}`}>
                <div className="card hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full">
                  <div className="h-48 bg-muted rounded-t-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Content Image</p>
                  </div>
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <span className="bg-muted px-2 py-1 rounded text-xs font-medium">
                        {item.duration}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground capitalize">
                        {item.category.replace('-', ' ')}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
                        {item.level}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
} 