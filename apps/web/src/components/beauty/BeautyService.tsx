import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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
className?: string;
export function BeautyService({ service, className = '' }: BeautyServiceProps) {
  const router = useRouter();

  const handleBookService = () => {
    router.push(`/book/${service.id}`);
return (
    <Card className={`${className} transition-shadow hover:shadow-lg`}>
      {service.image && (
        <div className="relative h-48 w-full">
          <Image
            src={service.image}
            alt={service.name}
            fill
            className="rounded-t-lg object-cover"
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
                <Icons.Calendar className="mr-1 inline-block h-4 w-4" />
                Next available: {new Date(service.availability.nextAvailable).toLocaleDateString()}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            {service.availability.slots && (
              <p className="text-sm text-gray-500">{service.availability.slots} slots available</p>
            )}
            <Button onClick={handleBookService} className="w-full sm:w-auto">
              Book Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
