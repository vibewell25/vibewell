import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Layout } from '@/components/layout';
import { MarketingNav } from '@/components/marketing-nav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/star-rating';
import { getAverageRating } from '@/lib/ratings';
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
    excerpt:
      'Learn effective social media strategies tailored specifically for wellness businesses and practitioners.',
    tags: ['social media', 'digital marketing', 'content strategy'],
    type: 'resource',
{
    id: '2',
    title: 'Email Marketing Automation for Wellness Businesses',
    author: 'Michael Zhang, Email Marketing Consultant',
    date: '2023-10-05',
    readTime: '15 min',
    category: 'Email Marketing',
    imageUrl: '/images/email-marketing.jpg',
    excerpt:
      'Discover how to set up effective email marketing automation to nurture leads and retain clients.',
    tags: ['email marketing', 'automation', 'client nurturing'],
    premium: true,
    type: 'resource',
{
    id: '3',
    title: 'Content Marketing Strategy for Wellness Practitioners',
    author: 'Sophia Martinez, Content Strategist',
    date: '2023-11-12',
    readTime: '18 min',
    category: 'Content Marketing',
    imageUrl: '/images/content-marketing.jpg',
    excerpt:
      'Create a comprehensive content marketing strategy that positions you as an expert in your wellness niche.',
    tags: ['content marketing', 'SEO', 'blogging'],
    downloadUrl: '/downloads/content-strategy-template.pdf',
    type: 'resource',
];
export default function MarketingResourcesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // Get unique categories
  const categories = Array.from(new Set(resources.map((resource) => resource.category)));
  // Filter resources based on search term and selected category
  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      searchTerm === '' ||
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === null || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
return (
    <Layout>
      <div className="flex min-h-screen flex-col bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <div className="mb-4 flex items-center text-sm text-gray-500">
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
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <MarketingNav />
            </div>
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
                <h1 className="mb-2 text-2xl font-bold">Marketing Resources</h1>
                <p className="mb-6 text-gray-600">
                  Discover marketing resources specifically designed for wellness professionals to
                  attract, engage, and retain clients.
                </p>
                {/* Search and Filter */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                  <div className="relative flex-grow">
                    <Icons.MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search resources..."
                      className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Icons.FunnelIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                    <select
                      className="appearance-none rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={selectedCategory || ''}
                      onChange={(e) => setSelectedCategory(e.target.value || null)}
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Resources List */}
                <div className="space-y-6">
                  {filteredResources.length === 0 ? (
                    <div className="py-12 text-center">
                      <Icons.MagnifyingGlassIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                      <h3 className="mb-2 text-lg font-medium text-gray-900">No resources found</h3>
                      <p className="mb-4 text-gray-500">
                        Try adjusting your search or filter criteria
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCategory(null);
>
                        Clear filters
                      </Button>
                    </div>
                  ) : (
                    filteredResources.map((resource) => (
                      <div
                        key={resource.id}
                        className="flex flex-col overflow-hidden rounded-lg border border-gray-100 bg-white transition-shadow hover:shadow-md md:flex-row"
                      >
                        {resource.imageUrl && (
                          <div className="relative h-48 md:h-auto md:w-1/3">
                            <Image
                              src={resource.imageUrl}
                              alt={resource.title}
                              fill
                              className="object-cover"
                            />
                            {resource.premium && (
                              <div className="absolute right-2 top-2 rounded-full bg-yellow-500 px-2 py-1 text-xs text-white">
                                Premium
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex flex-1 flex-col p-6">
                          <div className="mb-2">
                            <Badge variant="outline">{resource.category}</Badge>
                            {resource.downloadUrl && (
                              <Badge
                                variant="outline"
                                className="ml-2 border-blue-200 bg-blue-50 text-blue-700"
                              >
                                Downloadable
                              </Badge>
                            )}
                          </div>
                          <Link href={`/business-hub/marketing/resources/${resource.id}`}>
                            <h2 className="mb-2 text-xl font-semibold hover:text-blue-600">
                              {resource.title}
                            </h2>
                          </Link>
                          <p className="mb-4 text-gray-600">{resource.excerpt}</p>
                          <div className="mb-4 flex flex-wrap gap-2">
                            {resource.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="mt-auto flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Icons.UserIcon className="mr-1 h-4 w-4" />
                              <span>{resource.author.split(',')[0]}</span>
                            </div>
                            <div className="flex items-center">
                              <Icons.CalendarIcon className="mr-1 h-4 w-4" />
                              <span>{new Date(resource.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                              <Icons.ClockIcon className="mr-1 h-4 w-4" />
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
                          <div className="mt-4 flex gap-2">
                            <Link href={`/business-hub/marketing/resources/${resource.id}`}>
                              <Button variant="default">Read More</Button>
                            </Link>
                            {resource.downloadUrl && (
                              <Link href={resource.downloadUrl} target="_blank">
                                <Button variant="outline" className="flex items-center">
                                  <Icons.ArrowDownTrayIcon className="mr-2 h-4 w-4" />
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
