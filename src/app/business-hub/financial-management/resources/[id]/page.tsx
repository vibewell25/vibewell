'use client';

import React from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeftIcon, 
  ArrowDownTrayIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  CalculatorIcon,
  ClipboardDocumentCheckIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { PremiumContentLock } from '@/components/premium-content-lock';
import Link from 'next/link';
import { Layout } from '@/components/layout';
import { BusinessHubNavigation } from '@/components/business-hub-navigation';
import { FinancialNav } from '@/components/financial-nav';
import { addBookmark, removeBookmark, isBookmarked as checkIsBookmarked, trackRecentView } from '@/lib/bookmarks';
import { getUserRating, saveRating, getAverageRating } from '@/lib/ratings';
import { StarRating } from '@/components/star-rating';
import { ResourceReview } from '@/components/resource-review';

// Financial resource data - in a real app, this would come from an API
const financialResources = [
  {
    id: '1',
    title: 'Wellness Business Financial Planning Guide',
    author: 'Sarah Johnson, CPA',
    date: '2023-08-15',
    readTime: '15 min',
    category: 'Planning',
    imageUrl: '/images/financial-planning.jpg',
    content: `
      <h2>Introduction to Financial Planning for Wellness Businesses</h2>
      <p>Financial planning is critical for the long-term success of any wellness business. This guide will walk you through the essential steps to create a robust financial plan tailored to the wellness industry.</p>
      
      <h2>Understanding Your Revenue Streams</h2>
      <p>Wellness businesses typically have multiple revenue streams, including:</p>
      <ul>
        <li>Direct service fees</li>
        <li>Product sales</li>
        <li>Membership subscriptions</li>
        <li>Workshop and event fees</li>
      </ul>
      <p>Understanding and forecasting each stream is essential for accurate planning.</p>
      
      <h2>Creating a Budget</h2>
      <p>Your budget should include fixed costs (rent, insurance, software subscriptions) and variable costs (supplies, contractor payments). Wellness businesses often overlook the seasonality of client demand, which should be factored into your budget planning.</p>
      
      <h2>Financial Metrics to Track</h2>
      <p>Key metrics for wellness businesses include:</p>
      <ul>
        <li>Client acquisition cost</li>
        <li>Client lifetime value</li>
        <li>Retention rate</li>
        <li>Average revenue per client</li>
        <li>Utilization rate (for space or equipment)</li>
      </ul>
      
      <h2>Cash Flow Management</h2>
      <p>The wellness industry often experiences seasonal fluctuations. Maintaining a 3-6 month cash reserve is recommended to navigate slower periods and unexpected expenses.</p>
    `,
    relatedResources: ['2', '5', '7']
  },
  {
    id: '2',
    title: 'Tax Strategies for Wellness Practitioners',
    author: 'Michael Chen, Tax Specialist',
    date: '2023-09-22',
    readTime: '12 min',
    category: 'Taxes',
    imageUrl: '/images/tax-strategies.jpg',
    content: `
      <h2>Tax Considerations for Wellness Professionals</h2>
      <p>Understanding the tax implications specific to wellness practitioners can save you significant money and prevent compliance issues.</p>
      
      <h2>Deductible Expenses</h2>
      <p>Common deductible expenses for wellness professionals include:</p>
      <ul>
        <li>Continuing education and certifications</li>
        <li>Equipment and supplies</li>
        <li>Home office expenses</li>
        <li>Professional insurance</li>
        <li>Marketing and advertising</li>
      </ul>
      
      <h2>Business Structure Considerations</h2>
      <p>Choosing between sole proprietorship, LLC, S-Corp, or other structures has significant tax implications. This section explores the pros and cons of each for wellness businesses.</p>
      
      <h2>Quarterly Estimated Taxes</h2>
      <p>Most wellness practitioners need to pay quarterly estimated taxes. We cover how to calculate these payments and common pitfalls to avoid.</p>
      
      <h2>Record Keeping Best Practices</h2>
      <p>Proper documentation is essential for maximizing deductions while staying compliant with tax regulations.</p>
    `,
    relatedResources: ['1', '3', '6']
  },
  {
    id: '3',
    title: 'Pricing Strategies for Wellness Services',
    author: 'Elena Rodriguez, Business Strategist',
    date: '2023-10-10',
    readTime: '10 min',
    category: 'Pricing',
    imageUrl: '/images/pricing-strategies.jpg',
    content: `
      <h2>The Psychology of Pricing in Wellness</h2>
      <p>Pricing wellness services requires a balance between perceived value, market rates, and your financial needs.</p>
      
      <h2>Value-Based Pricing Models</h2>
      <p>Learn how to price based on the transformation and outcomes you provide rather than time spent.</p>
      
      <h2>Package and Membership Structures</h2>
      <p>Effective package and membership models can increase client commitment while stabilizing your income.</p>
      
      <h2>When and How to Raise Your Rates</h2>
      <p>Guidelines for implementing price increases without losing clients.</p>
      
      <h2>Handling Price Objections</h2>
      <p>Strategies for confidently addressing concerns about your pricing.</p>
    `,
    relatedResources: ['1', '4', '7']
  },
  {
    id: '4',
    title: 'Cash Flow Management for Wellness Businesses',
    author: 'Thomas Wright, Financial Advisor',
    date: '2023-11-05',
    readTime: '14 min',
    category: 'Cash Flow',
    imageUrl: '/images/cash-flow.jpg',
    content: `
      <h2>Understanding Cash Flow in the Wellness Industry</h2>
      <p>Cash flow management is particularly important in the wellness industry due to seasonal fluctuations and variable client attendance.</p>
      
      <h2>Creating a Cash Flow Forecast</h2>
      <p>Learn how to create an accurate 12-month cash flow forecast that accounts for the unique patterns of wellness businesses.</p>
      
      <h2>Managing Seasonal Fluctuations</h2>
      <p>Strategies for maintaining healthy cash flow during traditionally slower seasons in the wellness industry.</p>
      
      <h2>Emergency Fund Considerations</h2>
      <p>Guidelines for building and maintaining an appropriate emergency fund for your wellness business.</p>
      
      <h2>Using Technology to Improve Cash Flow</h2>
      <p>How modern payment systems, automated billing, and financial software can improve your cash flow management.</p>
    `,
    relatedResources: ['1', '5', '7']
  },
  {
    id: '5',
    title: 'Financial Metrics Dashboard for Wellness Providers',
    author: 'Sophia Garcia, Business Analyst',
    date: '2023-12-12',
    readTime: '18 min',
    category: 'Reporting',
    imageUrl: '/images/financial-metrics.jpg',
    content: `
      <h2>Key Performance Indicators for Wellness Businesses</h2>
      <p>Identifying and tracking the right KPIs is essential for making informed business decisions.</p>
      
      <h2>Building a Financial Dashboard</h2>
      <p>Step-by-step instructions for creating a customized financial dashboard tailored to wellness businesses.</p>
      
      <h2>Revenue Metrics to Track</h2>
      <p>Essential revenue metrics including average client value, retention rates, and service category performance.</p>
      
      <h2>Expense Analysis Framework</h2>
      <p>A structured approach to analyzing your expenses and identifying opportunities for optimization.</p>
      
      <h2>Profitability Analysis by Service</h2>
      <p>How to calculate and track the true profitability of each service you offer.</p>
    `,
    relatedResources: ['1', '4', '6']
  },
  {
    id: '6',
    title: 'Budgeting Templates for Wellness Entrepreneurs',
    author: 'Daniel Smith, Accountant',
    date: '2024-01-18',
    readTime: '8 min',
    category: 'Budgeting',
    imageUrl: '/images/budgeting-templates.jpg',
    content: `
      <h2>Budgeting Fundamentals for Wellness Businesses</h2>
      <p>Understanding the key components of an effective budget for wellness practices and studios.</p>
      
      <h2>Annual Budget Template</h2>
      <p>A comprehensive annual budget template with categories specifically tailored to wellness businesses.</p>
      
      <h2>Startup Budget Considerations</h2>
      <p>Special budgeting considerations for new wellness businesses in their first year of operation.</p>
      
      <h2>Budget Revision Process</h2>
      <p>Guidelines for regularly reviewing and adjusting your budget as your business evolves.</p>
      
      <h2>Budgeting for Growth</h2>
      <p>How to create a budget that supports your growth objectives while maintaining financial stability.</p>
    `,
    relatedResources: ['1', '2', '5']
  },
  {
    id: '7',
    title: 'Profit Maximization Strategies for Wellness Providers',
    author: 'Rebecca Johnson, Business Coach',
    date: '2024-02-22',
    readTime: '16 min',
    category: 'Profitability',
    imageUrl: '/images/profit-maximization.jpg',
    content: `
      <h2>Understanding Profit Levers in Wellness Businesses</h2>
      <p>Identifying the key factors that influence profitability in wellness businesses.</p>
      
      <h2>Service Menu Optimization</h2>
      <p>How to analyze and refine your service offerings to maximize profitability without sacrificing quality.</p>
      
      <h2>Capacity Utilization Strategies</h2>
      <p>Techniques for optimizing your schedule and space to increase revenue without raising prices.</p>
      
      <h2>Client Retention Economics</h2>
      <p>Understanding the financial impact of client retention and implementing strategies to improve it.</p>
      
      <h2>Implementing the Profit First System</h2>
      <p>A practical guide to adapting the Profit First methodology for wellness businesses.</p>
    `,
    relatedResources: ['3', '4', '5']
  }
];

