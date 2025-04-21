import React from 'react';
import { Icons } from '@/components/icons';
('use client');
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

interface BusinessListProps {
  businesses: Business[];
}

export function BusinessList({ businesses }: BusinessListProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      {businesses.map(business => (
        <Card key={business.id} className="overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 relative h-48 md:h-auto">
              <Image
                src={business.imageUrl}
                alt={business.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
                priority={businesses.indexOf(business) < 2} // Prioritize loading first two businesses
              />
            </div>
            <CardContent className="flex-1 p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-semibold mb-1">{business.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      <Icons.StarIcon className="h-4 w-4 text-yellow-500" />
                      <span className="ml-1 text-sm font-medium">{business.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({business.reviewCount} reviews)
                    </span>
                  </div>
                </div>
                <Badge variant="outline">{business.category}</Badge>
              </div>
              <p className="text-muted-foreground mb-4">{business.description}</p>
              <div className="flex items-center gap-2 mb-4">
                <Icons.MapPinIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{business.location}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {business.services.slice(0, 3).map(service => (
                  <Badge key={service} variant="secondary">
                    {service}
                  </Badge>
                ))}
                {business.services.length > 3 && (
                  <Badge variant="secondary">+{business.services.length - 3} more</Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => router.push(`/business/${business.id}`)}>
                  View Details
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/business/${business.id}/book`)}
                >
                  Book Now
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
}
