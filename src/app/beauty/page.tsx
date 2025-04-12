'use client';

import React, { Suspense, useEffect, useState } from "react";
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from "@/components/page-header";
import Link from 'next/link';

// Define beauty content categories with enhanced metadata
const beautyCategories = [
  { id: 'all', name: 'All Services', description: 'Browse all our beauty services' },
  { id: 'hair', name: 'Hair', description: 'Cutting, styling, coloring, and more' },
  { id: 'skincare', name: 'Skincare', description: 'Facials, treatments, and consultations' },
  { id: 'makeup', name: 'Makeup', description: 'Special occasion, everyday, and lessons' },
  { id: 'nails', name: 'Nails', description: 'Manicures, pedicures, and nail art' },
  { id: 'massage', name: 'Massage', description: 'Relaxation, deep tissue, and therapeutic' },
];

// Beauty service mock data
const beautyServices = [
  {
    id: '1',
    title: 'Haircut & Styling',
    description: 'Professional haircut and styling service tailored to your preferences.',
    price: 65,
    duration: 60,
    category: 'hair',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    availability: ['Mon', 'Wed', 'Thu', 'Fri'],
    rating: 4.8,
    reviews: 124,
    featured: true,
  },
  {
    id: '2',
    title: 'Signature Facial',
    description: 'Revitalizing facial treatment customized for your skin type.',
    price: 85,
    duration: 75,
    category: 'skincare',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    availability: ['Tue', 'Wed', 'Sat', 'Sun'],
    rating: 4.9,
    reviews: 89,
    featured: true,
  },
  {
    id: '3',
    title: 'Gel Manicure',
    description: 'Long-lasting gel polish application with nail preparation.',
    price: 45,
    duration: 45,
    category: 'nails',
    image: 'https://images.unsplash.com/photo-1604902396830-aca29e19b067?auto=format&fit=crop&w=800&q=80',
    availability: ['Mon', 'Thu', 'Fri', 'Sat'],
    rating: 4.7,
    reviews: 156,
    featured: false,
  },
  // Add more services...
];

export default function BeautyPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filteredServices, setFilteredServices] = useState(beautyServices);

  // Simulate loading state
  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  // Filter content by category and search query
  useEffect(() => {
    let filtered = beautyServices;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service => 
        service.title.toLowerCase().includes(query) || 
        service.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredServices(filtered);
  }, [selectedCategory, searchQuery]);

  return (
    <Layout>
      <div className="container-app py-12">
        <PageHeader
          title="Beauty Services"
          description="Browse and book our premium beauty services"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {beautyCategories.map((category) => (
            <Card 
              key={category.id}
              className={`cursor-pointer border-2 hover:border-primary transition-colors ${
                selectedCategory === category.id ? 'border-primary' : 'border-border'
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle>{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{category.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center space-x-2 mb-8">
          <Input
            type="search"
            placeholder="Search beauty services..."
            className="max-w-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-5 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </CardContent>
                <CardFooter>
                  <div className="h-9 bg-muted rounded w-full"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No services found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search or category selection</p>
                <Button onClick={() => {setSelectedCategory('all'); setSearchQuery('');}}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <Card key={service.id} className="overflow-hidden">
                    <div 
                      className="h-48 bg-cover bg-center" 
                      style={{ backgroundImage: `url(${service.image})` }}
                    />
                    <CardHeader className="pb-2">
                      {service.featured && (
                        <Badge className="w-fit mb-2" variant="secondary">Featured</Badge>
                      )}
                      <CardTitle>{service.title}</CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="flex items-center mr-4">
                          <span className="mr-1">⭐</span> 
                          {service.rating}
                        </span>
                        <span>({service.reviews} reviews)</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{service.description}</p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-lg">${service.price}</span>
                        <span className="text-sm text-muted-foreground">{service.duration} min</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {service.availability.map((day) => (
                          <Badge key={day} variant="outline">{day}</Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/beauty/${service.id}` as any} className="w-full">
                        <Button className="w-full">Book Now</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
} 