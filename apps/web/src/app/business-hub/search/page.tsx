'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Layout } from '@/components/layout';
import { BusinessHubNavigation } from '@/components/business-hub-navigation';
import { HubSearch } from '@/components/hub-search';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/star-rating';
import { ResourceReview, Review } from '@/components/resource-review';
import { addBookmark, removeBookmark, isBookmarked } from '@/lib/bookmarks';
import { getAverageRating } from '@/lib/ratings';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
// Mock search result types
interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'resource' | 'tool' | 'article';
  section: 'marketing' | 'financial' | 'client-acquisition' | 'staff-management' | 'general';
  url: string;
  image?: string;
  tags: string[];
  date: string;
  premium: boolean;
  relevanceScore?: number;
}
// Loading fallback component
function SearchLoadingSkeleton() {
  return (
    <Layout>
      <div className="container-app py-8">
        <Skeleton className="mb-6 h-12 w-1/3" />
        <div className="mb-8 flex gap-4">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
        <div className="grid gap-6">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
        </div>
      </div>
    </Layout>
  );
}
// Search page content that uses useSearchParams
function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = (searchParams.get('category') || 'all') as any;
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'rating'>('relevance');
  const [bookmarkedItems, setBookmarkedItems] = useState<Record<string, boolean>>({});
  const [trackSearch, setTrackSearch] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});
  // Perform search when query or category changes
  useEffect(() => {
    if (query) {
      performSearch(query, category);
    }
    // Track search analytics
    if (query && trackSearch) {
      // In a real app, this would send analytics data to your backend
      if (typeof window !== 'undefined') {
        try {
          const searchHistory = JSON.parse(localStorage.getItem('search_history') || '[]');
          searchHistory.push({
            query,
            category,
            timestamp: new Date().toISOString(),
          });
          localStorage.setItem('search_history', JSON.stringify(searchHistory.slice(-20)));
        } catch (e) {
          console.error('Failed to track search', e);
        }
      }
    }
    setTrackSearch(true);
  }, [query, category]);
  // Check bookmarked status of results
  useEffect(() => {
    const bookmarked: Record<string, boolean> = {};
    results.forEach((result) => {
      bookmarked[result.id] = isBookmarked(result.id, result.type);
    });
    setBookmarkedItems(bookmarked);
  }, [results]);
  // Perform search and update results
  const performSearch = (searchQuery: string, searchCategory: string) => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      // In a real app, this would be an API call
      // For now, we'll create mock results based on the query
      let mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Social Media Marketing Guide for Wellness Businesses',
          description:
            'Learn how to effectively market your wellness business on social media platforms.',
          type: 'resource',
          section: 'marketing',
          url: '/business-hub/marketing/resources/social-media-guide',
          image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7',
          tags: ['social-media', 'marketing', 'instagram'],
          date: '2023-08-15',
          premium: false,
        },
        {
          id: '2',
          title: 'Financial Planning Template for Spa Businesses',
          description:
            'A comprehensive financial planning template designed specifically for spa and wellness businesses.',
          type: 'tool',
          section: 'financial',
          url: '/business-hub/financial-management/resources/financial-planning-template',
          image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f',
          tags: ['finance', 'planning', 'template'],
          date: '2023-10-05',
          premium: true,
        },
        {
          id: '3',
          title: 'Client Acquisition Strategies for Beauty Businesses',
          description:
            'Effective strategies to attract and retain clients for your beauty business.',
          type: 'article',
          section: 'client-acquisition',
          url: '/business-hub/client-acquisition/strategies/beauty-business',
          image: 'https://images.unsplash.com/photo-1595247299149-85c93280604d',
          tags: ['clients', 'marketing', 'growth'],
          date: '2023-11-12',
          premium: false,
        },
        {
          id: '4',
          title: 'Employee Onboarding Checklist',
          description:
            'A comprehensive checklist for onboarding new employees in your wellness business.',
          type: 'resource',
          section: 'staff-management',
          url: '/business-hub/staff-management/resources/onboarding-checklist',
          image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df',
          tags: ['staff', 'onboarding', 'management'],
          date: '2024-01-18',
          premium: false,
        },
        {
          id: '5',
          title: 'Pricing Calculator for Wellness Services',
          description:
            'Calculate optimal pricing for your wellness services based on costs, competition, and value.',
          type: 'tool',
          section: 'financial',
          url: '/business-hub/financial-management/tools/pricing-calculator',
          image: 'https://images.unsplash.com/photo-1553484771-371a605b060b',
          tags: ['pricing', 'finance', 'calculator'],
          date: '2023-12-03',
          premium: true,
        },
        {
          id: '6',
          title: 'Instagram Reels for Beauty Businesses Webinar',
          description:
            'Learn how to create engaging Instagram Reels to showcase your beauty services.',
          type: 'article',
          section: 'marketing',
          url: '/business-hub/marketing/webinars/instagram-reels',
          image: 'https://images.unsplash.com/photo-1611162616305-c69b3037f77d',
          tags: ['instagram', 'video', 'social-media'],
          date: '2024-02-22',
          premium: true,
        },
      ];
      // Filter by category if specified
      if (searchCategory && searchCategory !== 'all') {
        mockResults = mockResults.filter((result) => {
          if (searchCategory === 'marketing') return result.section === 'marketing';
          if (searchCategory === 'financial') return result.section === 'financial';
          if (searchCategory === 'resources') return result.type === 'resource';
          if (searchCategory === 'tools') return result.type === 'tool';
          return true;
        });
      }
      // Simulate relevance scoring - in a real app this would be done by the search engine
      mockResults = mockResults.map((result) => {
        // Add the query to the result for highlighting in a real app
        return { ...result, relevanceScore: Math.random() * 10 };
      });
      setResults(mockResults);
      setIsLoading(false);
    }, 800);
  };
  // Handle search submission
  const handleSearch = (newQuery: string, newCategory: any) => {
    setQuery(newQuery);
    setCategory(newCategory);
    // Update URL to reflect search params without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('q', newQuery);
    url.searchParams.set('category', newCategory);
    window.history.pushState({}, '', url.toString());
  };
  // Toggle bookmark status
  const toggleBookmark = (result: SearchResult) => {
    const currentStatus = bookmarkedItems[result.id] || false;
    if (currentStatus) {
      removeBookmark(result.id, result.type);
    } else {
      addBookmark({
        id: result.id,
        type: result.type,
        title: result.title,
        description: result.description,
        url: result.url,
        category: result.section,
      });
    }
    setBookmarkedItems((prev) => ({
      ...prev,
      [result.id]: !currentStatus,
    }));
  };
  // Toggle reviews visibility for a result
  const toggleReviews = (resultId: string) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [resultId]: !prev[resultId],
    }));
  };
  // Handle review added
  const handleReviewAdded = (review: Review) => {
    // Refresh average ratings after a review is added
    // In a real app, this might trigger a refetch of data
    setResults((currentResults) =>
      currentResults.map((result) => (result.id === review.resourceId ? { ...result } : result)),
    );
  };
  // Filter results based on selected filters
  const filteredResults = results.filter((result) => {
    const matchesType = selectedType === 'all' || result.type === selectedType;
    const matchesSection = selectedSection === 'all' || result.section === selectedSection;
    const matchesRating = getAverageRating(result.id, result.type).average >= minRating;
    return matchesType && matchesSection && matchesRating;
  });
  // Sort results based on selected sort option
  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === 'rating') {
      const aRating = getAverageRating(a.id, a.type).average;
      const bRating = getAverageRating(b.id, b.type).average;
      return bRating - aRating;
    } else {
      // Sort by relevance score (default)
      return (b.relevanceScore || 0) - (a.relevanceScore || 0);
    }
  });
  // Get unique sections and types for filters
  const sections = [...new Set(results.map((result) => result.section))];
  const types = [...new Set(results.map((result) => result.type))];
  // Render icon based on result type
  const renderTypeIcon = (type: string) => {
    switch (type) {
      case 'resource':
        return <Icons.DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case 'tool':
        return <Icons.CalculatorIcon className="h-5 w-5 text-green-500" />;
      case 'article':
        return <Icons.NewspaperIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <Icons.DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold">Business Hub</h1>
        <p className="mb-6 text-gray-600">
          Tools, resources, and education to grow your wellness business
        </p>
        {/* Main Navigation */}
        <BusinessHubNavigation />
        <div className="mx-auto max-w-5xl">
          {/* Search Bar */}
          <div className="mb-8">
            <HubSearch
              defaultCategory={category}
              placeholder="Search for resources, tools, and more..."
              onSearch={handleSearch}
              autoFocus={true}
            />
          </div>
          {isLoading ? (
            <div className="py-12">
              <div className="flex items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
              </div>
              <p className="mt-4 text-center text-gray-500">Searching for "{query}"...</p>
            </div>
          ) : query && results.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center shadow-md">
              <Icons.MagnifyingGlassIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h2 className="mb-2 text-xl font-semibold">No results found</h2>
              <p className="mb-6 text-gray-600">
                We couldn't find any matches for "{query}". Try adjusting your search terms or
                browse our popular resources below.
              </p>
              <div className="flex justify-center">
                <Link href="/business-hub">
                  <Button>Browse Business Hub</Button>
                </Link>
              </div>
            </div>
          ) : query ? (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Search Results
                  <span className="ml-2 font-normal text-gray-500">
                    {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'}{' '}
                    for "{query}"
                  </span>
                </h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <select
                      className="appearance-none rounded-md border border-gray-300 bg-white px-4 py-2 pr-8 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                    >
                      <option value="relevance">Sort by Relevance</option>
                      <option value="date">Sort by Date</option>
                      <option value="rating">Sort by Rating</option>
                    </select>
                    <Icons.ArrowsUpDownIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-6 md:flex-row">
                {/* Filters Sidebar */}
                <div className="h-fit rounded-lg bg-white p-4 shadow-md md:w-64">
                  <h3 className="mb-4 flex items-center font-semibold">
                    <Icons.FunnelIcon className="mr-2 h-4 w-4" /> Filters
                  </h3>
                  <div className="mb-6">
                    <h4 className="mb-2 text-sm font-medium">Content Type</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="type"
                          checked={selectedType === 'all'}
                          onChange={() => setSelectedType('all')}
                          className="mr-2"
                        />
                        <span>All Types</span>
                      </label>
                      {types.map((type) => (
                        <label key={type} className="flex items-center">
                          <input
                            type="radio"
                            name="type"
                            checked={selectedType === type}
                            onChange={() => setSelectedType(type)}
                            className="mr-2"
                          />
                          <span className="capitalize">{type}s</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="mb-6">
                    <h4 className="mb-2 text-sm font-medium">Section</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="section"
                          checked={selectedSection === 'all'}
                          onChange={() => setSelectedSection('all')}
                          className="mr-2"
                        />
                        <span>All Sections</span>
                      </label>
                      {sections.map((section) => (
                        <label key={section} className="flex items-center">
                          <input
                            type="radio"
                            name="section"
                            checked={selectedSection === section}
                            onChange={() => setSelectedSection(section)}
                            className="mr-2"
                          />
                          <span className="capitalize">{section.replace('-', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* Rating Filter */}
                  <div className="mb-6">
                    <h4 className="mb-2 text-sm font-medium">Minimum Rating</h4>
                    <div className="space-y-2">
                      {[0, 1, 2, 3, 4, 5].map((rating) => (
                        <label key={rating} className="flex items-center">
                          <input
                            type="radio"
                            name="rating"
                            checked={minRating === rating}
                            onChange={() => setMinRating(rating)}
                            className="mr-2"
                          />
                          <span className="flex items-center">
                            {rating === 0 ? (
                              'Any Rating'
                            ) : (
                              <>
                                {rating}
                                <StarRating initialRating={rating} readonly={true} size="sm" />& Up
                              </>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {filteredResults.length !== results.length && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSelectedType('all');
                        setSelectedSection('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
                {/* Results List */}
                <div className="flex-1">
                  {sortedResults.length === 0 ? (
                    <div className="rounded-lg bg-white p-8 text-center shadow-md">
                      <p className="mb-4 text-gray-600">No results match your current filters.</p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedType('all');
                          setSelectedSection('all');
                        }}
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {sortedResults.map((result) => (
                        <div
                          key={result.id}
                          className="flex flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md md:flex-row"
                        >
                          {result.image && (
                            <div className="relative h-48 md:h-auto md:w-1/3">
                              <Image
                                src={result.image}
                                alt={result.title}
                                fill
                                className="object-cover"
                              />
                              {result.premium && (
                                <div className="absolute right-2 top-2 rounded-full bg-indigo-600 px-2 py-1 text-xs text-white">
                                  Premium
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center">
                                {renderTypeIcon(result.type)}
                                <Badge variant="outline" className="ml-2 text-xs capitalize">
                                  {result.section.replace('-', ' ')}
                                </Badge>
                                <Badge className="ml-2 border-blue-200 bg-blue-100 text-xs capitalize text-blue-800">
                                  {result.type}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => toggleReviews(result.id)}
                                  className={`rounded-full p-1 text-gray-400 hover:text-gray-600`}
                                  title="View reviews"
                                >
                                  <Icons.ChatBubbleLeftRightIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => toggleBookmark(result)}
                                  className={`rounded-full p-1 ${
                                    bookmarkedItems[result.id]
                                      ? 'text-yellow-500'
                                      : 'text-gray-400 hover:text-gray-600'
                                  }`}
                                  title={
                                    bookmarkedItems[result.id]
                                      ? 'Remove from bookmarks'
                                      : 'Add to bookmarks'
                                  }
                                >
                                  <Icons.BookmarkIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                            <Link href={result.url}>
                              <h3 className="mb-2 mt-2 text-xl font-semibold hover:text-blue-600">
                                {result.title}
                              </h3>
                            </Link>
                            <p className="mb-3 line-clamp-2 text-gray-600">{result.description}</p>
                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex flex-wrap gap-1">
                                {result.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <div className="mr-4">
                                  <StarRating
                                    initialRating={getAverageRating(result.id, result.type).average}
                                    readonly={true}
                                    size="sm"
                                    showCount={true}
                                    count={getAverageRating(result.id, result.type).count}
                                  />
                                </div>
                                <span>{new Date(result.date).toLocaleDateString()}</span>
                              </div>
                            </div>
                            {/* Reviews Section - Expandable */}
                            {expandedReviews[result.id] && (
                              <div className="mt-4 border-t pt-4">
                                <div className="mb-3 flex items-center justify-between">
                                  <h4 className="font-semibold">Reviews & Ratings</h4>
                                  <button
                                    onClick={() => toggleReviews(result.id)}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <Icons.XMarkIcon className="h-5 w-5" />
                                  </button>
                                </div>
                                <ResourceReview
                                  resourceId={result.id}
                                  resourceType={result.type}
                                  onReviewAdded={handleReviewAdded}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-white p-8 text-center shadow-md">
              <h2 className="mb-4 text-xl font-semibold">Search the Business Hub</h2>
              <p className="mb-6 text-gray-600">
                Find resources, tools, templates, and guides to help you grow your wellness
                business.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/business-hub/marketing">
                  <Button variant="outline">Marketing Resources</Button>
                </Link>
                <Link href="/business-hub/financial-management">
                  <Button variant="outline">Financial Management</Button>
                </Link>
                <Link href="/business-hub/client-acquisition">
                  <Button variant="outline">Client Acquisition</Button>
                </Link>
                <Link href="/business-hub/staff-management">
                  <Button variant="outline">Staff Management</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
// Main page component with Suspense
export default function SearchPage() {
  return (
    <Layout>
      <Suspense fallback={<SearchPageSkeleton />}>
        <SearchPageContent />
      </Suspense>
    </Layout>
  );
}
// Add skeleton component for loading state
function SearchPageSkeleton() {
  return (
    <div className="container-app py-8">
      <div className="animate-pulse">
        <div className="mb-4 h-8 w-64 rounded bg-gray-200"></div>
        <div className="mb-8 h-4 w-full max-w-2xl rounded bg-gray-200"></div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded bg-gray-200"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
