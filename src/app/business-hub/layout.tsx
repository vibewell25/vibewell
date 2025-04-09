'use client';

import { ReactNode } from 'react';
import { Layout } from '@/components/layout';
import { BusinessHubSidebar } from '@/components/business-hub-sidebar';
import { BusinessHubMobileNav } from '@/components/business-hub-mobile-nav';

interface BusinessHubLayoutProps {
  children: ReactNode;
}

export default function BusinessHubLayout({ children }: BusinessHubLayoutProps) {
  return (
    <Layout>
      <div className="flex flex-col md:flex-row">
        <div className="hidden md:block h-[calc(100vh-4rem)] sticky top-16">
          <BusinessHubSidebar />
        </div>
        <div className="flex-1 min-w-0">
          <BusinessHubMobileNav />
          {children}
        </div>
      </div>
    </Layout>
  );
} 