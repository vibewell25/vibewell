'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { Icons } from '@/components/icons';
interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  location: string;
  services: string[];
}
const CATEGORIES = [
  'All Categories',
  'Spa & Massage',
  'Hair Salon',
  'Nail Salon',
  'Facial & Skin Care',
  'Wellness Center',
];
export default function BusinessDirectoryPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [minRating, setMinRating] = useState(0);
  useEffect(() => {
    const checkAuth = async () => {
      const session = await getServerSession(authOptions);
      if (!session) {
        router.push('/login');
      }
    };
    checkAuth();
    const fetchBusinesses = async () => {
      try {
        const response = await fetch('/api/business');
        if (!response.ok) {
          throw new Error('Failed to fetch businesses');
        }
        const data = await response.json();
        setBusinesses(data);
      } catch (error) {
        console.error('Error fetching businesses:', error);
        toast.error('Failed to load businesses');
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
  }, [router]);
  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch =
      business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All Categories' || business.category === selectedCategory;
    const matchesRating = business.rating >= minRating;
    return matchesSearch && matchesCategory && matchesRating;
  });
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-1/4 rounded bg-gray-200"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 rounded bg-gray-200"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <h1 className="text-3xl font-bold">Business Directory</h1>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Input
              placeholder="Search businesses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBusinesses.map((business) => (
            <Card key={business.id} className="overflow-hidden">
              <div className="relative aspect-video bg-gray-100">
                <img
                  src={business.imageUrl}
                  alt={business.name}
                  className="h-full w-full object-cover"
                />
                <Badge className="absolute right-2 top-2">{business.category}</Badge>
              </div>
              <CardHeader>
                <CardTitle>{business.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <Icons.MapPinIcon className="h-4 w-4" />
                  <span>{business.location}</span>
                </div>
                <div className="mb-4 flex items-center gap-2">
                  <Icons.StarIcon className="h-5 w-5 text-yellow-400" />
                  <span className="font-semibold">{business.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({business.reviewCount} reviews)</span>
                </div>
                <p className="mb-4 text-muted-foreground">{business.description}</p>
                <div className="mb-4 flex flex-wrap gap-2">
                  {business.services.map((service) => (
                    <Badge key={service} variant="secondary">
                      {service}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => router.push(`/business/${business.id}`)}>
                    View Details
                  </Button>
                  <Button onClick={() => router.push(`/business/${business.id}/book`)}>
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
