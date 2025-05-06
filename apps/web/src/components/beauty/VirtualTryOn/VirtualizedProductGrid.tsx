import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Loader2, ShoppingCart, Star, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Skeleton from '@/components/ui/SkeletonLoader';

// Import this interface directly in this file since we don't have access to the beauty-state file
interface TryOnProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number | string;
  ratingAverage: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  colors: Array<{
    id: string;
    name: string;
    hex: string;
    arOverlayUrl?: string;
  }>;
  images: Array<{
    url: string;
    alt?: string;
  }>;
}

interface ProductGridProps {
  products: TryOnProduct[];
  isLoading: boolean;
  onSelectProduct: (product: TryOnProduct) => void;
  selectedProductId: string | null;
  gridClassName?: string;
}

/**
 * Product grid component with responsive design and loading states
 * 
 * Includes mobile-responsive design, loading states, and smooth transitions
 */
export default function ProductGrid({
  products,
  isLoading,
  onSelectProduct,
  selectedProductId,
  gridClassName = '',
}: ProductGridProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Track image loading state
  const handleImageLoad = (productId: string) => {
    setLoadingStates(prev => ({ ...prev, [productId]: true }));
  };

  // Display skeleton loader during initial loading
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-lg overflow-hidden border border-gray-200 animate-pulse">
            <div className="relative aspect-square bg-gray-200">
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
              </div>
            </div>
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex justify-between items-center mt-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // No products message
  if (products.length === 0) {
    return (
      <div className="p-8 text-center rounded-lg border border-gray-200 bg-gray-50">
        <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">No products found</p>
        <p className="text-sm text-gray-500 mb-4">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={cn(
        "h-96 w-full rounded-lg overflow-hidden overflow-y-auto", 
        gridClassName
      )}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
        {products.map((product) => {
          const isSelected = product.id === selectedProductId;
          const imageUrl = product.images[0]?.url || '/placeholder-product.jpg';
          const isImageLoaded = loadingStates[product.id];

          return (
            <div
              key={product.id}
              className={cn(
                "transition-all duration-300 ease-in-out",
                isSelected ? 'scale-[1.02] z-10' : 'hover:scale-[1.01]'
              )}
            >
              <div
                className={cn(
                  "cursor-pointer overflow-hidden rounded-lg border transition-all duration-300",
                  isSelected
                    ? 'border-pink-500 ring-2 ring-pink-300 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                )}
                onClick={() => onSelectProduct(product)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectProduct(product);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Select ${product.name}`}
                aria-selected={isSelected}
              >
                <div className="relative aspect-square bg-gray-50">
                  {/* Loading skeleton */}
                  {!isImageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
                      <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                    </div>
                  )}
                  
                  {/* Product image with fade-in effect */}
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 480px) 100vw, (max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className={cn(
                      "object-cover transition-opacity duration-300",
                      isImageLoaded ? "opacity-100" : "opacity-0"
                    )}
                    loading="lazy"
                    onLoad={() => handleImageLoad(product.id)}
                  />
                  
                  {/* Product badges */}
                  <div className="absolute top-2 left-2 right-2 flex justify-between">
                    {product.isNew && (
                      <div className="rounded-full bg-pink-500 px-2 py-1 text-xs text-white shadow-sm">
                        New
                      </div>
                    )}
                    {product.isBestSeller && (
                      <div className="rounded-full bg-yellow-500 px-2 py-1 text-xs text-white shadow-sm ml-auto">
                        Best Seller
                      </div>
                    )}
                  </div>
                  
                  {/* Try on button for selected product */}
                  {isSelected && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                      <div className="flex items-center justify-center rounded bg-white/90 text-pink-600 px-2 py-1 text-xs font-medium">
                        Try On Now <ArrowRight className="h-3 w-3 ml-1" />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Product info */}
                <div className="p-3">
                  <h3 className="line-clamp-1 text-sm font-medium">{product.name}</h3>
                  <p className="line-clamp-1 text-xs text-gray-500">{product.brand}</p>
                  
                  {/* Color options */}
                  {product.colors.length > 0 && (
                    <div className="mt-2 flex gap-1 overflow-hidden">
                      {product.colors.slice(0, 5).map((color) => (
                        <div
                          key={color.id}
                          className="h-3 w-3 rounded-full border border-gray-200"
                          style={{ backgroundColor: color.hex }}
                          aria-label={color.name}
                        />
                      ))}
                      {product.colors.length > 5 && (
                        <div className="text-xs text-gray-500">+{product.colors.length - 5}</div>
                      )}
                    </div>
                  )}
                  
                  {/* Price and rating */}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                    </span>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-500 mr-1 fill-current" />
                      <span className="text-xs text-gray-500">{product.ratingAverage.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
