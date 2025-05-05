import { serviceCategories, ServiceCategoryKey } from '@vibewell/services-types';
import { notFound } from 'next/navigation';
import ServiceList from '@/components/services/ServiceList';

interface PageProps {
  params: { category: ServiceCategoryKey };
export default async function ServicesCategoryPage({ params: { category } }: PageProps) {
  const catConfig = serviceCategories.find((c: { key: ServiceCategoryKey }) => c.key === category);
  if (!catConfig) return notFound();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v2/services?category=${category}`,
    { cache: 'no-store' }
if (!res.ok) throw new Error('Failed to fetch services');

  const services: any[] = await res.json();

  return (
    <main className="services-page px-4 py-16">
      <h1 className="mb-8 text-center text-3xl font-bold">
        {catConfig.label} Services
      </h1>
      <div className="mx-auto max-w-4xl">
        <ServiceList services={services} />
      </div>
    </main>
