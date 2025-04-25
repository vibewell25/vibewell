import React from 'react';
import Link from 'next/link';
import { FaSpa, FaLeaf, FaDumbbell, FaAppleAlt, FaBrain } from 'react-icons/fa';

const categories = [
  { label: 'Beauty', icon: <FaSpa className="w-6 h-6" />, href: '/services?category=beauty' },
  { label: 'Wellness', icon: <FaLeaf className="w-6 h-6" />, href: '/services?category=wellness' },
  { label: 'Fitness', icon: <FaDumbbell className="w-6 h-6" />, href: '/services?category=fitness' },
  { label: 'Nutrition', icon: <FaAppleAlt className="w-6 h-6" />, href: '/services?category=nutrition' },
  { label: 'Mental Health', icon: <FaBrain className="w-6 h-6" />, href: '/services?category=mental-health' },
];

export default function CategoryNavigation() {
  return (
    <nav className="category-nav py-8 bg-gray-50">
      <ul className="flex justify-around max-w-md mx-auto">
        {categories.map(cat => (
          <li key={cat.label}>
            <Link href={cat.href} className="flex flex-col items-center text-gray-700 hover:text-primary">
              {cat.icon}
              <span className="mt-1 text-sm">{cat.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
