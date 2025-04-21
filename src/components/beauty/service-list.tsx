import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: string;
  category: string;
}

interface ServiceListProps {
  providerId: string;
}

export function ServiceList({ providerId }: ServiceListProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`/api/providers/${providerId}/services`);
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        const data = await response.json();
        setServices(data);
      } catch (error) {
        console.error('Error fetching services:', error);
        toast.error('Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [providerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        No services available
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {services.map(service => (
        <Card key={service.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-medium">{service.name}</h3>
                <p className="text-sm text-muted-foreground">{service.description}</p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{service.duration}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>{service.price}</span>
                  </div>
                </div>
              </div>
              <Button>Book Now</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
