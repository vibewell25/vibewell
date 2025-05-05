import { MeditationEnvironment } from '@/components/ar/MeditationEnvironment';

export default function MeditationPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Meditation Space</h1>
        <div className="overflow-hidden rounded-lg bg-white shadow-lg">
          <MeditationEnvironment
            theme="forest"
            soundscape="rain"
            lightingIntensity={1}
            particleEffects={true}
            onStateChange={(state) => {
              console.log('Environment state changed:', state);
/>
        </div>
      </div>
    </div>
