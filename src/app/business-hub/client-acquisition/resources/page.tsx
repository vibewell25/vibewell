'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Layout } from '@/components/layout';
import { ClientAcquisitionNav } from '@/components/client-acquisition-nav';
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
    title: 'Client Retention Strategies for Wellness Businesses',
    author: 'David Johnson, Client Success Expert',
    date: '2023-09-15',
    readTime: '15 min',
    category: 'Retention',
    imageUrl: '/images/client-retention.jpg',
    excerpt: 'Learn effective strategies to keep your wellness clients coming back and increase your business sustainability.',
    tags: ['retention', 'client management', 'loyalty programs'],
    type: 'resource'
  },
  {
    id: '2',
    title: 'Referral Marketing for Health and Wellness Providers',
    author: 'Sophia Chen, Referral Marketing Strategist',
    date: '2023-10-20',
    readTime: '12 min',
    category: 'Referrals',
    imageUrl: '/images/referral-marketing.jpg',
    excerpt: 'Discover how to create and implement an effective referral program that turns your existing clients into your best marketers.',
    tags: ['referrals', 'marketing', 'client acquisition'],
    downloadUrl: '/downloads/referral-program-template.pdf',
    type: 'resource'
  },
  {
    id: '3',
    title: 'Converting First-Time Visitors into Regular Clients',
    author: 'Marcus Williams, Conversion Specialist',
    date: '2023-11-08',
    readTime: '18 min',
    category: 'Conversion',
    imageUrl: '/images/client-conversion.jpg',
    excerpt: 'Learn the strategies and tactics that significantly increase the likelihood of first-time visitors becoming loyal, long-term clients.',
    tags: ['conversion', 'client experience', 'onboarding'],
    premium: true,
    type: 'resource'
  }
];
export default function ClientAcquisitionResourcesPage() {
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
  // Handle resource sharing
  const handleShare = (resource: any) => {
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: resource.excerpt,
        url: window.location.origin + `/business-hub/client-acquisition/resources/${resource.id}`
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      alert(`Share this resource: ${window.location.origin}/business-hub/client-acquisition/resources/${resource.id}`);
    }
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
              <Link href="/business-hub/client-acquisition" className="hover:text-blue-600">
                Client Acquisition
              </Link>
              <span className="mx-2">/</span>
              <span className="text-gray-700">Resources</span>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <ClientAcquisitionNav />
            </div>
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h1 className="text-2xl font-bold mb-2">Client Acquisition Resources</h1>
                <p className="text-gray-600 mb-6">
                  Discover strategies and resources to attract, convert, and retain more clients for your wellness business.
                </p>
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-grow">
                    <Icons.MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search resources..."
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Icons.FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white"
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
                          <Link href={`/business-hub/client-acquisition/resources/${resource.id}`}>
                            <h2 className="text-xl font-semibold mb-2 hover:text-green-600">{resource.title}</h2>
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
                            <Link href={`/business-hub/client-acquisition/resources/${resource.id}`}>
                              <Button variant="default" className="bg-green-600 hover:bg-green-700">Read More</Button>
                            </Link>
                            {resource.downloadUrl && (
                              <Link href={resource.downloadUrl} target="_blank">
                                <Button variant="outline" className="flex items-center">
                                  <Icons.ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                              </Link>
                            )}
                            <Button 
                              variant="outline" 
                              className="flex items-center"
                              onClick={() => handleShare(resource)}
                            >
                              <Icons.ShareIcon className="h-4 w-4 mr-2" />
                              Share
                            </Button>
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