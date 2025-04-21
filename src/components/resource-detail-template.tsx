'use client';

import { Icons } from '@/components/icons';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { PremiumContentLock } from '@/components/premium-content-lock';
import Link from 'next/link';
import { Layout } from '@/components/layout';
import { BusinessHubNavigation } from '@/components/business-hub-navigation';
import {
  addBookmark,
  removeBookmark,
  isBookmarked as checkIsBookmarked,
  trackRecentView,
} from '@/lib/bookmarks';
import { getUserRating, saveRating, getAverageRating } from '@/lib/ratings';
import { StarRating } from '@/components/star-rating';
import { ResourceReview } from '@/components/resource-review';
// Define the resource interface that can be extended by specific resource types
export interface BaseResource {
  id: string;
  title: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  imageUrl: string;
  content: string;
  relatedResources?: string[];
  premium?: boolean;
  downloadUrl?: string;
  tags?: string[];
  type: 'resource' | 'tool' | 'article';
}
// Define props for the template component
interface ResourceDetailTemplateProps {
  resource: BaseResource;
  resourceType: 'resource' | 'tool' | 'article';
  sectionName: string;
  sectionPath: string;
  relatedResources?: BaseResource[];
  navigationComponent?: React.ReactNode;
  fetchRelatedResource?: (id: string) => BaseResource | undefined;
  onDownload?: (resource: BaseResource) => void;
}
// Analytics tracking function
const trackResourceView = (resourceId: string, resourceName: string) => {
  // In a real app, this would send analytics data to your backend
  if (typeof window !== 'undefined') {
    const now = new Date().toISOString();
    try {
      const viewData = JSON.parse(localStorage.getItem('resource_view_log') || '{}');
      viewData[resourceId] = {
        id: resourceId,
        name: resourceName,
        lastViewed: now,
        views: (viewData[resourceId]?.views || 0) + 1,
      };
      localStorage.setItem('resource_view_log', JSON.stringify(viewData));
    } catch (e) {
      console.error('Failed to track resource view', e);
    }
  }
};
export function ResourceDetailTemplate({
  resource,
  resourceType,
  sectionName,
  sectionPath,
  relatedResources,
  navigationComponent,
  fetchRelatedResource,
  onDownload,
}: ResourceDetailTemplateProps) {
  const router = useRouter();
  const [userRating, setUserRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState({ average: 0, count: 0 });
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isClient, setIsClient] = useState(false);
  // On mount, check if the resource is bookmarked and get ratings
  useEffect(() => {
    setIsClient(true);
    if (resource) {
      // Track view
      trackResourceView(resource.id, resource.title);
      // Add to recent views
      trackRecentView({
        id: resource.id,
        type: resourceType,
        title: resource.title,
        description: `${resource.category} - ${resource.author}`,
        category: resource.category,
        url: window.location.pathname,
      });
      // Check if bookmarked
      setIsBookmarked(checkIsBookmarked(resource.id, resourceType));
      // Get user rating if any
      const rating = getUserRating(resource.id, resourceType);
      setUserRating(rating);
      // Get average rating
      const avgRating = getAverageRating(resource.id, resourceType);
      setAverageRating(avgRating);
    }
  }, [resource, resourceType]);
  // Handle bookmarking
  const toggleBookmark = () => {
    if (isBookmarked) {
      removeBookmark(resource.id, resourceType);
      setIsBookmarked(false);
    } else {
      addBookmark({
        id: resource.id,
        type: resourceType,
        title: resource.title,
        description: `${resource.category} - ${resource.author}`,
        url: window.location.pathname,
        category: resource.category,
      });
      setIsBookmarked(true);
    }
  };
  // Handle rating change
  const handleRatingChange = (rating: number) => {
    setUserRating(rating);
    // Save the rating
    saveRating(resource.id, resourceType, rating);
    // Update average rating
    const newAverage = getAverageRating(resource.id, resourceType);
    setAverageRating(newAverage);
  };
  // Handle download
  const handleDownload = () => {
    if (onDownload) {
      onDownload(resource);
    } else {
      // Default download behavior
      alert(`Downloading ${resource.title}`);
      // In a real app, this would trigger a download
    }
  };
  if (!resource) {
    return null;
  }
  // Get related resources if available
  const related =
    resource.relatedResources && Array.isArray(resource.relatedResources)
      ? (resource.relatedResources
          .map(id => {
            if (fetchRelatedResource) {
              return fetchRelatedResource(id);
            } else if (relatedResources) {
              return relatedResources.find(r => r.id === id);
            }
            return undefined;
          })
          .filter(Boolean) as BaseResource[])
      : [];
  // Render the resource detail page
  return (
    <Layout>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <Link href="/business-hub" className="hover:text-blue-600">
                Business Hub
              </Link>
              <span className="mx-2">/</span>
              <Link href={sectionPath} className="hover:text-blue-600">
                {sectionName}
              </Link>
              <span className="mx-2">/</span>
              <Link href={`${sectionPath}/resources`} className="hover:text-blue-600">
                Resources
              </Link>
              <span className="mx-2">/</span>
              <span className="text-gray-700">{resource.title}</span>
            </div>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600"
            >
              <Icons.ArrowLeftIcon className="h-4 w-4 mr-1" /> Back
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">{navigationComponent || <BusinessHubNavigation />}</div>
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Resource Header */}
                <div className="relative">
                  {resource.imageUrl && (
                    <div className="h-64 relative">
                      <Image
                        src={resource.imageUrl}
                        alt={resource.title}
                        className="object-cover"
                        fill
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                      {resource.premium && (
                        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Premium
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          {resource.category}
                        </Badge>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">{resource.title}</h1>
                        <div className="flex items-center text-sm text-gray-600 mb-4">
                          <Icons.UserIcon className="h-4 w-4 mr-1" />
                          <span className="mr-4">{resource.author}</span>
                          <Icons.CalendarIcon className="h-4 w-4 mr-1" />
                          <span className="mr-4">
                            {new Date(resource.date).toLocaleDateString()}
                          </span>
                          <Icons.ClockIcon className="h-4 w-4 mr-1" />
                          <span>{resource.readTime}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {resource.downloadUrl && (
                          <Button onClick={handleDownload} className="flex items-center">
                            <Icons.ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          className={`flex items-center ${isBookmarked ? 'text-yellow-500' : ''}`}
                          onClick={toggleBookmark}
                        >
                          <Icons.BookmarkIcon className="h-4 w-4 mr-2" />
                          {isBookmarked ? 'Saved' : 'Save'}
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 mb-6">
                      <div className="flex items-center">
                        <div className="mr-2">
                          {isClient && (
                            <StarRating
                              initialRating={userRating || 0}
                              onChange={handleRatingChange}
                              size="md"
                            />
                          )}
                        </div>
                        <span className="text-sm text-gray-600">
                          {averageRating.average.toFixed(1)} ({averageRating.count}{' '}
                          {averageRating.count === 1 ? 'rating' : 'ratings'})
                        </span>
                      </div>
                    </div>
                    {/* Resource Tags */}
                    {resource.tags && resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {resource.tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Resource Content */}
                <div className="p-6 border-t border-gray-100">
                  {resource.premium ? (
                    <PremiumContentLock>
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: resource.content }}
                      />
                    </PremiumContentLock>
                  ) : (
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: resource.content }}
                    />
                  )}
                </div>
                {/* Reviews Section */}
                <div className="p-6 border-t border-gray-100">
                  <ResourceReview resourceId={resource.id} resourceType={resourceType} />
                </div>
              </div>
              {/* Related Resources */}
              {related.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">Related Resources</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {related.map(relatedResource => (
                      <Link
                        href={`${sectionPath}/resources/${relatedResource.id}`}
                        key={relatedResource.id}
                        className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 flex flex-col"
                      >
                        <h3 className="font-medium mb-2 text-blue-600 hover:text-blue-800">
                          {relatedResource.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-auto">
                          <Icons.DocumentTextIcon className="h-4 w-4 mr-1" />
                          <span>{relatedResource.category}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
