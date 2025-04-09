'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MegaphoneIcon, 
  ArrowDownTrayIcon, 
  SparklesIcon,
  StarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

// Define the interface for marketing resources
interface MarketingResource {
  id: string;
  title: string;
  description: string;
  category: 'social-media' | 'email' | 'local-marketing' | 'website' | 'content';
  image: string;
  downloadable: boolean;
  premium: boolean;
}

export default function MarketingResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Marketing resources data
  const marketingResources: MarketingResource[] = [
    {
      id: '1',
      title: 'Social Media Content Calendar for Beauty Businesses',
      description: 'A 30-day content plan with post ideas, caption templates, and hashtag recommendations for Instagram, Facebook, and TikTok.',
      category: 'social-media',
      image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7',
      downloadable: true,
      premium: false
    },
    {
      id: '2',
      title: 'Client Email Nurture Sequence',
      description: 'A 5-part email sequence to nurture new clients from their first visit to becoming regular customers.',
      category: 'email',
      image: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f',
      downloadable: true,
      premium: false
    },
    {
      id: '3',
      title: 'Local SEO Checklist for Wellness Businesses',
      description: 'Step-by-step guide to improve your local search ranking and attract more nearby customers.',
      category: 'local-marketing',
      image: 'https://images.unsplash.com/photo-1553484771-371a605b060b',
      downloadable: true,
      premium: false
    },
    {
      id: '4',
      title: 'Seasonal Promotion Planner',
      description: 'Strategic guide for planning and executing seasonal promotions that drive bookings during peak and slow periods.',
      category: 'content',
      image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88',
      downloadable: true,
      premium: true
    },
    {
      id: '5',
      title: 'Website Conversion Optimization Guide',
      description: 'Learn how to transform your website into a client-booking machine with these proven optimization techniques.',
      category: 'website',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
      downloadable: true,
      premium: true
    },
    {
      id: '6',
      title: 'Email Subject Line Swipe File',
      description: '100+ proven subject line templates to improve your email open rates and engagement.',
      category: 'email',
      image: 'https://images.unsplash.com/photo-1466096115517-bceecbfb6fde',
      downloadable: true,
      premium: false
    },
    {
      id: '7',
      title: 'Social Media Image Templates for Canva',
      description: 'Beautiful, pre-designed templates for creating professional social media graphics in minutes.',
      category: 'social-media',
      image: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb',
      downloadable: true,
      premium: true
    },
    {
      id: '8',
      title: 'Google Business Profile Optimization Guide',
      description: 'Maximize your visibility in local searches by optimizing your Google Business Profile with this comprehensive guide.',
      category: 'local-marketing',
      image: 'https://images.unsplash.com/photo-1581362072978-214c264ac9ba',
      downloadable: true,
      premium: false
    }
  ];

  // Filter resources based on category and search
  const filteredResources = marketingResources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl p-8 mb-12">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-4">Marketing Resources</h1>
          <p className="text-lg mb-6">
            Grow your beauty or wellness business with our practical marketing tools, templates, and guides. 
            From social media and email campaigns to local marketing strategies, find everything you need to attract and retain clients.
          </p>
          
          <div className="relative w-full max-w-lg mb-6">
            <Input 
              type="text" 
              placeholder="Search marketing resources..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <button className="absolute inset-y-0 right-0 px-3 flex items-center">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Browse by Category</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className={selectedCategory === 'all' ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            All Resources
          </Button>
          <Button
            variant={selectedCategory === 'social-media' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('social-media')}
            className={selectedCategory === 'social-media' ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            Social Media
          </Button>
          <Button
            variant={selectedCategory === 'email' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('email')}
            className={selectedCategory === 'email' ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            Email Marketing
          </Button>
          <Button
            variant={selectedCategory === 'local-marketing' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('local-marketing')}
            className={selectedCategory === 'local-marketing' ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            Local Marketing
          </Button>
          <Button
            variant={selectedCategory === 'website' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('website')}
            className={selectedCategory === 'website' ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            Website Optimization
          </Button>
          <Button
            variant={selectedCategory === 'content' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('content')}
            className={selectedCategory === 'content' ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            Content Strategy
          </Button>
        </div>
      </div>

      {/* Marketing Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredResources.map(resource => (
          <div key={resource.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
            <div className="relative h-48">
              <Image
                src={resource.image}
                alt={resource.title}
                fill
                className="object-cover"
              />
              {resource.premium && (
                <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                  Premium
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-xs font-medium capitalize">
                {resource.category.replace('-', ' ')}
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold mb-2">{resource.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
              <div className="flex justify-between items-center">
                {resource.downloadable ? (
                  <div className="flex items-center text-xs text-green-600">
                    <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                    <span>Downloadable</span>
                  </div>
                ) : (
                  <span></span>
                )}
                <Link href={`/business-hub/marketing/resources/${resource.id}`}>
                  <Button 
                    variant={resource.premium ? 'outline' : 'default'}
                    className={`${resource.premium ? 'border-purple-600 text-purple-600' : 'bg-purple-600 hover:bg-purple-700'}`}
                  >
                    {resource.premium ? 'Upgrade to Access' : 'View Resource'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Marketing Services Spotlight */}
      <div className="mb-12 bg-white rounded-xl shadow-md p-8 border border-gray-200">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-2/3 md:pr-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <SparklesIcon className="h-6 w-6 text-yellow-400 mr-2" />
              Marketing Services Spotlight
            </h2>
            <p className="text-gray-700 mb-6">
              Need help implementing your marketing strategy? Our network of vetted marketing professionals 
              specialize in beauty and wellness businesses and can help you get results fast.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Social Media Management</h3>
                <p className="text-sm text-gray-600 mb-3">Professional content creation and engagement strategies tailored for beauty businesses.</p>
                <Badge className="bg-green-100 text-green-800">From $399/month</Badge>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Email Marketing Setup</h3>
                <p className="text-sm text-gray-600 mb-3">Custom email sequences and templates to nurture leads and retain clients.</p>
                <Badge className="bg-green-100 text-green-800">From $299 one-time</Badge>
              </div>
            </div>
            
            <Button className="bg-purple-600 hover:bg-purple-700">
              Browse All Marketing Services
            </Button>
          </div>
          
          <div className="md:w-1/3 mt-6 md:mt-0">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Client Success Story</h3>
              <div className="flex items-center mb-3">
                <div className="mr-3">
                  <Image
                    src="https://images.unsplash.com/photo-1548142813-c348350df52b"
                    alt="Sophia's Salon"
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <p className="font-medium">Sophia's Salon</p>
                  <div className="flex text-yellow-400">
                    <StarIcon className="h-4 w-4" />
                    <StarIcon className="h-4 w-4" />
                    <StarIcon className="h-4 w-4" />
                    <StarIcon className="h-4 w-4" />
                    <StarIcon className="h-4 w-4" />
                  </div>
                </div>
              </div>
              <p className="text-sm italic mb-3">
                "Using the social media templates and email sequences, we increased our bookings by 32% in just two months!"
              </p>
              <Link href="/business-hub/marketing/case-studies/sophias-salon">
                <Button variant="outline" size="sm" className="w-full">
                  Read Full Case Study
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Marketing Quick Tips */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Marketing Quick Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-3">Maximize Social Media Engagement</h3>
            <p className="text-gray-600 mb-4">
              Post during peak times (typically 7-9am and 6-8pm) and use at least one image or video in every post to increase engagement by up to 150%.
            </p>
            <Link href="/business-hub/marketing/tips/social-media-engagement">
              <Button variant="outline" className="w-full">
                Learn More
              </Button>
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-3">Create Irresistible Promotions</h3>
            <p className="text-gray-600 mb-4">
              Add scarcity (limited time) and exclusivity (for select clients) to your promotions to create urgency and increase conversion rates.
            </p>
            <Link href="/business-hub/marketing/tips/effective-promotions">
              <Button variant="outline" className="w-full">
                Learn More
              </Button>
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-3">Leverage Client Testimonials</h3>
            <p className="text-gray-600 mb-4">
              Regularly collect and share client testimonials with before/after photos to build trust and showcase your expertise.
            </p>
            <Link href="/business-hub/marketing/tips/testimonial-strategies">
              <Button variant="outline" className="w-full">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Marketing Workshop CTA */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-2/3 p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Free Marketing Workshop</h2>
            <p className="mb-6">
              Join our free online workshop: "5 Marketing Strategies That Are Working Right Now for Beauty Businesses" 
              and learn practical tactics you can implement immediately.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-purple-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Live Q&A with a marketing expert</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-purple-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Downloadable strategy workbook</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-purple-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Actionable tactics, not theory</span>
              </li>
            </ul>
            <Button className="bg-white text-purple-700 hover:bg-purple-50">
              Reserve Your Spot
            </Button>
          </div>
          <div className="md:w-1/3 relative">
            <div className="h-64 md:h-full">
              <Image
                src="https://images.unsplash.com/photo-1551836022-d5d88e9218df"
                alt="Marketing Workshop"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 