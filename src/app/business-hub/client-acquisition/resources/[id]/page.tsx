'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { ResourceDetailTemplate, BaseResource } from '@/components/resource-detail-template';
import { ClientAcquisitionNav } from '@/components/client-acquisition-nav';

// Client Acquisition resource data - in a real app, this would come from an API
const clientAcquisitionResources: BaseResource[] = [
  {
    id: '1',
    title: 'Client Retention Strategies for Wellness Businesses',
    author: 'David Johnson, Client Success Expert',
    date: '2023-09-15',
    readTime: '15 min',
    category: 'Retention',
    imageUrl: '/images/client-retention?.jpg',
    content: `
      <h2>The Value of Client Retention</h2>
      <p>It costs 5-25 times more to acquire a new client than to retain an existing one. This guide explores effective retention strategies specifically for wellness businesses.</p>
      
      <h2>Understanding Client Churn</h2>
      <p>Learn to identify early warning signs that a client might be considering leaving, and strategies to re-engage them before they go.</p>
      <ul>
        <li>Decreasing booking frequency</li>
        <li>Last-minute cancellations</li>
        <li>Reduced engagement with communications</li>
        <li>Browsing but not booking</li>
      </ul>
      
      <h2>Implementing Effective Loyalty Programs</h2>
      <p>Discover various loyalty program models that work well for wellness businesses, from simple punch cards to sophisticated tiered programs.</p>
      
      <h2>Creating Memorable Client Experiences</h2>
      <p>Going beyond the service itself to create remarkable experiences that clients want to return for again and again.</p>
      
      <h2>Retention Metrics to Track</h2>
      <p>Learn which metrics provide the most insight into your retention success, and how to calculate them properly.</p>
    `,
    relatedResources: ['2', '3'],
    type: 'resource',
    tags: ['retention', 'client management', 'loyalty programs'],
  },
  {
    id: '2',
    title: 'Referral Marketing for Health and Wellness Providers',
    author: 'Sophia Chen, Referral Marketing Strategist',
    date: '2023-10-20',
    readTime: '12 min',
    category: 'Referrals',
    imageUrl: '/images/referral-marketing?.jpg',
    content: `
      <h2>Leveraging Your Existing Client Base</h2>
      <p>Your current clients can be your best source of new business. This guide outlines how to create and implement an effective referral program.</p>
      
      <h2>Designing an Incentive Structure</h2>
      <p>Learn about different types of referral incentives and which ones tend to work best for wellness businesses:</p>
      <ul>
        <li>Service discounts</li>
        <li>Complimentary add-on services</li>
        <li>Product samples or gifts</li>
        <li>Loyalty points</li>
        <li>Two-way incentives (for both referrer and referee)</li>
      </ul>
      
      <h2>Timing Your Referral Requests</h2>
      <p>Discover the optimal moments in the client journey to request referrals for maximum effectiveness.</p>
      
      <h2>Creating Referral Materials</h2>
      <p>Templates and examples of effective referral cards, emails, and digital assets that make it easy for clients to refer others.</p>
      
      <h2>Measuring Referral Program Success</h2>
      <p>Metrics to track to ensure your referral program is delivering a strong return on investment.</p>
    `,
    relatedResources: ['1', '3'],
    type: 'resource',
    tags: ['referrals', 'marketing', 'client acquisition'],
    downloadUrl: '/downloads/referral-program-template?.pdf',
  },
  {
    id: '3',
    title: 'Converting First-Time Visitors into Regular Clients',
    author: 'Marcus Williams, Conversion Specialist',
    date: '2023-11-08',
    readTime: '18 min',
    category: 'Conversion',
    imageUrl: '/images/client-conversion?.jpg',
    content: `
      <h2>The First Visit Experience</h2>
      <p>The first visit sets the tone for your relationship with a new client. Learn how to create an exceptional first-time experience that encourages rebooking.</p>
      
      <h2>Onboarding Processes That Convert</h2>
      <p>Effective client onboarding goes beyond the initial paperwork. Discover a comprehensive approach to welcoming new clients that increases the likelihood of return visits.</p>
      
      <h2>Follow-Up Strategies</h2>
      <p>Timing and messaging for post-visit communications that significantly increase rebooking rates:</p>
      <ul>
        <li>Thank you messages</li>
        <li>Feedback requests</li>
        <li>Educational content</li>
        <li>Special offers for second visits</li>
        <li>Check-in communications</li>
      </ul>
      
      <h2>Introductory Packages That Work</h2>
      <p>Learn to structure introductory offers that encourage multiple visits and increase the chances of forming a regular client relationship.</p>
      
      <h2>Overcoming Common Objections</h2>
      <p>Address the typical concerns and objections that prevent first-time visitors from becoming regular clients.</p>
    `,
    relatedResources: ['1', '2'],
    type: 'resource',
    tags: ['conversion', 'client experience', 'onboarding'],
    premium: true,
  },
];

// Fetch resource by ID
const getResourceById = (id: string): BaseResource | undefined => {
  return clientAcquisitionResources?.find((resource) => resource?.id === id);
};

export default function ClientAcquisitionResourceDetailPage() {
  const params = useParams();
  const [resource, setResource] = useState<BaseResource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      // In a real app, this would be an API call
      const foundResource = getResourceById(params?.id as string);
      if (foundResource) {
        setResource(foundResource);
      }
      setLoading(false);
    }
  }, [params?.id]);

  if (!loading && !resource) {
    notFound();
  }

  // Showing loading or no resource state
  if (loading || !resource) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-green-500"></div>
          <p className="text-gray-600">Loading resource...</p>
        </div>
      </div>
    );
  }

  // Handle download
  const handleDownload = (resource: BaseResource) => {
    alert(`Downloading ${resource?.title}`);
    // In a real app, this would trigger the actual download
    window?.open(resource?.downloadUrl, '_blank');
  };

  return (
    <ResourceDetailTemplate
      resource={resource}
      resourceType={resource?.type}
      sectionName="Client Acquisition"
      sectionPath="/business-hub/client-acquisition"
      relatedResources={clientAcquisitionResources}
      navigationComponent={<ClientAcquisitionNav />}
      fetchRelatedResource={getResourceById}
      onDownload={handleDownload}
    />
  );
}
