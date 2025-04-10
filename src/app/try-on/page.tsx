'use client';

import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import the AR component with no SSR to prevent hydration issues
const ARViewer = dynamic(() => import('@/components/ar/ar-viewer').then(mod => ({ default: mod.ARViewer })), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-[500px] bg-gray-100 flex flex-col items-center justify-center">
      <Skeleton className="w-full h-full rounded-md" />
      <p className="absolute text-center text-gray-500">Loading AR experience...</p>
    </div>
  )
});

const modelOptions = {
  makeup: [
    { id: 'natural', name: 'Natural Look', url: '/models/makeup/natural.glb' },
    { id: 'bold', name: 'Bold Makeup', url: '/models/makeup/bold.glb' },
    { id: 'evening', name: 'Evening Glamour', url: '/models/makeup/evening.glb' },
  ],
  hairstyle: [
    { id: 'short', name: 'Short Style', url: '/models/hairstyle/short.glb' },
    { id: 'medium', name: 'Medium Length', url: '/models/hairstyle/medium.glb' },
    { id: 'long', name: 'Long Waves', url: '/models/hairstyle/long.glb' },
  ],
  accessory: [
    { id: 'glasses', name: 'Glasses', url: '/models/accessory/glasses.glb' },
    { id: 'earrings', name: 'Earrings', url: '/models/accessory/earrings.glb' },
    { id: 'necklace', name: 'Necklace', url: '/models/accessory/necklace.glb' },
  ],
};

export default function TryOnPage() {
  const [selectedCategory, setSelectedCategory] = useState<'makeup' | 'hairstyle' | 'accessory'>('makeup');
  const [selectedModel, setSelectedModel] = useState<string>(modelOptions.makeup[0].url);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value as 'makeup' | 'hairstyle' | 'accessory');
    setSelectedModel(modelOptions[value as 'makeup' | 'hairstyle' | 'accessory'][0].url);
  };

  const handleModelSelect = (url: string) => {
    setSelectedModel(url);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Virtual Try-On</h1>
      
      <Tabs value={selectedCategory} onValueChange={handleCategoryChange} className="mb-8">
        <TabsList className="w-full max-w-md mx-auto">
          <TabsTrigger value="makeup">Makeup</TabsTrigger>
          <TabsTrigger value="hairstyle">Hairstyles</TabsTrigger>
          <TabsTrigger value="accessory">Accessories</TabsTrigger>
        </TabsList>
        
        <div className="mt-4">
          {['makeup', 'hairstyle', 'accessory'].map((category) => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="flex flex-wrap gap-2 mb-6">
                {modelOptions[category as 'makeup' | 'hairstyle' | 'accessory'].map((model) => (
                  <Button 
                    key={model.id}
                    variant={selectedModel === model.url ? "default" : "outline"}
                    onClick={() => handleModelSelect(model.url)}
                  >
                    {model.name}
                  </Button>
                ))}
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
      
      <div className="bg-white rounded-lg shadow-lg p-4">
        <Suspense fallback={
          <div className="relative w-full h-[500px] bg-gray-100 flex items-center justify-center">
            <p className="text-gray-500">Loading AR viewer...</p>
          </div>
        }>
          <ARViewer 
            modelUrl={selectedModel} 
            type={selectedCategory}
            onModelLoaded={() => console.log('Model loaded successfully')}
            onModelError={(error) => console.error('Model loading error:', error)}
          />
        </Suspense>
        
        <div className="mt-6 bg-gray-50 rounded p-4">
          <h2 className="text-xl font-semibold mb-2">How to use:</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Select a category (Makeup, Hairstyles, or Accessories)</li>
            <li>Choose a specific look you want to try</li>
            <li>Position your face in the camera view</li>
            <li>The virtual look will be applied to your face in real-time</li>
            <li>Use the capture button to take a photo</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 