import Link from 'next/link';
import { serviceCategories } from '@vibewell/services-types';

export default function ServicesPage() {
  return (
    <main className="services-page px-4 py-16">
      <h1 className="mb-8 text-center text-3xl font-bold">Balanced Experience</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mx-auto max-w-4xl">
        {serviceCategories.map(({ key, label }) => (
          <Link
            key={key}
            href={`/services/${key}`}
            className="block rounded-md bg-white p-6 shadow-md hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-center">{label}</h2>
          </Link>
        ))}
      </div>
    </main>
