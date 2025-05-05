import Link from 'next/link';
import type { ReactNode } from 'react';
import { serviceCategories } from '@vibewell/services-types';

interface ServicesLayoutProps {
  children: ReactNode;
export default function ServicesLayout({ children }: ServicesLayoutProps) {
  return (
    <div className="services-layout px-4 py-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold">Balanced Experience</h1>
      </header>
      <nav className="mt-6 flex justify-center gap-4">
        {serviceCategories.map(({ key, label }) => (
          <Link
            key={key}
            href={`/services/${key}`}
            className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 transition"
          >
            {label}
          </Link>
        ))}
      </nav>
      <section className="mt-8">
        {children}
      </section>
    </div>
