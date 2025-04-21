'use client';

import { useState, Suspense } from 'react';
import {
  MeditationEnvironment,
  MeditationEnvironmentProps,
} from '@/components/ar/MeditationEnvironment';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Import the optimized loading spinner
const LoadingSpinner = dynamic(() => import('@/components/ui/LoadingSpinner'), {
  ssr: true,
});

// Dynamically import components with optimized loading strategies
const FeaturedEvents = dynamic(() => import('@/components/FeaturedEvents'), {
  loading: () => <EventsLoadingSkeleton />,
  ssr: true,
});

const WellnessCategories = dynamic(() => import('@/components/WellnessCategories'), {
  loading: () => <CategoriesLoadingSkeleton />,
  ssr: true,
});

const TestimonialCarousel = dynamic(() => import('@/components/TestimonialCarousel'), {
  loading: () => <TestimonialsLoadingSkeleton />,
  ssr: false, // Client-side only for interactive components
});

// Lazy load heavy components with preloading for critical ones
const Hero = dynamic(() => import('@/components/home/Hero'), {
  loading: () => <LoadingSpinner />,
  ssr: true,
});

const FeaturedServices = dynamic(() => import('@/components/home/FeaturedServices'), {
  loading: () => <LoadingSpinner />,
  ssr: true,
});

const Testimonials = dynamic(() => import('@/components/home/Testimonials'), {
  loading: () => <LoadingSpinner />,
  ssr: false, // Client-side only for interactive components
});

const BookingSection = dynamic(() => import('@/components/home/BookingSection'), {
  loading: () => <LoadingSpinner />,
  ssr: true,
});

// Placeholder loading components with proper aria labels
function EventsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8" role="status" aria-label="Loading events">
      {Array(3).fill(0).map((_, i) => (
        <Card key={i} className="p-4">
          <Skeleton className="h-40 w-full mb-4" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </Card>
      ))}
    </div>
  );
}

function CategoriesLoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" role="status" aria-label="Loading categories">
      {Array(4).fill(0).map((_, i) => (
        <Card key={i} className="p-4">
          <Skeleton className="h-20 w-20 rounded-full mx-auto mb-4" />
          <Skeleton className="h-4 w-24 mx-auto" />
        </Card>
      ))}
    </div>
  );
}

function TestimonialsLoadingSkeleton() {
  return (
    <div className="mb-8 p-6 bg-slate-50 rounded-lg" role="status" aria-label="Loading testimonials">
      <Skeleton className="h-4 w-1/4 mb-8 mx-auto" />
      <Skeleton className="h-20 w-3/4 mb-4 mx-auto" />
      <Skeleton className="h-4 w-24 mx-auto" />
    </div>
  );
}

type MeditationSettings = {
  theme: MeditationEnvironmentProps['theme'];
  soundscape: MeditationEnvironmentProps['soundscape'];
  lightingIntensity: number;
};

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>VibeWell - Your Wellness Journey Starts Here</title>
        <meta 
          name="description" 
          content="VibeWell connects you with wellness services, events, and community. Book appointments, join events, and find your wellness path." 
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
      </Head>

      <main className="min-h-screen">
        {/* Critical content loaded first */}
        <Suspense fallback={<LoadingSpinner />}>
          <Hero />
        </Suspense>
        
        {/* Non-critical content loaded after */}
        <Suspense fallback={<LoadingSpinner />}>
          <FeaturedServices />
        </Suspense>
        
        <Suspense fallback={<TestimonialsLoadingSkeleton />}>
          <Testimonials />
        </Suspense>
        
        <Suspense fallback={<EventsLoadingSkeleton />}>
          <FeaturedEvents />
        </Suspense>
        
        <Suspense fallback={<CategoriesLoadingSkeleton />}>
          <WellnessCategories />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <BookingSection />
        </Suspense>
      </main>
    </div>
  );
}
