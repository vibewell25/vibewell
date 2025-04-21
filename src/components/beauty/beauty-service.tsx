import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/icons';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface BeautyServiceProps {
  service: {
    id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
    category: string;
    image?: string;
    availability?: {
      nextAvailable: string;
      slots: number;
    };
  };
  className?: string;
}

export function BeautyService({ service, className = '' }: BeautyServiceProps) {
  const router = useRouter();

  const handleBookService = () => {
    router.push(`/book/${service.id}`);
  };

  return (
    <Card className={`${className} hover:shadow-lg transition-shadow`}>
      {service.image && (
        <div className="relative w-full h-48">
          <Image
            src={service.image}
            alt={service.name}
            fill
            className="object-cover rounded-t-lg"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">{service.name}</CardTitle>
            <p className="text-sm text-gray-500">{service.category}</p>
          </div>
          <Badge variant="secondary">{service.duration} min</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-600">{service.description}</p>

          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">${service.price}</div>
            {service.availability && (
              <div className="text-sm text-gray-500">
                <Icons.Calendar className="inline-block w-4 h-4 mr-1" />
                Next available: {new Date(service.availability.nextAvailable).toLocaleDateString()}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            {service.availability?.slots && (
              <p className="text-sm text-gray-500">{service.availability.slots} slots available</p>
            )}
            <Button onClick={handleBookService} className="w-full sm:w-auto">
              Book Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
