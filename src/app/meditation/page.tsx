'use client';

import { MeditationEnvironment } from '@/components/ar/MeditationEnvironment';

export default function MeditationPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Meditation Space</h1>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <MeditationEnvironment
            theme="forest"
            soundscape="rain"
            lightingIntensity={1}
            particleEffects={true}
            onStateChange={(state) => {
              console.log('Environment state changed:', state);
            }}
          />
        </div>
      </div>
    </div>
  );
} 