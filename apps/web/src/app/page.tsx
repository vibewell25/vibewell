import { Suspense } from 'react';
import { MeditationEnvironmentProps } from '@/components/ar/MeditationEnvironment';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/skeleton';

// Import the optimized loading spinner
const LoadingSpinner = dynamic(() => import('@/components/common/LoadingSpinner'), {
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
    <div
      className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3"
      role="status"
      aria-label="Loading events"
    >
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="mb-4 h-40 w-full" />
            <Skeleton className="mb-2 h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </Card>
        ))}
    </div>
  );
}

function CategoriesLoadingSkeleton() {
  return (
    <div
      className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4"
      role="status"
      aria-label="Loading categories"
    >
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="mx-auto mb-4 h-20 w-20 rounded-full" />
            <Skeleton className="mx-auto h-4 w-24" />
          </Card>
        ))}
    </div>
  );
}

function TestimonialsLoadingSkeleton() {
  return (
    <div
      className="mb-8 rounded-lg bg-slate-50 p-6"
      role="status"
      aria-label="Loading testimonials"
    >
      <Skeleton className="mx-auto mb-8 h-4 w-1/4" />
      <Skeleton className="mx-auto mb-4 h-20 w-3/4" />
      <Skeleton className="mx-auto h-4 w-24" />
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
    <main className="flex min-h-screen flex-col items-center p-6 md:p-24">
      <div className="container-app mx-auto">
        <section className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 text-primary">Welcome to VibeWell</h1>
          <p className="text-xl text-foreground">Your wellness journey starts here.</p>
        </section>
        
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card p-6 shadow-md transition-all hover:shadow-lg">
            <h3 className="font-bold text-xl mb-2">Meditation</h3>
            <p>Find your inner peace with guided meditations.</p>
            <Link href="/meditation" className="btn-primary mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Explore
            </Link>
          </div>
          
          <div className="card p-6 shadow-md transition-all hover:shadow-lg">
            <h3 className="font-bold text-xl mb-2">Beauty</h3>
            <p>Discover beauty treatments that make you glow.</p>
            <Link href="/beauty" className="btn-primary mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Explore
            </Link>
          </div>
          
          <div className="card p-6 shadow-md transition-all hover:shadow-lg">
            <h3 className="font-bold text-xl mb-2">Wellness</h3>
            <p>Holistic approaches to your well-being.</p>
            <Link href="/wellness" className="btn-primary mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Explore
            </Link>
          </div>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-secondary p-6 rounded-lg">
              <h3 className="font-bold mb-2">For Individuals</h3>
              <p>Personal wellness journeys tailored to your needs.</p>
            </div>
            <div className="bg-secondary p-6 rounded-lg">
              <h3 className="font-bold mb-2">For Businesses</h3>
              <p>Corporate wellness programs for your team.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
