import React, { Suspense, lazy } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Layout } from '@/components/layout';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

// Import critical components normally
import { FeaturedCategories } from '@/components/home/featured-categories';

// Lazy load non-critical components
const TestimonialCarousel = lazy(() => import('@/components/home/testimonial-carousel'));
const RecentBookings = lazy(() => import('@/components/home/recent-bookings'));
const TrendingServices = lazy(() => import('@/components/home/trending-services'));
const PopularProviders = lazy(() => import('@/components/home/popular-providers'));

// Fallback components
const SkeletonLoader = () => (
  <div className="animate-pulse rounded-lg bg-muted h-48 w-full"></div>
);

export default function Home() {
  return (
    <Layout>
      <div className="container-app py-12 md:py-24">
        {/* Hero Section */}
        <section className="relative h-[70vh] flex items-center">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero-background.jpg"
              alt="Vibewell wellness background"
              fill
              priority
              className="object-cover"
              quality={90}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
          </div>
          <div className="container relative z-10 mx-auto px-4 text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Find Your Wellness Balance</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl">
              Discover and book beauty, wellness, and health services in your area.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/beauty">Beauty Services</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10" asChild>
                <Link href="/wellness">Wellness Services</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Categories */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Featured Categories</h2>
            <FeaturedCategories />
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">What Our Customers Say</h2>
            <Suspense fallback={<SkeletonLoader />}>
              <TestimonialCarousel />
            </Suspense>
          </div>
        </section>

        {/* Recent Bookings */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Recent Bookings</h2>
            <Suspense fallback={<SkeletonLoader />}>
              <RecentBookings />
            </Suspense>
          </div>
        </section>

        {/* Trending Services */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Trending Services</h2>
            <Suspense fallback={<SkeletonLoader />}>
              <TrendingServices />
            </Suspense>
          </div>
        </section>

        {/* Popular Providers */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Popular Providers</h2>
            <Suspense fallback={<SkeletonLoader />}>
              <PopularProviders />
            </Suspense>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Key Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to enhance your wellness journey, all in one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="card flex flex-col">
                <div className="h-12 w-12 bg-primary/10 text-primary rounded-md flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground flex-grow">{feature.description}</p>
                <Link 
                  href={feature.link} 
                  className="inline-flex items-center text-primary mt-4 hover:underline"
                >
                  Learn more <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Call-to-Action Section */}
        <section className="py-12 md:py-20">
          <div className="bg-muted rounded-xl p-8 md:p-12">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Start Your Wellness Journey Today</h2>
              <p className="text-muted-foreground mb-8">
                Join thousands of users who have transformed their wellness experience through our platform.
              </p>
              <Link href="/auth/sign-up" className="btn-primary text-center">
                Create Free Account
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

// Feature icons using Heroicons
const features = [
  {
    title: 'Personalized Content',
    description: 'AI-driven recommendations and content tailored to your wellness goals and preferences.',
    icon: (props: React.ComponentProps<'svg'>) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    link: '/wellness',
  },
  {
    title: 'Expert Consultations',
    description: 'Connect with certified wellness professionals through live video sessions.',
    icon: (props: React.ComponentProps<'svg'>) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    link: '/consultations',
  },
  {
    title: 'Community & Social',
    description: 'Join a supportive community of like-minded individuals on their wellness journeys.',
    icon: (props: React.ComponentProps<'svg'>) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    link: '/social',
  },
];
