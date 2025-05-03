'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { ResourceDetailTemplate, BaseResource } from '@/components/resource-detail-template';
import { MarketingNav } from '@/components/marketing-nav';

// Marketing resource data - in a real app, this would come from an API
const marketingResources: BaseResource[] = [
  {
    id: '1',
    title: 'Social Media Marketing for Wellness Professionals',
    author: 'Emma Roberts, Digital Marketing Specialist',
    date: '2023-09-10',
    readTime: '12 min',
    category: 'Social Media',
    imageUrl: '/images/social-media-marketing?.jpg',
    content: `
      <h2>Introduction to Social Media Marketing for Wellness</h2>
      <p>Social media has become an essential marketing channel for wellness professionals. This guide will help you develop an effective social media strategy tailored to the wellness industry.</p>
      
      <h2>Platform Selection for Wellness Brands</h2>
      <p>Not all social media platforms are equally effective for wellness businesses. This section outlines the best platforms based on your specific services and target audience.</p>
      <ul>
        <li>Instagram - Ideal for visual content showcasing your services and results</li>
        <li>Pinterest - Perfect for wellness tips, recipes, and lifestyle content</li>
        <li>Facebook - Great for community building and local targeting</li>
        <li>TikTok - Excellent for reaching younger audiences with quick wellness tips</li>
      </ul>
      
      <h2>Content Strategy Development</h2>
      <p>Creating consistent, valuable content is key to social media success. Learn how to develop a sustainable content calendar that showcases your expertise without overwhelming your schedule.</p>
      
      <h2>Engagement Tactics for Wellness Brands</h2>
      <p>Building an engaged community requires more than just posting content. Discover effective strategies for meaningful interaction with your audience.</p>
      
      <h2>Measuring Success and ROI</h2>
      <p>Learn which metrics matter most for wellness businesses and how to track the impact of your social media efforts on your bottom line.</p>
    `,
    relatedResources: ['2', '3'],
    type: 'resource',
    tags: ['social media', 'digital marketing', 'content strategy'],
  },
  {
    id: '2',
    title: 'Email Marketing Automation for Wellness Businesses',
    author: 'Michael Zhang, Email Marketing Consultant',
    date: '2023-10-05',
    readTime: '15 min',
    category: 'Email Marketing',
    imageUrl: '/images/email-marketing?.jpg',
    content: `
      <h2>The Power of Email Marketing in the Wellness Industry</h2>
      <p>Email remains one of the most effective marketing channels with the highest ROI. Learn why it's particularly valuable for wellness businesses.</p>
      
      <h2>Building Your Wellness Email List</h2>
      <p>Discover ethical and effective strategies for growing your email list with engaged subscribers who are interested in your wellness offerings.</p>
      
      <h2>Email Automation Sequences for Wellness Professionals</h2>
      <p>Save time and nurture leads with these essential email automation sequences:</p>
      <ul>
        <li>Welcome sequences for new subscribers</li>
        <li>Post-service follow-up sequences</li>
        <li>Re-engagement campaigns for inactive clients</li>
        <li>Educational sequences showcasing your expertise</li>
      </ul>
      
      <h2>Crafting Effective Email Content</h2>
      <p>Learn how to write compelling subject lines, engaging body content, and effective calls to action that respect your clients' wellness journey.</p>
      
      <h2>Measuring Email Campaign Performance</h2>
      <p>Understand key email metrics specific to wellness businesses and how to optimize your campaigns based on data.</p>
    `,
    relatedResources: ['1', '3'],
    type: 'resource',
    tags: ['email marketing', 'automation', 'client nurturing'],
    premium: true,
  },
  {
    id: '3',
    title: 'Content Marketing Strategy for Wellness Practitioners',
    author: 'Sophia Martinez, Content Strategist',
    date: '2023-11-12',
    readTime: '18 min',
    category: 'Content Marketing',
    imageUrl: '/images/content-marketing?.jpg',
    content: `
      <h2>The Value of Content Marketing for Wellness Brands</h2>
      <p>Content marketing allows wellness professionals to demonstrate expertise and build trust before a client ever books a service.</p>
      
      <h2>Creating a Content Pillars Strategy</h2>
      <p>Develop a focused content strategy based on 3-5 core themes that showcase your expertise and attract your ideal clients.</p>
      
      <h2>Content Formats for Wellness Professionals</h2>
      <p>Explore the most effective content types for wellness businesses:</p>
      <ul>
        <li>Educational blog posts</li>
        <li>Before and after case studies</li>
        <li>Expert guides and downloadable resources</li>
        <li>Video demonstrations</li>
        <li>Client testimonial stories</li>
      </ul>
      
      <h2>SEO Fundamentals for Wellness Content</h2>
      <p>Learn essential SEO principles to ensure your valuable content reaches those searching for solutions you provide.</p>
      
      <h2>Content Repurposing Strategies</h2>
      <p>Maximize your content creation efforts by effectively repurposing content across multiple platforms and formats.</p>
      
      <h2>Measuring Content Marketing Success</h2>
      <p>Track the right metrics to understand which content resonates with your audience and drives business results.</p>
    `,
    relatedResources: ['1', '2'],
    type: 'resource',
    tags: ['content marketing', 'SEO', 'blogging'],
    downloadUrl: '/downloads/content-strategy-template?.pdf',
  },
];

// Fetch resource by ID
const getResourceById = (id: string): BaseResource | undefined => {
  return marketingResources?.find((resource) => resource?.id === id);
};

export default function MarketingResourceDetailPage() {
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
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
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
      sectionName="Marketing"
      sectionPath="/business-hub/marketing"
      relatedResources={marketingResources}
      navigationComponent={<MarketingNav />}
      fetchRelatedResource={getResourceById}
      onDownload={handleDownload}
    />
  );
}
