'use client';

import { useEngagement } from '@/hooks/use-engagement';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { SparklesIcon, MoveRight } from 'lucide-react';
import Link from 'next/link';

interface RecommendationsProps {
  maxItems?: number;
  showTitle?: boolean;
  className?: string;
}

export function Recommendations({
  maxItems = 3,
  showTitle = true,
  className = '',
}: RecommendationsProps) {
  const { recommendations, isLoading } = useEngagement();

  // Limit the number of recommendations to display
  const displayRecommendations = recommendations.slice(0, maxItems);

  if (isLoading) {
    return (
      <div className={className}>
        {showTitle && (
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-5 w-32" />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(maxItems)].map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (displayRecommendations.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {showTitle && (
        <div className="flex items-center gap-2 mb-4">
          <SparklesIcon className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Recommended for You</h3>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayRecommendations.map(product => (
          <Card key={product.id} className="overflow-hidden group">
            <div className="relative h-36">
              <Image
                src={product.image_url || '/images/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                <div className="text-white">
                  <h4 className="font-medium">{product.name}</h4>
                  <p className="text-xs opacity-90">{product.type}</p>
                </div>
              </div>
            </div>
            <CardContent className="p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(Math.floor(product.rating))].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xs">
                        ★
                      </span>
                    ))}
                    {product.rating % 1 > 0 && <span className="text-yellow-400 text-xs">☆</span>}
                  </div>
                  <span className="text-xs ml-1 text-muted-foreground">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
                <Link href={`/try-on/${product.id}`}>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    Try on <MoveRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {recommendations.length > maxItems && (
        <div className="flex justify-center mt-4">
          <Link href="/recommendations">
            <Button variant="outline" size="sm">
              View all recommendations
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
