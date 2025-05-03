import FeaturedServices from '@/components/home/FeaturedServices';

export default function ServicesPage() {
  return (
    <main className="services-page px-4 py-16">
      <h1 className="mb-8 text-center text-3xl font-bold">Our Services</h1>
      <div className="mx-auto max-w-4xl">
        <FeaturedServices />
      </div>
    </main>
  );
}
