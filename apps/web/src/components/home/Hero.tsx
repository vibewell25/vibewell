import React from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Hero() {
  return (
    <section className="hero-section container mx-auto py-12 text-center">
      <Card className="p-8">
        <h1 className="text-5xl font-bold mb-4">Welcome to VibeWell</h1>
        <p className="text-lg text-gray-600">
          Your wellness journey starts here. Book appointments, join events, and discover new experiences.
        </p>
      </Card>
    </section>
  );
} 