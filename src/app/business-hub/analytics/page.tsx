'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { BusinessHubNavigation } from '@/components/business-hub-navigation';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ChartBarIcon, 
  CircleStackIcon,
  MagnifyingGlassIcon,
  BookmarkIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { getHighestRatedItems } from '@/lib/ratings';

// Analytics data types
interface ViewData {
  id: string;
  name: string;
  lastViewed: string;
  views: number;
}

interface SearchHistoryItem {
  query: string;
  category: string;
  timestamp: string;
}

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
}

interface PopularResource {
  id: string;
  title: string;
  type: string;
  category: string;
  url: string;
  views: number;
  imageUrl?: string;
}

// Define the PopularRating interface from lib/ratings.ts
interface PopularRating {
  id: string;
  type: string;
  total: number;
  count: number;
  average: number;
}

// Get analytics data from localStorage
const getAnalyticsData = () => {
  if (typeof window === 'undefined') {
    return {
      totalViews: 0,
      resourceViews: [] as ViewData[],
      popularSearches: [] as {term: string, count: number}[],
      searchHistory: [] as SearchHistoryItem[],
      bookmarkedCount: 0,
      topRated: [] as PopularRating[]
    };
  }

  try {
    // Resource views
    const viewData = JSON.parse(localStorage.getItem('resource_view_log') || '{}');
    const resourceViews = Object.values(viewData) as ViewData[];
    const totalViews = resourceViews.reduce((sum, item) => sum + item.views, 0);
    
    // Search history
    const searchHistory = JSON.parse(localStorage.getItem('search_history') || '[]') as SearchHistoryItem[];
    
    // Popular searches (count occurrences)
    const searchTerms = searchHistory.map(item => item.query.toLowerCase().trim()).filter(Boolean);
    const searchCounts: Record<string, number> = {};
    
    searchTerms.forEach(term => {
      searchCounts[term] = (searchCounts[term] || 0) + 1;
    });
    
    const popularSearches = Object.entries(searchCounts)
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Bookmarked resources count
    const bookmarks = JSON.parse(localStorage.getItem('vibewell_bookmarks') || '{}');
    const bookmarkedCount = Object.keys(bookmarks).length;
    
    // Top rated resources
    const topRated = getHighestRatedItems(5) as PopularRating[];
    
    return {
      totalViews,
      resourceViews,
      popularSearches,
      searchHistory,
      bookmarkedCount,
      topRated
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return {
      totalViews: 0,
      resourceViews: [],
      popularSearches: [],
      searchHistory: [],
      bookmarkedCount: 0,
      topRated: []
    };
  }
};

// Popular resources mock data (in a real app, this would come from analytics)
const popularResources: PopularResource[] = [
  {
    id: '1',
    title: 'Social Media Marketing for Wellness Professionals',
    type: 'resource',
    category: 'Marketing',
    url: '/business-hub/marketing/resources/1',
    views: 245,
    imageUrl: '/images/social-media-marketing.jpg'
  },
  {
    id: '2',
    title: 'Financial Planning Template for Spa Businesses',
    type: 'tool',
    category: 'Financial',
    url: '/business-hub/financial-management/resources/1',
    views: 189,
    imageUrl: '/images/financial-planning.jpg'
  },
  {
    id: '3',
    title: 'Client Acquisition Strategies for Beauty Businesses',
    type: 'article',
    category: 'Client Acquisition',
    url: '/business-hub/client-acquisition/strategies/1',
    views: 173,
    imageUrl: '/images/client-acquisition.jpg'
  },
  {
    id: '4',
    title: 'Pricing Calculator for Wellness Services',
    type: 'tool',
    category: 'Financial',
    url: '/business-hub/financial-management/tools/1',
    views: 162,
    imageUrl: '/images/pricing-calculator.jpg'
  },
  {
    id: '5',
    title: 'Email Marketing Automation for Wellness Businesses',
    type: 'resource',
    category: 'Marketing',
    url: '/business-hub/marketing/resources/2',
    views: 157,
    imageUrl: '/images/email-marketing.jpg'
  }
];

export default function BusinessHubAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<{
    totalViews: number;
    resourceViews: ViewData[];
    popularSearches: {term: string, count: number}[];
    searchHistory: SearchHistoryItem[];
    bookmarkedCount: number;
    topRated: PopularRating[];
  }>({
    totalViews: 0,
    resourceViews: [],
    popularSearches: [],
    searchHistory: [],
    bookmarkedCount: 0,
    topRated: []
  });
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    const data = getAnalyticsData();
    setAnalyticsData(data);
  }, []);
  
  // Metric cards with mock growth data
  const metricCards: MetricCard[] = [
    {
      title: 'Total Resource Views',
      value: analyticsData.totalViews,
      change: 12.5,
      changeType: 'increase',
      icon: <ChartBarIcon className="h-6 w-6 text-blue-500" />
    },
    {
      title: 'Resources Bookmarked',
      value: analyticsData.bookmarkedCount,
      change: 8.3,
      changeType: 'increase',
      icon: <BookmarkIcon className="h-6 w-6 text-yellow-500" />
    },
    {
      title: 'Search Queries',
      value: analyticsData.searchHistory.length,
      change: 15.2,
      changeType: 'increase',
      icon: <MagnifyingGlassIcon className="h-6 w-6 text-purple-500" />
    },
    {
      title: 'Resource Engagement',
      value: '42%',
      change: 5.7,
      changeType: 'increase',
      icon: <UserGroupIcon className="h-6 w-6 text-green-500" />
    }
  ];
  
  // Format date to readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <Layout>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <Link href="/business-hub" className="hover:text-blue-600">
                Business Hub
              </Link>
              <span className="mx-2">/</span>
              <span className="text-gray-700">Analytics Dashboard</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <BusinessHubNavigation />
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h1 className="text-2xl font-bold mb-2">Analytics Dashboard</h1>
                <p className="text-gray-600 mb-6">
                  Track your engagement with Business Hub resources and discover popular content.
                </p>
                
                {/* Metrics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {metricCards.map((card, index) => (
                    <div key={index} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-gray-500">{card.title}</p>
                          <p className="text-2xl font-bold mt-1">{card.value}</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-lg">
                          {card.icon}
                        </div>
                      </div>
                      <div className={`flex items-center mt-4 text-sm ${
                        card.changeType === 'increase' ? 'text-green-600' : 
                        card.changeType === 'decrease' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {card.changeType === 'increase' ? (
                          <ArrowUpIcon className="h-4 w-4 mr-1" />
                        ) : card.changeType === 'decrease' ? (
                          <ArrowDownIcon className="h-4 w-4 mr-1" />
                        ) : null}
                        <span>{card.change}% from last month</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Popular Resources */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <CircleStackIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Most Viewed Resources
                  </h2>
                  
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Resource
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Category
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Views
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {popularResources.map((resource) => (
                            <tr key={resource.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {resource.imageUrl && (
                                    <div className="flex-shrink-0 h-10 w-10 mr-3">
                                      <Image
                                        src={resource.imageUrl}
                                        alt={resource.title}
                                        width={40}
                                        height={40}
                                        className="rounded-md object-cover"
                                      />
                                    </div>
                                  )}
                                  <div>
                                    <Link href={resource.url} className="text-sm font-medium text-gray-900 hover:text-blue-600">
                                      {resource.title}
                                    </Link>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex text-xs font-semibold">
                                  {resource.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center text-sm text-gray-900">
                                  <ArrowTrendingUpIcon className="h-4 w-4 mr-2 text-green-500" />
                                  {resource.views}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <Badge variant="outline" className="capitalize">
                                  {resource.type}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                
                {/* Recent Activity and Popular Searches */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recent Activity */}
                  <div>
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
                      Your Recent Activity
                    </h2>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      {isClient && analyticsData.resourceViews.length > 0 ? (
                        <div className="space-y-4">
                          {analyticsData.resourceViews
                            .sort((a, b) => new Date(b.lastViewed).getTime() - new Date(a.lastViewed).getTime())
                            .slice(0, 5)
                            .map((item) => (
                              <div key={item.id} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                <div className="bg-blue-100 p-2 rounded-md mr-3">
                                  <ChartBarIcon className="h-5 w-5 text-blue-700" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Viewed: {item.name}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatDate(item.lastViewed)} • {item.views} {item.views === 1 ? 'view' : 'views'}
                                  </p>
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No recent activity to display</p>
                          <p className="text-sm mt-1">View resources to track your activity</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Popular Searches */}
                  <div>
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                      <MagnifyingGlassIcon className="h-5 w-5 mr-2 text-blue-600" />
                      Popular Searches
                    </h2>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      {isClient && analyticsData.popularSearches.length > 0 ? (
                        <div className="space-y-3">
                          {analyticsData.popularSearches.map((item, index) => (
                            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                              <div className="flex items-center">
                                <div className="bg-gray-100 h-7 w-7 rounded-full flex items-center justify-center mr-3 text-xs font-medium">
                                  {index + 1}
                                </div>
                                <p className="text-sm">{item.term}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {item.count} {item.count === 1 ? 'search' : 'searches'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No search data available</p>
                          <p className="text-sm mt-1">Search for resources to see popular terms</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 