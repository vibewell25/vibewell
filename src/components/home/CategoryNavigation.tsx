import Link from 'next/link';
import { FaSpa, FaLeaf, FaDumbbell, FaAppleAlt, FaBrain } from 'react-icons/fa';

const categories = [
  { label: 'Beauty', icon: <FaSpa className="h-6 w-6" />, href: '/services?category=beauty' },
  { label: 'Wellness', icon: <FaLeaf className="h-6 w-6" />, href: '/services?category=wellness' },
  {
    label: 'Fitness',
    icon: <FaDumbbell className="h-6 w-6" />,
    href: '/services?category=fitness',
  },
  {
    label: 'Nutrition',
    icon: <FaAppleAlt className="h-6 w-6" />,
    href: '/services?category=nutrition',
  },
  {
    label: 'Mental Health',
    icon: <FaBrain className="h-6 w-6" />,
    href: '/services?category=mental-health',
  },
];

export default function CategoryNavigation() {
  return (
    <nav className="category-nav bg-gray-50 py-8">
      <ul className="mx-auto flex max-w-md justify-around">
        {categories.map((cat) => (
          <li key={cat.label}>
            <Link
              href={cat.href}
              className="hover:text-primary flex flex-col items-center text-gray-700"
            >
              {cat.icon}
              <span className="mt-1 text-sm">{cat.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
