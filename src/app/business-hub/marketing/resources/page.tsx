'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Layout } from '@/components/layout';
import { BusinessHubNavigation } from '@/components/business-hub-navigation';
import { MarketingNav } from '@/components/marketing-nav';
;
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/star-rating';
import { getAverageRating } from '@/lib/ratings';
import { isBookmarked } from '@/lib/bookmarks';
import { Icons } from '@/components/icons';
// Import resource data (in a real app, this would be fetched from an API)
const resources = [
  {
    id: '1',
    title: 'Social Media Marketing for Wellness Professionals',
    author: 'Emma Roberts, Digital Marketing Specialist',
    date: '2023-09-10',
    readTime: '12 min',
    category: 'Social Media',
    imageUrl: '/images/social-media-marketing.jpg',
    excerpt: 'Learn effective social media strategies tailored specifically for wellness businesses and practitioners.',
    tags: ['social media', 'digital marketing', 'content strategy'],
    type: 'resource'
  },
  {
    id: '2',
    title: 'Email Marketing Automation for Wellness Businesses',
    author: 'Michael Zhang, Email Marketing Consultant',
    date: '2023-10-05',
    readTime: '15 min',
    category: 'Email Marketing',
    imageUrl: '/images/email-marketing.jpg',
    excerpt: 'Discover how to set up effective email marketing automation to nurture leads and retain clients.',
    tags: ['email marketing', 'automation', 'client nurturing'],
    premium: true,
    type: 'resource'
  },
  {
    id: '3',
    title: 'Content Marketing Strategy for Wellness Practitioners',
    author: 'Sophia Martinez, Content Strategist',
    date: '2023-11-12',
    readTime: '18 min',
    category: 'Content Marketing',
    imageUrl: '/images/content-marketing.jpg',
    excerpt: 'Create a comprehensive content marketing strategy that positions you as an expert in your wellness niche.',
    tags: ['content marketing', 'SEO', 'blogging'],
    downloadUrl: '/downloads/content-strategy-template.pdf',
    type: 'resource'
  }
];
export default function MarketingResourcesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // Get unique categories
  const categories = Array.from(new Set(resources.map(resource => resource.category)));
  // Filter resources based on search term and selected category
  const filteredResources = resources.filter(resource => {
    const matchesSearch = 
      searchTerm === '' ||
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === null || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
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
              <Link href="/business-hub/marketing" className="hover:text-blue-600">
                Marketing
              </Link>
              <span className="mx-2">/</span>
              <span className="text-gray-700">Resources</span>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <MarketingNav />
            </div>
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h1 className="text-2xl font-bold mb-2">Marketing Resources</h1>
                <p className="text-gray-600 mb-6">
                  Discover marketing resources specifically designed for wellness professionals to attract, engage, and retain clients.
                </p>
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-grow">
                    <Icons.MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search resources..."
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Icons.FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                      value={selectedCategory || ''}
                      onChange={(e) => setSelectedCategory(e.target.value || null)}
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Resources List */}
                <div className="space-y-6">
                  {filteredResources.length === 0 ? (
                    <div className="text-center py-12">
                      <Icons.MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
                      <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
                      <Button variant="outline" onClick={() => {setSearchTerm(''); setSelectedCategory(null);}}>
                        Clear filters
                      </Button>
                    </div>
                  ) : (
                    filteredResources.map(resource => (
                      <div key={resource.id} className="flex flex-col md:flex-row bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        {resource.imageUrl && (
                          <div className="md:w-1/3 h-48 md:h-auto relative">
                            <Image
                              src={resource.imageUrl}
                              alt={resource.title}
                              fill
                              className="object-cover"
                            />
                            {resource.premium && (
                              <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                                Premium
                              </div>
                            )}
                          </div>
                        )}
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="mb-2">
                            <Badge variant="outline">{resource.category}</Badge>
                            {resource.downloadUrl && (
                              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                                Downloadable
                              </Badge>
                            )}
                          </div>
                          <Link href={`/business-hub/marketing/resources/${resource.id}`}>
                            <h2 className="text-xl font-semibold mb-2 hover:text-blue-600">{resource.title}</h2>
                          </Link>
                          <p className="text-gray-600 mb-4">{resource.excerpt}</p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {resource.tags.map(tag => (
                              <span 
                                key={tag} 
                                className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-auto space-x-4">
                            <div className="flex items-center">
                              <Icons.UserIcon className="h-4 w-4 mr-1" />
                              <span>{resource.author.split(',')[0]}</span>
                            </div>
                            <div className="flex items-center">
                              <Icons.CalendarIcon className="h-4 w-4 mr-1" />
                              <span>{new Date(resource.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                              <Icons.ClockIcon className="h-4 w-4 mr-1" />
                              <span>{resource.readTime}</span>
                            </div>
                            <div>
                              <StarRating
                                initialRating={getAverageRating(resource.id, resource.type).average}
                                readonly={true}
                                size="sm"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Link href={`/business-hub/marketing/resources/${resource.id}`}>
                              <Button variant="default">Read More</Button>
                            </Link>
                            {resource.downloadUrl && (
                              <Link href={resource.downloadUrl} target="_blank">
                                <Button variant="outline" className="flex items-center">
                                  <Icons.ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 