import { Suspense } from 'react';
import { MeditationEnvironmentProps } from '@/components/ar/MeditationEnvironment';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/skeleton';

// Import the optimized loading spinner
const LoadingSpinner = dynamic(() => import('@/components/common/LoadingSpinner'), {
  ssr: true,
// Dynamically import components with optimized loading strategies
const FeaturedEvents = dynamic(() => import('@/components/FeaturedEvents'), {
  loading: () => <EventsLoadingSkeleton />,
  ssr: true,
const WellnessCategories = dynamic(() => import('@/components/WellnessCategories'), {
  loading: () => <CategoriesLoadingSkeleton />,
  ssr: true,
// Lazy load heavy components with preloading for critical ones
const Hero = dynamic(() => import('@/components/home/Hero'), {
  loading: () => <LoadingSpinner />,
  ssr: true,
const FeaturedServices = dynamic(() => import('@/components/home/FeaturedServices'), {
  loading: () => <LoadingSpinner />,
  ssr: true,
const Testimonials = dynamic(() => import('@/components/home/Testimonials'), {
  loading: () => <LoadingSpinner />,
  ssr: false, // Client-side only for interactive components
const BookingSection = dynamic(() => import('@/components/home/BookingSection'), {
  loading: () => <LoadingSpinner />,
  ssr: true,
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
type MeditationSettings = {
  theme: MeditationEnvironmentProps['theme'];
  soundscape: MeditationEnvironmentProps['soundscape'];
  lightingIntensity: number;
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
