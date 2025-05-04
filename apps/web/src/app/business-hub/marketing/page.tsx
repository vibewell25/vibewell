'use client';;
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Download, Sparkles, Star } from 'lucide-react';

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
      description:
        'A 30-day content plan with post ideas, caption templates, and hashtag recommendations for Instagram, Facebook, and TikTok.',
      category: 'social-media',
      image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7',
      downloadable: true,
      premium: false,
    },
    {
      id: '2',
      title: 'Client Email Nurture Sequence',
      description:
        'A 5-part email sequence to nurture new clients from their first visit to becoming regular customers.',
      category: 'email',
      image: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f',
      downloadable: true,
      premium: false,
    },
    {
      id: '3',
      title: 'Local SEO Checklist for Wellness Businesses',
      description:
        'Step-by-step guide to improve your local search ranking and attract more nearby customers.',
      category: 'local-marketing',
      image: 'https://images.unsplash.com/photo-1553484771-371a605b060b',
      downloadable: true,
      premium: false,
    },
    {
      id: '4',
      title: 'Seasonal Promotion Planner',
      description:
        'Strategic guide for planning and executing seasonal promotions that drive bookings during peak and slow periods.',
      category: 'content',
      image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88',
      downloadable: true,
      premium: true,
    },
    {
      id: '5',
      title: 'Website Conversion Optimization Guide',
      description:
        'Learn how to transform your website into a client-booking machine with these proven optimization techniques.',
      category: 'website',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
      downloadable: true,
      premium: true,
    },
    {
      id: '6',
      title: 'Email Subject Line Swipe File',
      description:
        '100+ proven subject line templates to improve your email open rates and engagement.',
      category: 'email',
      image: 'https://images.unsplash.com/photo-1466096115517-bceecbfb6fde',
      downloadable: true,
      premium: false,
    },
    {
      id: '7',
      title: 'Social Media Image Templates for Canva',
      description:
        'Beautiful, pre-designed templates for creating professional social media graphics in minutes.',
      category: 'social-media',
      image: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb',
      downloadable: true,
      premium: true,
    },
    {
      id: '8',
      title: 'Google Business Profile Optimization Guide',
      description:
        'Maximize your visibility in local searches by optimizing your Google Business Profile with this comprehensive guide.',
      category: 'local-marketing',
      image: 'https://images.unsplash.com/photo-1581362072978-214c264ac9ba',
      downloadable: true,
      premium: false,
    },
  ];
  // Filter resources based on category and search
  const filteredResources = marketingResources.filter((resource) => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12 rounded-xl bg-gradient-to-r from-pink-100 to-purple-100 p-8">
        <div className="max-w-3xl">
          <h1 className="mb-4 text-3xl font-bold">Marketing Resources</h1>
          <p className="mb-6 text-lg">
            Grow your beauty or wellness business with our practical marketing tools, templates, and
            guides. From social media and email campaigns to local marketing strategies, find
            everything you need to attract and retain clients.
          </p>
          <div className="relative mb-6 w-full max-w-lg">
            <Input
              type="text"
              placeholder="Search marketing resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <button className="absolute inset-y-0 right-0 flex items-center px-3">
              <Search className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
      {/* Category Filters */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Browse by Category</h2>
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
            className={
              selectedCategory === 'social-media' ? 'bg-purple-600 hover:bg-purple-700' : ''
            }
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
            className={
              selectedCategory === 'local-marketing' ? 'bg-purple-600 hover:bg-purple-700' : ''
            }
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
      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md"
          >
            <div className="relative h-48">
              <Image src={resource.image} alt={resource.title} fill className="object-cover" />
              {resource.premium && (
                <div className="absolute right-2 top-2 rounded-full bg-purple-600 px-2 py-1 text-xs text-white">
                  Premium
                </div>
              )}
              <div className="absolute bottom-2 left-2 rounded bg-white px-2 py-1 text-xs font-medium capitalize">
                {resource.category.replace('-', ' ')}
              </div>
            </div>
            <div className="p-5">
              <h3 className="mb-2 text-lg font-semibold">{resource.title}</h3>
              <p className="mb-4 text-sm text-gray-600">{resource.description}</p>
              <div className="flex items-center justify-between">
                {resource.downloadable ? (
                  <div className="flex items-center text-xs text-green-600">
                    <Download className="mr-1 h-4 w-4" />
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
      <div className="mb-12 rounded-xl border border-gray-200 bg-white p-8 shadow-md">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-2/3 md:pr-8">
            <h2 className="mb-4 flex items-center text-2xl font-bold">
              <Sparkles className="mr-2 h-6 w-6 text-yellow-400" />
              Marketing Services Spotlight
            </h2>
            <p className="mb-6 text-gray-700">
              Need help implementing your marketing strategy? Our network of vetted marketing
              professionals specialize in beauty and wellness businesses and can help you get
              results fast.
            </p>
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="mb-2 font-semibold">Social Media Management</h3>
                <p className="mb-3 text-sm text-gray-600">
                  Professional content creation and engagement strategies tailored for beauty
                  businesses.
                </p>
                <Badge className="bg-green-100 text-green-800">From $399/month</Badge>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="mb-2 font-semibold">Email Marketing Setup</h3>
                <p className="mb-3 text-sm text-gray-600">
                  Custom email sequences and templates to nurture leads and retain clients.
                </p>
                <Badge className="bg-green-100 text-green-800">From $299 one-time</Badge>
              </div>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Browse All Marketing Services
            </Button>
          </div>
          <div className="mt-6 md:mt-0 md:w-1/3">
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-3 font-semibold">Client Success Story</h3>
              <div className="mb-3 flex items-center">
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
                    <Star className="h-4 w-4" />
                    <Star className="h-4 w-4" />
                    <Star className="h-4 w-4" />
                    <Star className="h-4 w-4" />
                    <Star className="h-4 w-4" />
                  </div>
                </div>
              </div>
              <p className="mb-3 text-sm italic">
                "Using the social media templates and email sequences, we increased our bookings by
                32% in just two months!"
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
        <h2 className="mb-6 text-2xl font-bold">Marketing Quick Tips</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-md">
            <h3 className="mb-3 text-lg font-semibold">Maximize Social Media Engagement</h3>
            <p className="mb-4 text-gray-600">
              Post during peak times (typically 7-9am and 6-8pm) and use at least one image or video
              in every post to increase engagement by up to 150%.
            </p>
            <Link href="/business-hub/marketing/tips/social-media-engagement">
              <Button variant="outline" className="w-full">
                Learn More
              </Button>
            </Link>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-md">
            <h3 className="mb-3 text-lg font-semibold">Create Irresistible Promotions</h3>
            <p className="mb-4 text-gray-600">
              Add scarcity (limited time) and exclusivity (for select clients) to your promotions to
              create urgency and increase conversion rates.
            </p>
            <Link href="/business-hub/marketing/tips/effective-promotions">
              <Button variant="outline" className="w-full">
                Learn More
              </Button>
            </Link>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-md">
            <h3 className="mb-3 text-lg font-semibold">Leverage Client Testimonials</h3>
            <p className="mb-4 text-gray-600">
              Regularly collect and share client testimonials with before/after photos to build
              trust and showcase your expertise.
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
      <div className="overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="flex flex-col md:flex-row">
          <div className="p-8 text-white md:w-2/3">
            <h2 className="mb-4 text-2xl font-bold">Free Marketing Workshop</h2>
            <p className="mb-6">
              Join our free online workshop: "5 Marketing Strategies That Are Working Right Now for
              Beauty Businesses" and learn practical tactics you can implement immediately.
            </p>
            <ul className="mb-6 space-y-2">
              <li className="flex items-center">
                <svg
                  className="mr-2 h-5 w-5 text-purple-200"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Live Q&A with a marketing expert</span>
              </li>
              <li className="flex items-center">
                <svg
                  className="mr-2 h-5 w-5 text-purple-200"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Downloadable strategy workbook</span>
              </li>
              <li className="flex items-center">
                <svg
                  className="mr-2 h-5 w-5 text-purple-200"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Actionable tactics, not theory</span>
              </li>
            </ul>
            <Button className="bg-white text-purple-700 hover:bg-purple-50">
              Reserve Your Spot
            </Button>
          </div>
          <div className="relative md:w-1/3">
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
