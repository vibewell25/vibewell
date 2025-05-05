import { ReactNode } from 'react';
import { Layout } from '@/components/layout';
import { BusinessHubSidebar } from '@/components/business-hub-sidebar';
import { BusinessHubMobileNav } from '@/components/business-hub-mobile-nav';

interface BusinessHubLayoutProps {
  children: ReactNode;
export default function BusinessHubLayout({ children }: BusinessHubLayoutProps) {
  return (
    <Layout>
      <div className="flex flex-col md:flex-row">
        <div className="sticky top-16 hidden h-[calc(100vh-4rem)] md:block">
          <BusinessHubSidebar />
        </div>
        <div className="min-w-0 flex-1">
          <BusinessHubMobileNav />
          {children}
        </div>
      </div>
    </Layout>
