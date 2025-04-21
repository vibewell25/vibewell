'use client';

import { Icons } from '@/components/icons';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getHighestRatedItems } from '@/lib/ratings';
import { StarRating } from '@/components/star-rating';

interface TopResourceItem {
  id: string;
  type: string;
  title: string;
  description: string;
  url: string;
  category: string;
  average: number;
  count: number;
}

interface TopRatedResourcesProps {
  limit?: number;
}

export function TopRatedResources({ limit = 5 }: TopRatedResourcesProps) {
  const [resources, setResources] = useState<TopResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  // Load top rated resources
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLoading(true);
      // Get highest rated items
      const highestRated = getHighestRatedItems(limit);
      // We need to fetch item details for these items
      // In a real app, this would be an API call
      // For now, we'll use mock data
      const items: TopResourceItem[] = highestRated.map(rating => ({
        id: rating.id,
        type: rating.type,
        title: getMockTitle(rating.id, rating.type),
        description: getMockDescription(rating.id, rating.type),
        url: rating.id.includes('/') ? rating.id : `/${rating.type}s/${rating.id}`,
        category: 'Financial',
        average: rating.average,
        count: rating.count,
      }));
      setResources(items);
      setLoading(false);
    }
  }, [limit]);
  // Mock data helpers - in a real app, these would be API calls
  const getMockTitle = (id: string, type: string): string => {
    return `Top Rated ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  };
  const getMockDescription = (id: string, type: string): string => {
    return `A highly rated ${type} with an ID of ${id}`;
  };
  // Render icon based on resource type
  const renderTypeIcon = (type: string) => {
    switch (type) {
      case 'resource':
        return <Icons.DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case 'tool':
        return <Icons.CalculatorIcon className="h-5 w-5 text-green-500" />;
      case 'article':
        return <Icons.NewspaperIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <Icons.DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };
  if (loading) {
    return (
      <div className="p-4 bg-white shadow-sm rounded-lg">
        <h3 className="text-lg font-medium mb-4">Top Rated Resources</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-start">
              <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (resources.length === 0) {
    return (
      <div className="p-4 bg-white shadow-sm rounded-lg">
        <h3 className="text-lg font-medium mb-4">Top Rated Resources</h3>
        <p className="text-gray-500 text-sm">
          No rated resources yet. Rate resources to see them appear here.
        </p>
      </div>
    );
  }
  return (
    <div className="p-4 bg-white shadow-sm rounded-lg">
      <h3 className="text-lg font-medium mb-4">Top Rated Resources</h3>
      <div className="space-y-4">
        {resources.map(resource => (
          <div key={`${resource.type}-${resource.id}`} className="flex items-start">
            <div className="mr-3 mt-1">{renderTypeIcon(resource.type)}</div>
            <div className="flex-1">
              <Link
                href={resource.url}
                className="text-base font-medium text-blue-600 hover:text-blue-800"
              >
                {resource.title}
              </Link>
              <div className="mt-1">
                <StarRating
                  initialRating={resource.average}
                  readonly={true}
                  size="sm"
                  showCount={true}
                  count={resource.count}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
