import React from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';

export function BreadcrumbExample() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Breadcrumb Navigation Example</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-md font-semibold mb-2">Basic Breadcrumb</h3>
          <Breadcrumb>
            <BreadcrumbItem isFirstItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="/help">Help Center</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <span className="text-sm font-medium">Getting Started</span>
            </BreadcrumbItem>
          </Breadcrumb>
        </div>

        <div>
          <h3 className="text-md font-semibold mb-2">Account Settings Breadcrumb</h3>
          <Breadcrumb>
            <BreadcrumbItem isFirstItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="/account">Account</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="/account/settings">Settings</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <span className="text-sm font-medium">Security</span>
            </BreadcrumbItem>
          </Breadcrumb>
        </div>
      </div>
    </div>
  );
}
