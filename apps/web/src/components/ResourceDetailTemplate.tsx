import { Icons } from '@/components/icons';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { PremiumContentLock } from '@/components/PremiumContentLock';
import Link from 'next/link';
import { Layout } from '@/components/layout';
import { BusinessHubNavigation } from '@/components/BusinessHubNavigation';
import {
  addBookmark,
  removeBookmark,
  isBookmarked as checkIsBookmarked,
  trackRecentView,
from '@/lib/bookmarks';
import { getUserRating, saveRating, getAverageRating } from '@/lib/ratings';
import { StarRating } from '@/components/StarRating';
import { ResourceReview } from '@/components/ResourceReview';
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
        views: (viewData[resourceId].views || 0) + 1,
localStorage.setItem('resource_view_log', JSON.stringify(viewData));
catch (e) {
      console.error('Failed to track resource view', e);
export function ResourceDetailTemplate({
  resource,
  resourceType,
  sectionName,
  sectionPath,
  relatedResources,
  navigationComponent,
  fetchRelatedResource,
  onDownload,
: ResourceDetailTemplateProps) {
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
// Check if bookmarked
      setIsBookmarked(checkIsBookmarked(resource.id, resourceType));
      // Get user rating if any
      const rating = getUserRating(resource.id, resourceType);
      setUserRating(rating);
      // Get average rating
      const avgRating = getAverageRating(resource.id, resourceType);
      setAverageRating(avgRating);
[resource, resourceType]);
  // Handle bookmarking
  const toggleBookmark = () => {
    if (isBookmarked) {
      removeBookmark(resource.id, resourceType);
      setIsBookmarked(false);
else {
      addBookmark({
        id: resource.id,
        type: resourceType,
        title: resource.title,
        description: `${resource.category} - ${resource.author}`,
        url: window.location.pathname,
        category: resource.category,
setIsBookmarked(true);
// Handle rating change
  const handleRatingChange = (rating: number) => {
    setUserRating(rating);
    // Save the rating
    saveRating(resource.id, resourceType, rating);
    // Update average rating
    const newAverage = getAverageRating(resource.id, resourceType);
    setAverageRating(newAverage);
// Handle download
  const handleDownload = () => {
    if (onDownload) {
      onDownload(resource);
else {
      // Default download behavior
      alert(`Downloading ${resource.title}`);
      // In a real app, this would trigger a download
if (!resource) {
    return null;
// Get related resources if available
  const related =
    resource.relatedResources && Array.isArray(resource.relatedResources)
      ? (resource.relatedResources
          .map((id) => {
            if (fetchRelatedResource) {
              return fetchRelatedResource(id);
else if (relatedResources) {
              return relatedResources.find((r) => r.id === id);
return undefined;
)
          .filter(Boolean) as BaseResource[])
      : [];
  // Render the resource detail page
  return (
    <Layout>
      <div className="flex min-h-screen flex-col bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <div className="mb-4 flex items-center text-sm text-gray-500">
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
              <Icons.ArrowLeftIcon className="mr-1 h-4 w-4" /> Back
            </button>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">{navigationComponent || <BusinessHubNavigation />}</div>
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="overflow-hidden rounded-lg bg-white shadow-md">
                {/* Resource Header */}
                <div className="relative">
                  {resource.imageUrl && (
                    <div className="relative h-64">
                      <Image
                        src={resource.imageUrl}
                        alt={resource.title}
                        className="object-cover"
                        fill
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                      {resource.premium && (
                        <div className="absolute right-4 top-4 rounded-full bg-yellow-500 px-3 py-1 text-sm font-medium text-white">
                          Premium
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          {resource.category}
                        </Badge>
                        <h1 className="mb-2 text-2xl font-bold md:text-3xl">{resource.title}</h1>
                        <div className="mb-4 flex items-center text-sm text-gray-600">
                          <Icons.UserIcon className="mr-1 h-4 w-4" />
                          <span className="mr-4">{resource.author}</span>
                          <Icons.CalendarIcon className="mr-1 h-4 w-4" />
                          <span className="mr-4">
                            {new Date(resource.date).toLocaleDateString()}
                          </span>
                          <Icons.ClockIcon className="mr-1 h-4 w-4" />
                          <span>{resource.readTime}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {resource.downloadUrl && (
                          <Button onClick={handleDownload} className="flex items-center">
                            <Icons.ArrowDownTrayIcon className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          className={`flex items-center ${isBookmarked ? 'text-yellow-500' : ''}`}
                          onClick={toggleBookmark}
                        >
                          <Icons.BookmarkIcon className="mr-2 h-4 w-4" />
                          {isBookmarked ? 'Saved' : 'Save'}
                        </Button>
                      </div>
                    </div>
                    <div className="mb-6 mt-2">
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
                      <div className="mb-6 flex flex-wrap gap-2">
                        {resource.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Resource Content */}
                <div className="border-t border-gray-100 p-6">
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
                <div className="border-t border-gray-100 p-6">
                  <ResourceReview resourceId={resource.id} resourceType={resourceType} />
                </div>
              </div>
              {/* Related Resources */}
              {related.length > 0 && (
                <div className="mt-8">
                  <h2 className="mb-4 text-xl font-semibold">Related Resources</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {related.map((relatedResource) => (
                      <Link
                        href={`${sectionPath}/resources/${relatedResource.id}`}
                        key={relatedResource.id}
                        className="flex flex-col rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-md"
                      >
                        <h3 className="mb-2 font-medium text-blue-600 hover:text-blue-800">
                          {relatedResource.title}
                        </h3>
                        <div className="mt-auto flex items-center text-sm text-gray-500">
                          <Icons.DocumentTextIcon className="mr-1 h-4 w-4" />
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
