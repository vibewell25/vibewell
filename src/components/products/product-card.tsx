'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/services/product-service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // Format price with currency
  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === 0) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Get badge information based on product properties
  const getBadge = () => {
    if (product.trending) {
      return { label: 'Trending', variant: 'default' as const };
    }
    if (product.featured) {
      return { label: 'Featured', variant: 'secondary' as const };
    }
    if (product.availability === 'low_stock') {
      return { label: 'Low Stock', variant: 'warning' as const };
    }
    if (product.availability === 'out_of_stock') {
      return { label: 'Out of Stock', variant: 'destructive' as const };
    }
    if (product.availability === 'pre_order') {
      return { label: 'Pre-Order', variant: 'outline' as const };
    }
    return null;
  };

  const badge = getBadge();

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:shadow-md">
      {/* Product badges */}
      {badge && (
        <Badge className="absolute top-2 right-2 z-10" variant={badge.variant}>
          {badge.label}
        </Badge>
      )}
      
      {/* AR compatible badge */}
      {product.ar_compatible && (
        <Badge className="absolute top-2 left-2 z-10" variant="outline">
          AR Ready
        </Badge>
      )}
      
      {/* Product image */}
      <Link href={`/products/${product.id}`} className="relative aspect-square overflow-hidden">
        <Image
          src={product.image_url || '/images/product-placeholder.jpg'}
          alt={product.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </Link>
      
      {/* Product info */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2">
          <span className="text-xs font-medium text-muted-foreground">
            {product.brand} • {product.type}
          </span>
        </div>
        
        <Link href={`/products/${product.id}`} className="mb-2">
          <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-auto">
          {product.description}
        </p>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 mr-1 fill-yellow-400" />
            <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground ml-1">({product.review_count})</span>
          </div>
          
          <div className="font-semibold">
            {product.discount_price ? (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground line-through text-xs">
                  {formatPrice(product.price)}
                </span>
                <span className="text-primary">
                  {formatPrice(product.discount_price)}
                </span>
              </div>
            ) : (
              <span>{formatPrice(product.price)}</span>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/products/${product.id}`}>
              Details
            </Link>
          </Button>
          
          {product.ar_compatible && (
            <Button size="sm" className="flex-1" asChild>
              <Link href={`/try-on/${product.id}`}>
                Try On <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 