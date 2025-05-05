import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import Image from 'next/image';
import { BusinessHubNavigation } from '@/components/business-hub-navigation';
import { Layout } from '@/components/layout';
import { TopRatedResources } from '@/components/top-rated-resources';
import { Icons } from '@/components/icons';
// Types for resources and tools
interface Resource {
  id: string;
  title: string;
  description: string;
  image: string;
  type: 'guide' | 'template' | 'video' | 'webinar' | 'tool';
  category: string;
  tags: string[];
  premium: boolean;
  viewUrl: string;
  downloadUrl?: string;
  date: string;
interface SuccessStory {
  id: string;
  businessName: string;
  ownerName: string;
  image: string;
  quote: string;
  achievement: string;
  tags: string[];
interface MarketingTool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  premium: boolean;
  url: string;
export default function BusinessHub() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [resourceType, setResourceType] = useState('all');
  // Marketing tools data
  const marketingTools: MarketingTool[] = [
    {
      id: '1',
      name: 'Email Campaign Builder',
      description:
        'Create beautiful email templates and automated sequences to nurture client relationships.',
      icon: <Icons.MegaphoneIcon className="h-8 w-8 text-indigo-500" />,
      premium: false,
      url: '/business-hub/marketing/email-campaigns',
{
      id: 'social-media',
      name: 'Social Media Toolkit',
      description: 'Pre-designed templates and scheduling tools for your social media marketing.',
      icon: <Icons.PhotoIcon className="h-10 w-10 text-purple-500" />,
      url: '/business-hub/tools/social-media',
      premium: false,
{
      id: 'email-templates',
      name: 'Email Campaign Builder',
      description: 'Create professional email campaigns to engage clients and promote offers.',
      icon: <Icons.EnvelopeSolid className="h-10 w-10 text-blue-500" />,
      url: '/business-hub/tools/email-marketing',
      premium: true,
{
      id: 'analytics',
      name: 'Performance Analytics',
      description: 'Track the effectiveness of your marketing efforts and customer engagement.',
      icon: <Icons.ChartBarIcon className="h-10 w-10 text-green-500" />,
      url: '/business-hub/tools/analytics',
      premium: true,
{
      id: 'reviews',
      name: 'Review Management',
      description: 'Tools to collect, manage, and showcase client reviews and testimonials.',
      icon: <Icons.StarSolid className="h-10 w-10 text-yellow-500" />,
      url: '/business-hub/tools/reviews',
      premium: false,
{
      id: 'lead-gen',
      name: 'Lead Generation Tools',
      description: 'Create landing pages and promotional offers to attract new clients.',
      icon: <Icons.UsersSolid className="h-10 w-10 text-red-500" />,
      url: '/business-hub/tools/lead-generation',
      premium: true,
{
      id: 'content-calendar',
      name: 'Content Calendar',
      description: 'Plan and organize your marketing content across all channels.',
      icon: <Icons.CalendarIcon className="h-10 w-10 text-indigo-500" />,
      url: '/business-hub/tools/content-calendar',
      premium: false,
];
  // Resources data
  const resources: Resource[] = [
    {
      id: '1',
      title: 'The Complete Guide to Social Media Marketing for Beauty Businesses',
      description:
        'Learn how to leverage Instagram, TikTok, and other platforms to showcase your services and attract new clients.',
      image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7',
      type: 'guide',
      category: 'marketing',
      tags: ['social media', 'instagram', 'tiktok'],
      premium: false,
      viewUrl: '/business-hub/resources/social-media-guide',
      date: '2023-08-15',
{
      id: '2',
      title: 'Email Templates for Client Retention',
      description:
        'Ready-to-use email templates for welcoming new clients, appointment reminders, follow-ups, and special offers.',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3',
      type: 'template',
      category: 'client-retention',
      tags: ['email', 'templates', 'client retention'],
      premium: true,
      downloadUrl: '/downloads/email-templates.zip',
      viewUrl: '/business-hub/resources/email-templates',
      date: '2023-09-21',
{
      id: '3',
      title: 'How to Price Your Services for Maximum Profit',
      description:
        'A comprehensive guide to pricing strategies for wellness and beauty services, including cost analysis and market positioning.',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f',
      type: 'guide',
      category: 'business-strategy',
      tags: ['pricing', 'profitability', 'strategy'],
      premium: true,
      viewUrl: '/business-hub/resources/pricing-guide',
      date: '2023-10-05',
{
      id: '4',
      title: 'Client Onboarding Process Walkthrough',
      description:
        'Watch how successful spa owners create a memorable first impression that turns new visitors into loyal clients.',
      image: 'https://images.unsplash.com/photo-1595247299149-85c93280604d',
      type: 'video',
      category: 'client-experience',
      tags: ['onboarding', 'client experience', 'loyalty'],
      premium: false,
      viewUrl: '/business-hub/resources/client-onboarding-video',
      date: '2023-11-12',
{
      id: '5',
      title: 'Seasonal Promotion Calendar Template',
      description:
        'Plan your promotions around holidays, seasons, and local events with this customizable calendar.',
      image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88',
      type: 'template',
      category: 'marketing',
      tags: ['promotions', 'seasonal', 'planning'],
      premium: false,
      downloadUrl: '/downloads/seasonal-promotions.xlsx',
      viewUrl: '/business-hub/resources/seasonal-promotions',
      date: '2023-12-03',
{
      id: '6',
      title: 'Converting Leads to Bookings: Sales Techniques for Service Providers',
      description:
        'Learn consultative selling approaches that help potential clients understand the value of your services.',
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df',
      type: 'webinar',
      category: 'sales',
      tags: ['sales', 'conversion', 'communication'],
      premium: true,
      viewUrl: '/business-hub/resources/sales-techniques-webinar',
      date: '2024-01-18',
];
  // Success stories data
  const successStories: SuccessStory[] = [
    {
      id: '1',
      businessName: 'Glow Beauty Lounge',
      ownerName: 'Sarah Mitchell',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f',
      quote:
        "Using the email templates and social media toolkit, I've managed to increase my client retention by 45% in just three months.",
      achievement: '200% increase in Instagram following, 45% improvement in client retention',
      tags: ['social media', 'email marketing', 'small business'],
{
      id: '2',
      businessName: 'Zen Wellness Center',
      ownerName: 'Michael Rodriguez',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      quote:
        'The performance analytics tool helped me identify which services were most profitable, allowing me to restructure my offerings and increase revenue.',
      achievement: '35% increase in monthly revenue, optimized service menu',
      tags: ['analytics', 'business strategy', 'service optimization'],
{
      id: '3',
      businessName: 'Pure Skin Aesthetics',
      ownerName: 'Jennifer Lee',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
      quote:
        'The lead generation tools transformed my business. I implemented the landing page templates and within weeks saw a dramatic increase in new client inquiries.',
      achievement: '68 new clients in 2 months, 320% ROI on marketing spending',
      tags: ['lead generation', 'website optimization', 'new clients'],
];
  // Filter resources based on search, category, and type
  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      searchTerm === '' ||
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesType = resourceType === 'all' || resource.type === resourceType;
    return matchesSearch && matchesCategory && matchesType;
return (
    <Layout>
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Business Hub</h1>
        {/* Top section with search and featured */}
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          {/* Search and categories - 2/3 width */}
          <div className="space-y-6 md:col-span-2">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Find Resources</h2>
              {/* Search input */}
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Search for business resources..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-4 top-3.5 text-gray-400">
                  <Icons.MagnifyingGlassIcon className="h-5 w-5" />
                </div>
              </div>
              {/* Categories */}
              <div>
                <h3 className="mb-3 font-medium">Browse by Category</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    'all',
                    'marketing',
                    'client-retention',
                    'business-strategy',
                    'client-experience',
                    'sales',
                  ].map((category) => (
                    <button
                      key={category}
                      className={`rounded-full px-3 py-1.5 text-sm ${
                        selectedCategory === category
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Top Rated Resources */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <TopRatedResources limit={3} />
            </div>
          </div>
          {/* Featured tools - 1/3 width */}
          <div className="flex flex-col justify-between rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white">
            <div>
              <h2 className="mb-2 text-xl font-semibold">Featured Tools</h2>
              <p className="mb-6 text-blue-100">
                Discover our newest tools to help your business grow
              </p>
              <div className="mb-6 space-y-4">
                {marketingTools.slice(0, 3).map((tool) => (
                  <div key={tool.name} className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
                    <h3 className="font-medium text-white">{tool.name}</h3>
                    <p className="text-sm text-blue-100">{tool.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <a
              href="/business-hub/marketing"
              className="block w-full rounded-lg bg-white py-2 text-center font-medium text-blue-600 transition-colors hover:bg-blue-50"
            >
              View All Marketing Tools
            </a>
          </div>
        </div>
        {/* Main Navigation */}
        <BusinessHubNavigation />
        {/* Hero Section */}
        <div className="mb-12 rounded-xl bg-gradient-to-r from-purple-100 to-blue-100 p-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-4 text-4xl font-bold">Business Building Hub</h1>
            <p className="mb-8 text-lg">
              Everything you need to grow your beauty or wellness business, all in one place. Access
              marketing tools, business resources, and expert strategies to attract and retain
              clients.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button className="bg-indigo-600 hover:bg-indigo-700">Browse Marketing Tools</Button>
              <Button
                variant="outline"
                className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
              >
                Join Next Webinar
              </Button>
            </div>
          </div>
        </div>
        {/* Marketing Tools Section */}
        <section className="mb-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Marketing Tools</h2>
            <Link
              href="/business-hub/tools"
              className="font-medium text-indigo-600 hover:text-indigo-700"
            >
              View All Tools →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {marketingTools.map((tool) => (
              <div
                key={tool.id}
                className="rounded-lg border border-gray-100 bg-white p-6 shadow-md"
              >
                <div className="mb-4 flex items-start">
                  <div className="mr-4 rounded-lg bg-gray-50 p-3">{tool.icon}</div>
                  <div>
                    <h3 className="mb-1 text-xl font-semibold">{tool.name}</h3>
                    {tool.premium && (
                      <Badge variant="default" className="mb-2 bg-indigo-600 text-white">
                        Premium
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="mb-4 text-gray-600">{tool.description}</p>
                <Link href={tool.url}>
                  <Button className="w-full" variant={tool.premium ? 'outline' : 'default'}>
                    {tool.premium ? 'Upgrade to Access' : 'Use Tool'}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </section>
        {/* Resources Section */}
        <section className="mb-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Resources & Guides</h2>
            <div className="relative">
              <Icons.MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <Input
                type="text"
                placeholder="Search resources..."
                className="w-64 pl-10"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {/* Resource Filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className="text-sm"
            >
              All Categories
            </Button>
            <Button
              variant={selectedCategory === 'marketing' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('marketing')}
              className="text-sm"
            >
              Marketing
            </Button>
            <Button
              variant={selectedCategory === 'client-retention' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('client-retention')}
              className="text-sm"
            >
              Client Retention
            </Button>
            <Button
              variant={selectedCategory === 'business-strategy' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('business-strategy')}
              className="text-sm"
            >
              Business Strategy
            </Button>
            <Button
              variant={selectedCategory === 'client-experience' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('client-experience')}
              className="text-sm"
            >
              Client Experience
            </Button>
            <Button
              variant={selectedCategory === 'sales' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('sales')}
              className="text-sm"
            >
              Sales
            </Button>
          </div>
          <div className="mb-8 flex flex-wrap gap-2">
            <Button
              variant={resourceType === 'all' ? 'default' : 'outline'}
              onClick={() => setResourceType('all')}
              size="sm"
              className="text-xs"
            >
              All Types
            </Button>
            <Button
              variant={resourceType === 'guide' ? 'default' : 'outline'}
              onClick={() => setResourceType('guide')}
              size="sm"
              className="text-xs"
            >
              Guides
            </Button>
            <Button
              variant={resourceType === 'template' ? 'default' : 'outline'}
              onClick={() => setResourceType('template')}
              size="sm"
              className="text-xs"
            >
              Templates
            </Button>
            <Button
              variant={resourceType === 'video' ? 'default' : 'outline'}
              onClick={() => setResourceType('video')}
              size="sm"
              className="text-xs"
            >
              Videos
            </Button>
            <Button
              variant={resourceType === 'webinar' ? 'default' : 'outline'}
              onClick={() => setResourceType('webinar')}
              size="sm"
              className="text-xs"
            >
              Webinars
            </Button>
            <Button
              variant={resourceType === 'tool' ? 'default' : 'outline'}
              onClick={() => setResourceType('tool')}
              size="sm"
              className="text-xs"
            >
              Tools
            </Button>
          </div>
          {/* Resource Cards */}
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredResources.map((resource) => (
                <div
                  key={resource.id}
                  className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md"
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={resource.image}
                      alt={resource.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {resource.premium && (
                      <div className="absolute right-2 top-2 rounded-full bg-indigo-600 px-2 py-1 text-xs text-white">
                        Premium
                      </div>
                    )}
                    {resource.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-full bg-black bg-opacity-40 p-3">
                          <Icons.PlayCircleIcon className="h-12 w-12 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {resource.type}
                      </Badge>
                      <span className="text-sm text-gray-500">{resource.date}</span>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{resource.title}</h3>
                    <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                      {resource.description}
                    </p>
                    <div className="mb-4 flex flex-wrap gap-1">
                      {resource.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="bg-gray-100 text-xs text-gray-800"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Link href={resource.viewUrl} className="flex-grow">
                        <Button
                          variant="default"
                          className="w-full"
                          disabled={resource.premium && resource.type !== 'guide'}
                        >
                          {resource.premium && resource.type !== 'guide'
                            ? 'Requires Premium'
                            : 'View Resource'}
                        </Button>
                      </Link>
                      {resource.downloadUrl && (
                        <Button variant="outline" className="px-3">
                          <Icons.BookmarkIcon className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-gray-50 py-12 text-center">
              <h3 className="mb-2 text-lg font-medium text-gray-900">No resources found</h3>
              <p className="mb-6 text-gray-500">Try changing your search terms or filters</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setResourceType('all');
>
                Clear all filters
              </Button>
            </div>
          )}
        </section>
        {/* Growth Accelerator Banner */}
        <section className="mb-16">
          <div className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-white">
            <div className="flex flex-col items-center justify-between md:flex-row">
              <div className="mb-6 md:mb-0 md:w-2/3">
                <h2 className="mb-4 text-3xl font-bold">Ready to accelerate your growth?</h2>
                <p className="mb-6 text-lg">
                  Join our Growth Accelerator Program and get personalized coaching, exclusive
                  resources, and access to all premium tools to take your business to the next
                  level.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button className="bg-white text-indigo-700 hover:bg-gray-100">Learn More</Button>
                  <Button variant="outline" className="border-white text-white hover:bg-white/10">
                    Schedule a Consultation
                  </Button>
                </div>
              </div>
              <div className="flex justify-center md:w-1/3">
                <div className="w-full max-w-xs rounded-lg bg-white/10 p-6 backdrop-blur-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <Icons.RocketLaunchSolid className="h-10 w-10 text-yellow-300" />
                    <div>
                      <h3 className="text-xl font-bold">Growth Accelerator</h3>
                      <p className="text-sm text-white/80">Premium Program</p>
                    </div>
                  </div>
                  <ul className="mb-6 space-y-2">
                    <li className="flex items-start">
                      <div className="mr-2 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                        <div className="h-2 w-2 rounded-full bg-white"></div>
                      </div>
                      <span>1:1 Business Coaching Sessions</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                        <div className="h-2 w-2 rounded-full bg-white"></div>
                      </div>
                      <span>All Premium Tools & Resources</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                        <div className="h-2 w-2 rounded-full bg-white"></div>
                      </div>
                      <span>Marketing Campaign Reviews</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                        <div className="h-2 w-2 rounded-full bg-white"></div>
                      </div>
                      <span>Private Community Access</span>
                    </li>
                  </ul>
                  <div className="text-center">
                    <span className="text-2xl font-bold">$249</span>
                    <span className="text-white/80">/month</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Success Stories */}
        <section className="mb-16">
          <h2 className="mb-8 text-2xl font-bold">Success Stories</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {successStories.map((story) => (
              <div
                key={story.id}
                className="rounded-lg border border-gray-100 bg-white p-6 shadow-md"
              >
                <div className="mb-4 flex items-center">
                  <div className="relative mr-3 h-12 w-12 overflow-hidden rounded-full">
                    <Image
                      src={story.image}
                      alt={story.ownerName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{story.businessName}</h3>
                    <p className="text-sm text-gray-600">{story.ownerName}</p>
                  </div>
                </div>
                <blockquote className="mb-4 italic text-gray-700">"{story.quote}"</blockquote>
                <div className="mb-4 rounded-lg bg-indigo-50 p-3">
                  <p className="text-sm font-medium text-indigo-800">
                    <span className="font-bold">Achievement:</span> {story.achievement}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {story.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="outline">Read More Success Stories</Button>
          </div>
        </section>
        {/* Upcoming Webinars */}
        <section className="mb-16">
          <h2 className="mb-8 text-2xl font-bold">Upcoming Webinars</h2>
          <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md">
            <div className="flex flex-col md:flex-row">
              <div className="relative md:w-1/3">
                <Image
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998"
                  alt="Webinar banner"
                  width={500}
                  height={300}
                  className="h-full w-full object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-transparent p-6">
                  <div className="text-white">
                    <p className="font-medium">Live Webinar</p>
                    <p className="text-sm">May 15, 2024 • 2:00 PM EST</p>
                  </div>
                </div>
              </div>
              <div className="p-6 md:w-2/3">
                <h3 className="mb-2 text-xl font-bold">
                  Instagram Reels and TikTok: Creating Viral Content for Beauty Businesses
                </h3>
                <p className="mb-4 text-gray-600">
                  Learn how to create engaging short-form video content that showcases your skills
                  and services. Our panel of social media experts will share strategies that have
                  helped beauty professionals gain thousands of followers and convert them into
                  paying clients.
                </p>
                <div className="mb-6 flex items-center">
                  <div className="mr-4 flex -space-x-2">
                    <div className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-white">
                      <Image
                        src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce"
                        alt="Speaker"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-white">
                      <Image
                        src="https://images.unsplash.com/photo-1580489944761-15a19d654956"
                        alt="Speaker"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">Jessica Chen, Maya Williams</span>
                </div>
                <div className="flex gap-3">
                  <Button>Register Now</Button>
                  <Button variant="outline">Add to Calendar</Button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/business-hub/webinars"
              className="font-medium text-indigo-600 hover:text-indigo-700"
            >
              View All Upcoming Webinars →
            </Link>
          </div>
        </section>
        {/* Newsletter Signup */}
        <section>
          <div className="rounded-lg bg-gray-50 p-8 text-center">
            <h2 className="mb-2 text-2xl font-bold">Stay Updated</h2>
            <p className="mx-auto mb-6 max-w-2xl text-gray-600">
              Subscribe to our newsletter to receive the latest marketing tips, business resources,
              and exclusive offers directly to your inbox.
            </p>
            <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
              <Input type="email" placeholder="Your email address" className="flex-grow" />
              <Button>Subscribe</Button>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              By subscribing, you agree to receive marketing emails. You can unsubscribe at any
              time.
            </p>
          </div>
        </section>
      </main>
    </Layout>
