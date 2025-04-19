'use client';
import { useState } from 'react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BusinessHubNavigation } from '@/components/business-hub-navigation';
import { FinancialNav } from '@/components/financial-nav';
import Link from 'next/link';
;
import { TopRatedResources } from '@/components/top-rated-resources';
import { Icons } from '@/components/icons';
interface ResourceType {
  id: string;
  title: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  imageUrl: string;
  excerpt: string;
}
// Financial resource data - in a real app, this would come from an API
const financialResources: ResourceType[] = [
  {
    id: '1',
    title: 'Wellness Business Financial Planning Guide',
    author: 'Sarah Johnson, CPA',
    date: '2023-08-15',
    readTime: '15 min',
    category: 'Planning',
    imageUrl: '/images/financial-planning.jpg',
    excerpt: 'Financial planning is critical for the long-term success of any wellness business. This guide will walk you through the essential steps to create a robust financial plan.'
  },
  {
    id: '2',
    title: 'Tax Strategies for Wellness Practitioners',
    author: 'Michael Chen, Tax Specialist',
    date: '2023-09-22',
    readTime: '12 min',
    category: 'Taxes',
    imageUrl: '/images/tax-strategies.jpg',
    excerpt: 'Understanding the tax implications specific to wellness practitioners can save you significant money and prevent compliance issues.'
  },
  {
    id: '3',
    title: 'Pricing Strategies for Wellness Services',
    author: 'Elena Rodriguez, Business Strategist',
    date: '2023-10-10',
    readTime: '10 min',
    category: 'Pricing',
    imageUrl: '/images/pricing-strategies.jpg',
    excerpt: 'Pricing wellness services requires a balance between perceived value, market rates, and your financial needs.'
  },
  {
    id: '4',
    title: 'Cash Flow Management for Wellness Businesses',
    author: 'Thomas Wright, Financial Advisor',
    date: '2023-11-05',
    readTime: '14 min',
    category: 'Cash Flow',
    imageUrl: '/images/cash-flow.jpg',
    excerpt: 'Cash flow management is particularly important in the wellness industry due to seasonal fluctuations and variable client attendance.'
  },
  {
    id: '5',
    title: 'Financial Metrics Dashboard for Wellness Providers',
    author: 'Sophia Garcia, Business Analyst',
    date: '2023-12-12',
    readTime: '18 min',
    category: 'Reporting',
    imageUrl: '/images/financial-metrics.jpg',
    excerpt: 'Identifying and tracking the right KPIs is essential for making informed business decisions.'
  },
  {
    id: '6',
    title: 'Budgeting Templates for Wellness Entrepreneurs',
    author: 'Daniel Smith, Accountant',
    date: '2024-01-18',
    readTime: '8 min',
    category: 'Budgeting',
    imageUrl: '/images/budgeting-templates.jpg',
    excerpt: 'Understanding the key components of an effective budget for wellness practices and studios.'
  },
  {
    id: '7',
    title: 'Profit Maximization Strategies for Wellness Providers',
    author: 'Rebecca Johnson, Business Coach',
    date: '2024-02-22',
    readTime: '16 min',
    category: 'Profitability',
    imageUrl: '/images/profit-maximization.jpg',
    excerpt: 'Identifying the key factors that influence profitability in wellness businesses.'
  }
];
const categories = [
  'All',
  'Planning',
  'Budgeting',
  'Pricing',
  'Taxes',
  'Cash Flow',
  'Reporting',
  'Profitability'
];
export default function FinancialResourcesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  // Filter resources based on search query and category
  const filteredResources = financialResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Business Hub</h1>
        <p className="text-gray-600 mb-6">Tools, resources, and education to grow your wellness business</p>
        {/* Main Navigation */}
        <BusinessHubNavigation />
        {/* Financial Management Navigation */}
        <FinancialNav />
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-blue-100 to-green-100 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-2">Financial Resources</h2>
            <p className="text-lg mb-4">
              Explore our collection of guides, templates, and tools to manage your wellness business finances effectively
            </p>
            {/* Search Input */}
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icons.MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search financial resources..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Main content - Resources */}
            <div className="lg:col-span-3">
              {/* Resources Grid */}
              {filteredResources.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-500">No resources found matching your criteria.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map(resource => (
                    <Link 
                      key={resource.id}
                      href={`/business-hub/financial-management/resources/${resource.id}`}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="h-48 bg-gray-200 relative">
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            {resource.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2 line-clamp-2">{resource.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">{resource.excerpt}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Icons.UserIcon className="h-4 w-4 mr-1" />
                          <span className="truncate mr-4">{resource.author}</span>
                          <Icons.ClockIcon className="h-4 w-4 mr-1" />
                          <span>{resource.readTime}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Top Rated Resources */}
              <TopRatedResources limit={5} />
              {/* Recently Viewed */}
              <div className="p-4 bg-white shadow-sm rounded-lg">
                <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                <Link 
                  href="/business-hub/bookmarks"
                  className="block p-3 bg-blue-50 rounded-lg mb-3 hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Icons.BookmarkIcon className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-blue-700">Your Bookmarks</span>
                  </div>
                </Link>
                <Link 
                  href="/business-hub/bookmarks?tab=recent"
                  className="block p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Icons.ClockIcon className="h-5 w-5 text-purple-500 mr-2" />
                    <span className="text-purple-700">Recently Viewed</span>
                  </div>
                </Link>
              </div>
              {/* Help Box */}
              <div className="p-4 bg-green-50 shadow-sm rounded-lg">
                <h3 className="text-lg font-medium text-green-800 mb-2">Need Financial Advice?</h3>
                <p className="text-green-700 text-sm mb-4">
                  Connect with a financial advisor specializing in wellness businesses.
                </p>
                <Link 
                  href="/business-hub/advisors"
                  className="block w-full text-center py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Find an Advisor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 