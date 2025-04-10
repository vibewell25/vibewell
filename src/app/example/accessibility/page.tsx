'use client';

import React from 'react';
import { Layout } from '@/components/layout';
import { AccessibilityExample } from '@/components/ui/examples/accessibility-example';
import { LiveAnnouncer } from '@/components/ui/accessibility';

export default function AccessibilityExamplePage() {
  return (
    <Layout>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-6">Accessibility Components</h1>
        <p className="mb-8 text-muted-foreground">
          This page demonstrates all the accessibility components provided by the UI library.
          These components are designed to help make your application more accessible to users
          with disabilities, including those using screen readers, keyboard navigation, and other
          assistive technologies.
        </p>
        
        <AccessibilityExample />
        
        {/* Add LiveAnnouncer at page level for announcements */}
        <LiveAnnouncer politeness="assertive" />
      </div>
    </Layout>
  );
} 