'use client';
import React, { Suspense, useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import Link from 'next/link';
import Image from 'next/image';
import { Icons } from '@/components/icons';
// Types
interface Business {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  description: string;
  location: string;
  image: string;
  rating: number;
  reviewCount: number;
  isPremium: boolean;
  tags: string[];
  services: { name: string; price: number }[];
  availableSlots: number;
}
function BusinessDirectoryContent() {
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [rating, setRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Load mock data
  useEffect(() => {
    // In a real app, this would be an API call
    setTimeout(() => {
      const mockBusinesses: Business[] = [
        {
          id: '1',
          name: 'Serenity Spa & Wellness',
          category: 'spa',
          subCategory: 'massage',
          description:
            'Luxury spa offering a range of massage and wellness treatments in a tranquil environment.',
          location: 'New York, NY',
          image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef',
          rating: 4.8,
          reviewCount: 127,
          isPremium: true,
          tags: ['Massage', 'Facial', 'Wellness'],
          services: [
            { name: 'Deep Tissue Massage', price: 120 },
            { name: 'Facial Treatment', price: 95 },
            { name: 'Hot Stone Therapy', price: 150 },
          ],
          availableSlots: 8,
        },
        {
          id: '2',
          name: 'Glow Beauty Studio',
          category: 'beauty',
          subCategory: 'salon',
          description:
            'Full-service beauty salon specializing in hair styling, makeup, and skincare treatments.',
          location: 'Los Angeles, CA',
          image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035',
          rating: 4.6,
          reviewCount: 89,
          isPremium: true,
          tags: ['Hair', 'Makeup', 'Skincare'],
          services: [
            { name: 'Haircut & Style', price: 85 },
            { name: 'Full Makeup', price: 120 },
            { name: 'Manicure & Pedicure', price: 65 },
          ],
          availableSlots: 5,
        },
        {
          id: '3',
          name: 'Mindful Meditation Center',
          category: 'wellness',
          subCategory: 'meditation',
          description:
            'Guided meditation sessions and mindfulness training for stress reduction and mental wellness.',
          location: 'San Francisco, CA',
          image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
          rating: 4.9,
          reviewCount: 64,
          isPremium: false,
          tags: ['Meditation', 'Mindfulness', 'Stress Relief'],
          services: [
            { name: 'Group Meditation', price: 25 },
            { name: 'Private Session', price: 90 },
            { name: 'Mindfulness Workshop', price: 45 },
          ],
          availableSlots: 12,
        },
        {
          id: '4',
          name: 'Fit Life Coaching',
          category: 'fitness',
          subCategory: 'personal-training',
          description:
            'Personalized fitness coaching and nutrition planning for achieving your health goals.',
          location: 'Chicago, IL',
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
          rating: 4.7,
          reviewCount: 52,
          isPremium: false,
          tags: ['Fitness', 'Nutrition', 'Personal Training'],
          services: [
            { name: 'Personal Training Session', price: 75 },
            { name: 'Nutrition Consultation', price: 120 },
            { name: 'Group Fitness Class', price: 30 },
          ],
          availableSlots: 7,
        },
        {
          id: '5',
          name: 'Healing Hands Therapy',
          category: 'wellness',
          subCategory: 'physical-therapy',
          description:
            'Physical therapy and rehabilitation services for injury recovery and pain management.',
          location: 'Boston, MA',
          image: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21',
          rating: 4.5,
          reviewCount: 38,
          isPremium: false,
          tags: ['Physical Therapy', 'Rehabilitation', 'Pain Management'],
          services: [
            { name: 'Initial Assessment', price: 150 },
            { name: 'Therapy Session', price: 100 },
            { name: 'Sports Rehabilitation', price: 130 },
          ],
          availableSlots: 4,
        },
        {
          id: '6',
          name: 'Zen Yoga Studio',
          category: 'fitness',
          subCategory: 'yoga',
          description: 'Yoga classes for all levels in a peaceful, zen-inspired environment.',
          location: 'Miami, FL',
          image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597',
          rating: 4.8,
          reviewCount: 75,
          isPremium: true,
          tags: ['Yoga', 'Meditation', 'Wellness'],
          services: [
            { name: 'Group Yoga Class', price: 20 },
            { name: 'Private Yoga Session', price: 85 },
            { name: 'Yoga Workshop', price: 45 },
          ],
          availableSlots: 10,
        },
      ];
      setBusinesses(mockBusinesses);
      setFilteredBusinesses(mockBusinesses);
      setIsLoading(false);
    }, 1000);
  }, []);
  // Apply filters
  useEffect(() => {
    if (businesses.length === 0) return;
    let filtered = [...businesses];
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        business =>
          business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    // Category filter
    if (category !== 'all') {
      filtered = filtered.filter(business => business.category === category);
    }
    // Location filter
    if (location !== 'all') {
      filtered = filtered.filter(business => business.location.includes(location));
    }
    // Price range filter
    filtered = filtered.filter(business => {
      const avgPrice =
        business.services.reduce((sum, service) => sum + service.price, 0) /
        business.services.length;
      return avgPrice >= priceRange[0] && avgPrice <= priceRange[1];
    });
    // Rating filter
    if (rating > 0) {
      filtered = filtered.filter(business => business.rating >= rating);
    }
    // Sort premium listings first
    filtered.sort((a, b) => {
      if (a.isPremium && !b.isPremium) return -1;
      if (!a.isPremium && b.isPremium) return 1;
      return 0;
    });
    setFilteredBusinesses(filtered);
  }, [businesses, searchTerm, category, location, priceRange, rating]);
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Business Directory</h1>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover top wellness and beauty service providers in your area. From spas and salons to
            fitness trainers and wellness coaches.
          </p>
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-4 md:p-6 max-w-4xl mx-auto mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <h3 className="font-semibold text-lg flex items-center text-indigo-800">
                <Icons.SparklesSolid className="h-5 w-5 mr-2 text-indigo-600" />
                List Your Business
              </h3>
              <div className="flex-grow">
                <p className="text-gray-700 text-sm md:text-base">
                  Boost your visibility with a premium listing. Get featured placement, enhanced
                  profile features, and more client leads.
                </p>
              </div>
              <Button className="bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap">
                Get Listed
              </Button>
            </div>
          </div>
          {/* Search and filter bar */}
          <div className="bg-white rounded-lg shadow p-4 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Icons.MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, service, or keyword..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchTerm(e.target.value)
                  }
                />
              </div>
              <Button
                variant="outline"
                className="flex items-center"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Icons.AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                Filters
              </Button>
              <Select value={category} onValueChange={(value: string) => setCategory(value)}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="spa">Spa</SelectItem>
                  <SelectItem value="beauty">Beauty</SelectItem>
                  <SelectItem value="wellness">Wellness</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Expanded filters */}
            {showFilters && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <Select value={location} onValueChange={(value: string) => setLocation(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="New York">New York</SelectItem>
                      <SelectItem value="Los Angeles">Los Angeles</SelectItem>
                      <SelectItem value="San Francisco">San Francisco</SelectItem>
                      <SelectItem value="Chicago">Chicago</SelectItem>
                      <SelectItem value="Boston">Boston</SelectItem>
                      <SelectItem value="Miami">Miami</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Range
                  </label>
                  <div className="px-2">
                    <Slider
                      defaultValue={[0, 200]}
                      max={200}
                      step={10}
                      value={priceRange}
                      onValueChange={setPriceRange}
                    />
                    <div className="flex justify-between mt-2 text-sm text-gray-500">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Rating
                  </label>
                  <Select
                    value={rating.toString()}
                    onValueChange={(value: string) => setRating(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any rating</SelectItem>
                      <SelectItem value="3">3+ stars</SelectItem>
                      <SelectItem value="4">4+ stars</SelectItem>
                      <SelectItem value="4.5">4.5+ stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Results section */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-16 bg-gray-200 rounded mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">{filteredBusinesses.length} businesses found</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBusinesses.map(business => (
                <div
                  key={business.id}
                  className={`bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg ${business.isPremium ? 'ring-2 ring-indigo-500 ring-opacity-50' : ''}`}
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={business.image}
                      alt={business.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {business.isPremium && (
                      <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <Icons.CheckBadgeSolid className="h-3 w-3 mr-1" />
                        Premium
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{business.name}</h3>
                      <div className="flex items-center">
                        <Icons.StarSolid className="h-4 w-4 text-yellow-400" />
                        <span className="ml-1 text-sm text-gray-700">{business.rating}</span>
                        <span className="text-xs text-gray-500 ml-1">({business.reviewCount})</span>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <Icons.MapPinSolid className="h-4 w-4 mr-1" />
                      {business.location}
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {business.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {business.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs bg-gray-100">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-sm text-gray-500 mb-4">
                      <span className="font-medium">Services from:</span> $
                      {Math.min(...business.services.map(s => s.price))}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-gray-600">
                        {business.availableSlots} slots available
                      </span>
                      <Link href={`/providers/${business.id}`}>
                        <Button>View Profile</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredBusinesses.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setCategory('all');
                    setLocation('all');
                    setPriceRange([0, 200]);
                    setRating(0);
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </>
        )}
        {/* Premium listing information */}
        <div className="mt-16 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-2/3">
                <h2 className="text-2xl font-bold mb-4">
                  Boost Your Business with a Premium Listing
                </h2>
                <p className="text-gray-700 mb-4">
                  Stand out from the competition and attract more clients with our premium business
                  listings.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <Icons.CheckBadgeSolid className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Priority placement at the top of search results</span>
                  </li>
                  <li className="flex items-start">
                    <Icons.CheckBadgeSolid className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Enhanced profile with photo gallery and featured services</span>
                  </li>
                  <li className="flex items-start">
                    <Icons.CheckBadgeSolid className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Verified badge to increase client trust</span>
                  </li>
                  <li className="flex items-start">
                    <Icons.CheckBadgeSolid className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Performance analytics and insights on profile views</span>
                  </li>
                </ul>
                <div className="flex gap-4">
                  <Button className="bg-indigo-600 hover:bg-indigo-700">Get Started</Button>
                  <Link href="/custom-pricing">
                    <Button variant="outline">Custom Plans</Button>
                  </Link>
                </div>
              </div>
              <div className="md:w-1/3 flex justify-center">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
                  <h3 className="text-xl font-bold mb-2 text-center">Premium Listing</h3>
                  <div className="text-center mb-4">
                    <span className="text-3xl font-bold">$19.99</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <ul className="text-sm space-y-2 mb-6">
                    <li className="flex items-center">
                      <Icons.CheckBadgeSolid className="h-4 w-4 text-green-500 mr-2" />
                      <span>Top placement in search results</span>
                    </li>
                    <li className="flex items-center">
                      <Icons.CheckBadgeSolid className="h-4 w-4 text-green-500 mr-2" />
                      <span>Premium badge</span>
                    </li>
                    <li className="flex items-center">
                      <Icons.CheckBadgeSolid className="h-4 w-4 text-green-500 mr-2" />
                      <span>Photo gallery (up to 10 photos)</span>
                    </li>
                    <li className="flex items-center">
                      <Icons.CheckBadgeSolid className="h-4 w-4 text-green-500 mr-2" />
                      <span>Business analytics dashboard</span>
                    </li>
                  </ul>
                  <Button className="w-full">Subscribe Now</Button>
                  <p className="text-xs text-center mt-4 text-gray-500">
                    <Link href="/custom-pricing" className="text-indigo-600 hover:underline">
                      Need more features? Create a custom plan
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
export default function BusinessDirectory() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BusinessDirectoryContent />
    </Suspense>
  );
}
