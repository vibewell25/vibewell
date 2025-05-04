'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAnalyticsContext } from '@/providers/analytics-provider';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { StarIcon } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  trending?: boolean;
  featured?: boolean;
  category: string;
  subcategory: string;
  brand: string;
  availability: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface TrackedProductCardProps {
  product: Product;
  fromRecommendation?: boolean;
  recommendationPosition?: number;
  recommendationSource?: string;
}

export function TrackedProductCard({
  product,
  fromRecommendation = false,
  recommendationPosition = 0,
  recommendationSource = 'related',
}: TrackedProductCardProps) {
  const analytics = useAnalyticsContext();

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Handle product view tracking
  React.useEffect(() => {
    // Track product view when card is rendered
    analytics.trackProductView(product.id, product.name, {
      price: product.price,
      category: product.category,
      subcategory: product.subcategory,
      brand: product.brand,
      from_recommendation: fromRecommendation,
      recommendation_source: fromRecommendation ? recommendationSource : undefined,
    });

    // Track recommendation click if this product was shown as a recommendation
    if (fromRecommendation) {
      analytics.trackRecommendationClick(
        product.id,
        product.name,
        recommendationPosition,
        recommendationSource,
      );
    }
  }, [product, fromRecommendation, recommendationPosition, recommendationSource, analytics]);

  // Handle try-on button click
  const handleTryOnClick = () => {
    analytics.trackProductTryOn(product.id, product.name, 'start', {
      category: product.category,
      subcategory: product.subcategory,
      brand: product.brand,
      price: product.price,
    });
  };

  // Handle add to cart click
  const handleAddToCart = () => {
    analytics.trackCartAction('add', product.id, product.name, 1, product.price);
  };

  // Get appropriate badge for product
  const getBadge = () => {
    if (product.trending) {
      return <Badge className="absolute right-2 top-2 bg-orange-500">Trending</Badge>;
    }
    if (product.featured) {
      return <Badge className="absolute right-2 top-2 bg-purple-500">Featured</Badge>;
    }
    if (product.availability === 'low_stock') {
      return <Badge className="absolute right-2 top-2 bg-yellow-500">Low Stock</Badge>;
    }
    if (product.availability === 'out_of_stock') {
      return <Badge className="absolute right-2 top-2 bg-red-500">Out of Stock</Badge>;
    }
    return null;
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border transition-all hover:shadow-md">
      {/* Product badge */}
      {getBadge()}

      {/* Product image */}
      <Link href={`/products/${product.id}`} className="relative block h-48 overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </Link>

      {/* Product info */}
      <div className="p-4">
        <Link href={`/products/${product.id}`} className="hover:underline">
          <h3 className="truncate text-lg font-medium">{product.name}</h3>
        </Link>

        <div className="mt-1 flex items-center justify-between">
          <p className="text-lg font-bold">{formatPrice(product.price)}</p>

          <div className="flex items-center">
            <StarIcon className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">{product.rating.toFixed(1)}</span>
          </div>
        </div>

        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>

        <div className="mt-3 flex space-x-2">
          <Button variant="default" size="sm" className="flex-1" onClick={handleTryOnClick}>
            Try On
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleAddToCart}
            disabled={product.availability === 'out_of_stock'}
          >
            {product.availability === 'out_of_stock' ? 'Sold Out' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
}
