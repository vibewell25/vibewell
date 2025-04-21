'use client';
import { useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Icons } from '@/components/icons';
// Sample data for services
const serviceCategories = [
  {
    id: 'hair',
    name: 'Hair Styling',
    image: 'https://placehold.co/200x200?text=Hair',
    provider: 'Sndhardong',
    href: '/bookings/hair',
  },
  {
    id: 'skincare',
    name: 'Skincare',
    image: 'https://placehold.co/200x200?text=Skin',
    provider: 'Cat Tral Ope',
    href: '/bookings/skincare',
  },
  {
    id: 'makeup',
    name: 'Makeup',
    image: 'https://placehold.co/200x200?text=Makeup',
    provider: 'Sondaice',
    href: '/bookings/makeup',
  },
];
export default function SearchServicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <MobileLayout>
      <div className="px-5 py-6">
        <h1 className="text-2xl font-bold mb-6">Search Services</h1>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icons.MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search"
            className="pl-10 h-12 rounded-lg"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Button variant="ghost" size="sm">
              Filters
            </Button>
          </div>
        </div>
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Hair Styling</h2>
          <div className="grid grid-cols-1 gap-4">
            <Link href={serviceCategories[0].href}>
              <Card className="overflow-hidden">
                <div className="aspect-[4/3] relative">
                  <Image
                    src={serviceCategories[0].image}
                    alt={serviceCategories[0].name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium">{serviceCategories[0].name}</h3>
                  <p className="text-sm text-gray-500">{serviceCategories[0].provider}</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Skincare</h2>
            <Button variant="ghost" size="sm" className="text-primary" asChild>
              <Link href="/bookings/skincare" className="flex items-center">
                <Icons.ChevronRightIcon className="w-5 h-5" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <Link href={serviceCategories[1].href}>
              <Card className="overflow-hidden">
                <div className="aspect-[4/3] relative">
                  <Image
                    src={serviceCategories[1].image}
                    alt={serviceCategories[1].name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium">{serviceCategories[1].name}</h3>
                  <p className="text-sm text-gray-500">{serviceCategories[1].provider}</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
