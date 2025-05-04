'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Star, ShoppingCart, Share2, ArrowLeft, HeartIcon, Clock } from 'lucide-react';
import { ProductService } from '@/services/product-service';
import { RecommendationService } from '@/services/recommendation-service';
import { ProductRecommendations } from '@/components/products/product-recommendations';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('details');
  const [inCart, setInCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const productId = Array.isArray(id) ? id[0] : id;
  const productService = new ProductService();
  const recommendationService = new RecommendationService();

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
      if (!productId) return;

      try {
        setLoading(true);
        const fetchedProduct = await productService.getProduct(productId);

        if (!fetchedProduct) {
          setError('Product not found');
          return;
        }

        setProduct(fetchedProduct);

        // Track product view for logged in users
        if (user.id) {
          try {
            await recommendationService.trackProductView(user.id, fetchedProduct.id);
          } catch (err) {
            console.error('Failed to track product view:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, user.id]);

  // Add to cart handler
  const handleAddToCart = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    if (!product) return;

    try {
      // Implement cart functionality here
      // await cartService.addItem(product.id, 1);
      setInCart(true);

      // Show a toast notification or feedback
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  // Toggle wishlist handler
  const handleToggleWishlist = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    if (!product || !user.id) return;

    try {
      // Implement wishlist functionality here
      // await wishlistService.toggleItem(user.id, product.id);
      setWishlisted(!wishlisted);

      // Show a toast notification or feedback
    } catch (err) {
      console.error('Error updating wishlist:', err);
    }
  };

  // Share product handler
  const handleShare = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    if (!product) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on VibeWell`,
          url: window.location.href,
        });
      } else {
        // Fallback - copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        // Show a toast notification
      }
    } catch (err) {
      console.error('Error sharing product:', err);
    }
  };

  // Format price with currency symbol
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <Skeleton className="aspect-square w-full rounded-lg" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="py-12 text-center">
          <h2 className="mb-2 text-2xl font-semibold">{error || 'Product not found'}</h2>
          <p className="mb-6 text-muted-foreground">
            Sorry, we couldn't find the product you're looking for.
          </p>
          <Link href="/products">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link href="/products">
          <Button variant="ghost" className="flex items-center gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Product Image */}
        <div className="relative">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <p className="text-muted-foreground">No image available</p>
              </div>
            )}
          </div>

          {/* Product badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {product.trending && (
              <Badge variant="secondary" className="bg-orange-600 text-white hover:bg-orange-700">
                Trending
              </Badge>
            )}
            {product.featured && (
              <Badge variant="secondary" className="bg-blue-600 text-white hover:bg-blue-700">
                Featured
              </Badge>
            )}
            {product.ar_compatible && (
              <Badge variant="secondary" className="bg-purple-600 text-white hover:bg-purple-700">
                AR Ready
              </Badge>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">{product.name}</h1>
            </div>
            <p className="mt-2 text-xl font-semibold">{formatPrice(product.price)}</p>

            {/* Rating */}
            <div className="mt-2 flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(product.rating)
                      ? 'fill-yellow-500 text-yellow-500'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                ({product.review_count} reviews)
              </span>
            </div>

            {/* Availability */}
            <div className="mt-2 flex items-center">
              <Badge
                variant={product.availability === 'in_stock' ? 'default' : 'secondary'}
                className={product.availability === 'in_stock' ? 'bg-green-600' : ''}
              >
                {product.availability === 'in_stock'
                  ? 'In Stock'
                  : product.availability === 'low_stock'
                    ? 'Limited Stock'
                    : 'Out of Stock'}
              </Badge>

              {product.availability === 'in_stock' && (
                <span className="ml-2 flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  Fast Delivery
                </span>
              )}
            </div>
          </div>

          {/* Quick details */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="text-sm">
              <span className="text-muted-foreground">Category:</span>{' '}
              <span className="font-medium">{product.category}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Subcategory:</span>{' '}
              <span className="font-medium">{product.subcategory}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Brand:</span>{' '}
              <span className="font-medium">{product.brand}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Type:</span>{' '}
              <span className="font-medium">{product.type}</span>
            </div>
          </div>

          {/* Product tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex items-center gap-3">
            <Button
              size="lg"
              className="flex-1"
              disabled={product.availability === 'out_of_stock' || inCart}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {inCart ? 'Added to Cart' : 'Add to Cart'}
            </Button>

            {product.ar_compatible && (
              <Button size="lg" variant="secondary" className="flex-1" asChild>
                <Link href={`/try-on/${product.id}`}>Try On</Link>
              </Button>
            )}

            <Button
              size="icon"
              variant="outline"
              onClick={handleToggleWishlist}
              className={wishlisted ? 'text-red-500' : ''}
            >
              <HeartIcon className={`h-5 w-5 ${wishlisted ? 'fill-current' : ''}`} />
            </Button>

            <Button size="icon" variant="outline" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="mt-6">
            <div className="prose max-w-none">
              <p>{product.description}</p>

              {/* Additional details could be added here */}
              <h3 className="mt-6 text-xl font-semibold">Features</h3>
              <ul>
                {product.meta && product.meta.features ? (
                  (product.meta.features as string[]).map((feature: string, index: number) => (
                    <li key={index}>{feature}</li>
                  ))
                ) : (
                  <>
                    <li>Premium quality</li>
                    <li>Durable materials</li>
                    <li>Modern design</li>
                    <li>Versatile usage</li>
                  </>
                )}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="specs" className="mt-6">
            <div className="rounded-lg bg-muted p-6">
              <h3 className="mb-4 text-xl font-semibold">Technical Specifications</h3>
              <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
                {/* Technical specs would come from product.specifications or similar */}
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Dimensions</span>
                  <span>10" x 8" x 2"</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Weight</span>
                  <span>1.2 lbs</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Materials</span>
                  <span>Aluminum, Plastic</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Warranty</span>
                  <span>1 Year</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Compatibility</span>
                  <span>iOS, Android</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Battery Life</span>
                  <span>10 hours</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-semibold">Customer Reviews</h3>
                <Button>Write a Review</Button>
              </div>

              {/* Reviews would be fetched and displayed here */}
              <div className="space-y-6">
                <div className="border-b pb-6">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-primary/10 mr-3 flex h-10 w-10 items-center justify-center rounded-full">
                        <span className="text-primary text-sm font-medium">JD</span>
                      </div>
                      <div>
                        <p className="font-medium">John Doe</p>
                        <p className="text-xs text-muted-foreground">March 15, 2024</p>
                      </div>
                    </div>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < 4 ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p>
                    This product exceeded my expectations. The quality is outstanding and it looks
                    great!
                  </p>
                </div>

                <div className="border-b pb-6">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-primary/10 mr-3 flex h-10 w-10 items-center justify-center rounded-full">
                        <span className="text-primary text-sm font-medium">JS</span>
                      </div>
                      <div>
                        <p className="font-medium">Jane Smith</p>
                        <p className="text-xs text-muted-foreground">February 28, 2024</p>
                      </div>
                    </div>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < 5 ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p>
                    Amazing product! Fast delivery and exactly as described. Would definitely
                    recommend.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Recommendations */}
      <div className="mt-16">
        <ProductRecommendations
          productId={product.id}
          title="You May Also Like"
          showTabs={true}
          showFeedbackTab={true}
        />
      </div>
    </div>
  );
}
