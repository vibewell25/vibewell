'use client';;
import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
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
    image:
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
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
    image:
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
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
    image:
      'https://images.unsplash.com/photo-1604902396830-aca29e19b067?auto=format&fit=crop&w=800&q=80',
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
      filtered = filtered.filter((service) => service.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.title.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query),
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

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {beautyCategories.map((category) => (
            <Card
              key={category.id}
              className={`hover:border-primary cursor-pointer border-2 transition-colors ${
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

        <div className="mb-8 flex items-center space-x-2">
          <Input
            type="search"
            placeholder="Search beauty services..."
            className="max-w-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 rounded-t-lg bg-muted"></div>
                <CardHeader>
                  <div className="h-5 w-3/4 rounded bg-muted"></div>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 h-4 rounded bg-muted"></div>
                  <div className="h-4 w-5/6 rounded bg-muted"></div>
                </CardContent>
                <CardFooter>
                  <div className="h-9 w-full rounded bg-muted"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {filteredServices.length === 0 ? (
              <div className="py-12 text-center">
                <h3 className="mb-2 text-xl font-medium">No services found</h3>
                <p className="mb-4 text-muted-foreground">
                  Try adjusting your search or category selection
                </p>
                <Button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredServices.map((service) => (
                  <Card key={service.id} className="overflow-hidden">
                    <div
                      className="h-48 bg-cover bg-center"
                      style={{ backgroundImage: `url(${service.image})` }}
                    />
                    <CardHeader className="pb-2">
                      {service.featured && (
                        <Badge className="mb-2 w-fit" variant="secondary">
                          Featured
                        </Badge>
                      )}
                      <CardTitle>{service.title}</CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="mr-4 flex items-center">
                          <span className="mr-1">⭐</span>
                          {service.rating}
                        </span>
                        <span>({service.reviews} reviews)</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4 text-muted-foreground">{service.description}</p>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-lg font-medium">${service.price}</span>
                        <span className="text-sm text-muted-foreground">
                          {service.duration} min
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {service.availability.map((day) => (
                          <Badge key={day} variant="outline">
                            {day}
                          </Badge>
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
