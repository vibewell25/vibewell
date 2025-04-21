'use client';

import { useState, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the AR viewer to reduce initial page load
const DynamicARViewer = dynamic(
  () => import('@/components/dynamic/DynamicARViewer').then(mod => mod.DynamicARViewer),
  {
    ssr: false,
    loading: () => (
      <div className="bg-gray-200 h-[300px] flex items-center justify-center rounded-md">
        <p className="text-gray-500">Loading AR Experience...</p>
      </div>
    ),
  }
);

// Mock data for demonstration
const mockModels = {
  makeup: [
    {
      id: 'lipstick-red',
      name: 'Natural Glow',
      thumbnail: '/thumbnails/makeup/natural-glow.jpg',
    },
    {
      id: 'foundation-medium',
      name: 'Evening Glam',
      thumbnail: '/thumbnails/makeup/evening-glam.jpg',
    },
  ],
  hairstyle: [
    {
      id: 'blush-pink',
      name: 'Long Waves',
      thumbnail: '/thumbnails/hairstyle/long-waves.jpg',
    },
    {
      id: 'eyeshadow-palette',
      name: 'Short Bob',
      thumbnail: '/thumbnails/hairstyle/short-bob.jpg',
    },
  ],
};

function VirtualTryOnContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'makeup' | 'hairstyle'>('makeup');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [isARActive, setIsARActive] = useState(false);

  const handleTryOn = (modelId: string) => {
    setSelectedModel(modelId);
    setIsARActive(true);
  };

  const handleCloseAR = () => {
    setIsARActive(false);
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

      {isARActive && selectedModel ? (
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <DynamicARViewer
              modelId={selectedModel}
              prioritizeBattery={true}
              enableProgressiveLoading={true}
              height="500px"
              onError={error => {
                console.error('AR Error:', error);
                setIsARActive(false);
              }}
            />
            <div className="mt-4 flex justify-between items-center">
              <h3 className="font-medium">
                {mockModels.makeup.find(m => m.id === selectedModel)?.name ||
                  mockModels.hairstyle.find(m => m.id === selectedModel)?.name}
              </h3>
              <Button variant="outline" onClick={handleCloseAR}>
                Close AR View
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search looks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <Tabs
            defaultValue="makeup"
            onValueChange={value => setSelectedType(value as 'makeup' | 'hairstyle')}
          >
            <TabsList className="mb-6">
              <TabsTrigger value="makeup">Makeup</TabsTrigger>
              <TabsTrigger value="hairstyle">Hairstyles</TabsTrigger>
            </TabsList>

            <TabsContent value="makeup">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockModels.makeup.map(model => (
                  <div key={model.id} className="bg-white rounded-lg shadow-md p-4">
                    <div className="bg-gray-200 h-[300px] flex items-center justify-center rounded-md">
                      <p className="text-gray-500">Virtual Try-On Placeholder</p>
                    </div>
                    <h3 className="mt-4 font-medium">{model.name}</h3>
                    <div className="mt-2">
                      <Button size="sm" onClick={() => handleTryOn(model.id)}>
                        Try On
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="hairstyle">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockModels.hairstyle.map(model => (
                  <div key={model.id} className="bg-white rounded-lg shadow-md p-4">
                    <div className="bg-gray-200 h-[300px] flex items-center justify-center rounded-md">
                      <p className="text-gray-500">Virtual Try-On Placeholder</p>
                    </div>
                    <h3 className="mt-4 font-medium">{model.name}</h3>
                    <div className="mt-2">
                      <Button size="sm" onClick={() => handleTryOn(model.id)}>
                        Try On
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

export default function VirtualTryOnPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">Loading virtual try-on experience...</div>
      }
    >
      <VirtualTryOnContent />
    </Suspense>
  );
}
