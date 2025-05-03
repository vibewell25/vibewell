import Link from 'next/link';
import LoadingSpinner from '../src/components/common/LoadingSpinner';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-background">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-20 text-center md:py-32">
        <h1 className="mb-6 text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
          Welcome to <span className="text-primary-600">VibeWell</span>
        </h1>
        <p className="mb-8 max-w-2xl text-xl text-muted-foreground">
          Your all-in-one platform for beauty and wellness services. Book appointments, discover events, and connect with professionals.
        </p>
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <a href="/spa/services" className="rounded-md bg-primary-600 px-8 py-3 text-white shadow-lg transition-all hover:bg-primary-700">
            Explore Services
          </a>
          <a href="/spa/bookings" className="rounded-md border border-primary-600 bg-card px-8 py-3 text-primary-600 shadow-sm transition-all hover:bg-gray-50">
            My Bookings
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">Our Services</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard 
              title="Beauty Services" 
              description="Book appointments with top beauty professionals in your area. From hair styling to makeup."
              icon="✂️"
            />
            <FeatureCard 
              title="Wellness Events" 
              description="Join yoga classes, meditation sessions, and wellness workshops to improve your wellbeing."
              icon="🧘"
            />
            <FeatureCard 
              title="Virtual Consultations" 
              description="Get expert advice from anywhere with our virtual consultation services."
              icon="💻"
            />
            <FeatureCard 
              title="Product Shop" 
              description="Discover and purchase high-quality beauty and wellness products recommended by professionals."
              icon="🛍️"
            />
            <FeatureCard 
              title="Community" 
              description="Connect with like-minded individuals and share your beauty and wellness journey."
              icon="👥"
            />
            <FeatureCard 
              title="Loyalty Rewards" 
              description="Earn points with every booking and redeem them for discounts and special offers."
              icon="🎁"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-16 text-center text-white">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-3xl font-bold">Ready to get started?</h2>
          <p className="mb-8 mx-auto max-w-2xl text-lg">
            Join thousands of users who have transformed their beauty and wellness routine with VibeWell.
          </p>
          <a href="/spa/signup" className="rounded-md bg-white px-8 py-3 text-primary-600 shadow-lg transition-all hover:bg-gray-100">
            Sign Up Now
          </a>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:translate-y-[-5px]">
      <div className="mb-4 text-4xl">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
} 