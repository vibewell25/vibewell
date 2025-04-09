'use client';

import { useState } from 'react';
import { VirtualTryOn } from '@/components/ar/virtual-try-on';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react';

// Mock data for demonstration
const mockModels = {
  makeup: [
    {
      id: '1',
      name: 'Natural Glow',
      modelUrl: '/models/makeup/natural-glow.glb',
      thumbnail: '/thumbnails/makeup/natural-glow.jpg',
    },
    {
      id: '2',
      name: 'Evening Glam',
      modelUrl: '/models/makeup/evening-glam.glb',
      thumbnail: '/thumbnails/makeup/evening-glam.jpg',
    },
  ],
  hairstyle: [
    {
      id: '1',
      name: 'Long Waves',
      modelUrl: '/models/hairstyle/long-waves.glb',
      thumbnail: '/thumbnails/hairstyle/long-waves.jpg',
    },
    {
      id: '2',
      name: 'Short Bob',
      modelUrl: '/models/hairstyle/short-bob.glb',
      thumbnail: '/thumbnails/hairstyle/short-bob.jpg',
    },
  ],
};

export default function VirtualTryOnPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'makeup' | 'hairstyle'>('makeup');

  const handleTryOn = () => {
    // Implement AR mode activation
    console.log('Activating AR mode...');
  };

  const handleShare = () => {
    // Implement sharing functionality
    console.log('Sharing virtual try-on...');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Virtual Try-On</h1>
        <p className="text-gray-600">
          Experience beauty services virtually before booking. Try different makeup looks,
          hairstyles, and more using augmented reality.
        </p>
      </div>

      <div className="mb-8">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search looks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <Tabs defaultValue="makeup" onValueChange={(value) => setSelectedType(value as 'makeup' | 'hairstyle')}>
        <TabsList className="mb-6">
          <TabsTrigger value="makeup">Makeup</TabsTrigger>
          <TabsTrigger value="hairstyle">Hairstyles</TabsTrigger>
        </TabsList>

        <TabsContent value="makeup">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockModels.makeup.map((model) => (
              <div key={model.id} className="bg-white rounded-lg shadow-md p-4">
                <VirtualTryOn
                  modelUrl={model.modelUrl}
                  type="makeup"
                  onTryOn={handleTryOn}
                  onShare={handleShare}
                />
                <h3 className="mt-4 font-medium">{model.name}</h3>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="hairstyle">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockModels.hairstyle.map((model) => (
              <div key={model.id} className="bg-white rounded-lg shadow-md p-4">
                <VirtualTryOn
                  modelUrl={model.modelUrl}
                  type="hairstyle"
                  onTryOn={handleTryOn}
                  onShare={handleShare}
                />
                <h3 className="mt-4 font-medium">{model.name}</h3>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 