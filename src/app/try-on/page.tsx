'use client';

import { useState } from 'react';
import { VirtualTryOn } from '@/components/ar/virtual-try-on';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const tryOnModels = {
  makeup: {
    title: 'Virtual Makeup Try-On',
    description: 'Try on different makeup looks in augmented reality',
    modelUrl: '/models/makeup.gltf',
  },
  hairstyle: {
    title: 'Virtual Hairstyle Try-On',
    description: 'See how different hairstyles look on you',
    modelUrl: '/models/hairstyle.gltf',
  },
  accessory: {
    title: 'Virtual Accessory Try-On',
    description: 'Try on various accessories in AR',
    modelUrl: '/models/accessory.gltf',
  },
};

export default function TryOnPage() {
  const [activeTab, setActiveTab] = useState<keyof typeof tryOnModels>('makeup');

  const handleTryOn = () => {
    // Handle try-on action
    console.log('Trying on:', activeTab);
  };

  const handleShare = () => {
    // Handle share action
    console.log('Sharing:', activeTab);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Virtual Try-On</h1>
        <p className="text-muted-foreground">
          Experience our products in augmented reality before making a purchase
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as keyof typeof tryOnModels)}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="makeup">Makeup</TabsTrigger>
          <TabsTrigger value="hairstyle">Hairstyle</TabsTrigger>
          <TabsTrigger value="accessory">Accessories</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>{tryOnModels[activeTab].title}</CardTitle>
                <CardDescription>{tryOnModels[activeTab].description}</CardDescription>
              </CardHeader>
              <CardContent>
                <VirtualTryOn
                  modelUrl={tryOnModels[activeTab].modelUrl}
                  type={activeTab}
                  onTryOn={handleTryOn}
                  onShare={handleShare}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Allow camera access when prompted</li>
                  <li>Position your face in the frame</li>
                  <li>Use the intensity slider to adjust the effect</li>
                  <li>Try different looks and share your favorites</li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tips for Best Results</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  <li>Ensure good lighting in your environment</li>
                  <li>Keep your face centered in the frame</li>
                  <li>Try different angles to see the full effect</li>
                  <li>Use the intensity slider to find your perfect look</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
} 