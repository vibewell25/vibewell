'use client';

import dynamic from 'next/dynamic';

const MainNavigation = dynamic(() => import('@/components/navigation/MainNavigation'), {
  ssr: false,
  loading: () => <nav className="fixed w-full z-50 h-16 bg-white border-b border-gray-200 shadow-sm"></nav>
});

export default function NavigationWrapper() {
  return <MainNavigation />;
} 