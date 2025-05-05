import Link from 'next/link';
import { FaSpa, FaLeaf } from 'react-icons/fa';
import { serviceCategories, ServiceCategoryConfig } from '@vibewell/services-types';

// Map icon name from config to actual React Icon component
const iconMap: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  SparklesIcon: FaSpa,
  LeafIcon: FaLeaf,
// Use config-driven categories

export default function CategoryNavigation() {
  return (
    <nav className="category-nav bg-gray-50 py-8">
      <ul className="mx-auto flex max-w-md justify-around">
        {serviceCategories.map((cat: ServiceCategoryConfig) => {
          const Icon = iconMap[cat.icon] || FaSpa;
          return (
            <li key={cat.key}>
              <Link
                href={`/services/${cat.routeParam}`}
                className="hover:text-primary flex flex-col items-center text-gray-700"
              >
                <Icon className="h-6 w-6" />
                <span className="mt-1 text-sm">{cat.label}</span>
              </Link>
            </li>
)}
      </ul>
    </nav>