// Analytics tracking function
const trackResourceView = (resourceId: string, resourceName: string) => {
  // In a real app, this would send analytics data to your backend
  if (typeof window !== 'undefined') {
    const now = new Date().toISOString();
    
    try {
      const viewData = JSON.parse(localStorage.getItem('resource_view_log') || '{}');
      viewData[resourceId] = { 
        id: resourceId,
        name: resourceName, 
        lastViewed: now,
        views: (viewData[resourceId]?.views || 0) + 1
      };
      localStorage.setItem('resource_view_log', JSON.stringify(viewData));
      
      // Also update a "popular resources" counter
      const popularResources = JSON.parse(localStorage.getItem('popular_resources') || '{}');
      popularResources[resourceId] = (popularResources[resourceId] || 0) + 1;
      localStorage.setItem('popular_resources', JSON.stringify(popularResources));
    } catch (e) {
      console.error('Failed to track resource view', e);
    }
  }
};

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const resourceId = params.id as string;
  
  const [resource, setResource] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<{ average: number, count: number }>({ average: 0, count: 0 });

  // Check if the resource is bookmarked
  useEffect(() => {
    if (typeof window !== 'undefined' && resourceId) {
      // Check if this resource is already bookmarked
      const bookmarked = checkIsBookmarked(resourceId, 'resource');
      setIsBookmarked(bookmarked);
    }
  }, [resourceId]);

  // Check if the user has rated this resource
  useEffect(() => {
    if (typeof window !== 'undefined' && resourceId) {
      // Get user's rating for this resource
      const rating = getUserRating(resourceId, 'resource');
      setUserRating(rating);
      
      // Get average rating for this resource
      const avgRating = getAverageRating(resourceId, 'resource');
      setAverageRating(avgRating);
    }
  }, [resourceId]);

  useEffect(() => {
    // Fetch the resource by ID - in a real app, this would be an API call
    setLoading(true);
    
    try {
      const foundResource = financialResources.find(r => r.id === resourceId);
      
      if (foundResource) {
        setResource(foundResource);
        
        // Track this view for analytics and recently viewed
        trackResourceView(resourceId, foundResource.title);
        
        // Track in recently viewed
        trackRecentView({
          id: resourceId,
          type: 'resource',
          title: foundResource.title,
          description: foundResource.content.substring(0, 100) + '...',
          url: `/business-hub/financial-management/resources/${resourceId}`,
          category: foundResource.category
        });
      } else {
        setError('Resource not found');
      }
    } catch (err) {
      setError('Failed to load resource');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [resourceId]);

  // Toggle bookmark state
  const toggleBookmark = () => {
    if (!resource) return;
    
    if (isBookmarked) {
      // Remove bookmark
      removeBookmark(resourceId, 'resource');
      setIsBookmarked(false);
    } else {
      // Add bookmark
      addBookmark({
        id: resourceId,
        type: 'resource',
        title: resource.title,
        description: resource.content.substring(0, 100) + '...',
        url: `/business-hub/financial-management/resources/${resourceId}`,
        category: resource.category
      });
      setIsBookmarked(true);
    }
  };

  // Handle rating change
  const handleRatingChange = (rating: number) => {
    if (!resource) return;
    
    saveRating(resourceId, 'resource', rating);
    setUserRating(rating);
    
    // Update average rating
    const newAverage = getAverageRating(resourceId, 'resource');
    setAverageRating(newAverage);
  };

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Business Hub</h1>
          <p className="text-gray-600 mb-6">Tools, resources, and education to grow your wellness business</p>
          
          {/* Main Navigation */}
          <BusinessHubNavigation />
          
          {/* Financial Management Navigation */}
          <FinancialNav />
          
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error || !resource) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Business Hub</h1>
          <p className="text-gray-600 mb-6">Tools, resources, and education to grow your wellness business</p>
          
          {/* Main Navigation */}
          <BusinessHubNavigation />
          
          {/* Financial Management Navigation */}
          <FinancialNav />
          
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              {error || 'Resource not found'}
            </h1>
            <p className="mb-6">The resource you're looking for could not be found.</p>
            <Link href="/business-hub/financial-management">
              <Button>
                Back to Financial Resources
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Find related resources
  const relatedResources = financialResources.filter(item => 
    resource.relatedResources.includes(item.id)
  ).slice(0, 3);

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-2">Business Hub</h1>
        <p className="text-gray-600 mb-6">Tools, resources, and education to grow your wellness business</p>
        
        {/* Main Navigation */}
        <BusinessHubNavigation />
        
        {/* Financial Management Navigation */}
        <FinancialNav />
        
        <Link href="/business-hub/financial-management" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Financial Management
        </Link>
        
        <article className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex justify-between p-4">
            <div className="flex items-center">
              <StarRating 
                initialRating={averageRating.average}
                readonly={true}
                showCount={true}
                count={averageRating.count}
              />
            </div>
            <button
              onClick={toggleBookmark}
              className={`p-2 rounded-full ${isBookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-600'}`}
              title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
            >
              <BookmarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {resource.imageUrl && (
            <div className="relative h-64 w-full bg-gray-200">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${resource.imageUrl})` }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <div className="inline-block px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-md mb-2">
                  {resource.category}
                </div>
                <h1 className="text-3xl font-bold">{resource.title}</h1>
              </div>
            </div>
          )}
          
          <div className="p-6">
            <div className="flex items-center text-gray-500 text-sm mb-6">
              <UserIcon className="h-4 w-4 mr-1" />
              <span className="mr-4">{resource.author}</span>
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span className="mr-4">{new Date(resource.date).toLocaleDateString()}</span>
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>{resource.readTime}</span>
            </div>
            
            <div 
              className="prose max-w-none prose-blue prose-headings:text-gray-800"
              dangerouslySetInnerHTML={{ __html: resource.content }}
            />
          </div>
          
          <div className="px-6 pb-6">
            <ResourceReview resourceId={resourceId} resourceType="resource" />
          </div>
        </article>
        
        {relatedResources.length > 0 && (
          <div className="max-w-4xl mx-auto mt-12">
            <h2 className="text-xl font-bold mb-4">Related Resources</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedResources.map(related => (
                <Link 
                  key={related.id} 
                  href={`/business-hub/financial-management/resources/${related.id}`}
                  className="block bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{related.title}</h3>
                    <div className="flex items-center text-gray-500 text-sm">
                      <DocumentTextIcon className="h-4 w-4 mr-1" />
                      <span className="mr-2">{related.category}</span>
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>{related.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 