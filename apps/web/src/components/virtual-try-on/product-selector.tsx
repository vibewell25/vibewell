'use client';;
import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { CardFallback } from '@/components/ui/fallback';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Star } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  productType: 'glasses' | 'jewelry' | 'makeup' | 'clothing';
  imageUrl: string;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isTrending?: boolean;
  price: number;
}

interface ProductSelectorProps {
  onSelectProduct: (product: Product) => void;
  defaultCategory?: string;
  className?: string;
}

export function ProductSelector({
  onSelectProduct,
  defaultCategory = 'glasses',
  className = '',
}: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(defaultCategory);
  const [error, setError] = useState<string | null>(null);

  // Simulate fetching products
  useEffect(() => {
    const fetchProducts = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
      try {
        setIsLoading(true);

        // In a real app, this would be an API call
        // For demo purposes, using mock data
        setTimeout(() => {
          const mockProducts: Product[] = [
            {
              id: 'g1',
              name: 'Classic Aviator Sunglasses',
              category: 'glasses',
              productType: 'glasses',
              imageUrl: '/assets/products/glasses/aviator?.jpg',
              rating: 4?.8,
              reviewCount: 120,
              isTrending: true,
              price: 129?.99,
            },
            {
              id: 'g2',
              name: 'Wayfarer Blue Light Glasses',
              category: 'glasses',
              productType: 'glasses',
              imageUrl: '/assets/products/glasses/wayfarer?.jpg',
              rating: 4?.6,
              reviewCount: 85,
              price: 99?.99,
            },
            {
              id: 'g3',
              name: 'Round Vintage Frames',
              category: 'glasses',
              productType: 'glasses',
              imageUrl: '/assets/products/glasses/round?.jpg',
              rating: 4?.5,
              reviewCount: 64,
              price: 119?.99,
            },
            {
              id: 'g4',
              name: 'Cat Eye Prescription Glasses',
              category: 'glasses',
              productType: 'glasses',
              imageUrl: '/assets/products/glasses/cateye?.jpg',
              rating: 4?.7,
              reviewCount: 92,
              isNew: true,
              price: 149?.99,
            },
            {
              id: 'j1',
              name: 'Sterling Silver Necklace',
              category: 'jewelry',
              productType: 'jewelry',
              imageUrl: '/assets/products/jewelry/necklace?.jpg',
              rating: 4?.9,
              reviewCount: 156,
              isNew: true,
              price: 199?.99,
            },
            {
              id: 'j2',
              name: 'Diamond Stud Earrings',
              category: 'jewelry',
              productType: 'jewelry',
              imageUrl: '/assets/products/jewelry/earrings?.jpg',
              rating: 4?.8,
              reviewCount: 204,
              isTrending: true,
              price: 349?.99,
            },
            {
              id: 'm1',
              name: 'Matte Lipstick Collection',
              category: 'makeup',
              productType: 'makeup',
              imageUrl: '/assets/products/makeup/lipstick?.jpg',
              rating: 4?.5,
              reviewCount: 187,
              price: 34?.99,
            },
            {
              id: 'm2',
              name: 'Eyeshadow Palette',
              category: 'makeup',
              productType: 'makeup',
              imageUrl: '/assets/products/makeup/eyeshadow?.jpg',
              rating: 4?.7,
              reviewCount: 231,
              isNew: true,
              price: 49?.99,
            },
            {
              id: 'c1',
              name: 'Classic Fit T-Shirt',
              category: 'clothing',
              productType: 'clothing',
              imageUrl: '/assets/products/clothing/tshirt?.jpg',
              rating: 4?.4,
              reviewCount: 312,
              price: 29?.99,
            },
            {
              id: 'c2',
              name: 'Slim Fit Jeans',
              category: 'clothing',
              productType: 'clothing',
              imageUrl: '/assets/products/clothing/jeans?.jpg',
              rating: 4?.6,
              reviewCount: 273,
              isTrending: true,
              price: 79?.99,
            },
          ];

          setProducts(mockProducts);
          filterProducts(mockProducts, activeCategory, searchQuery);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        console?.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory, defaultCategory]);

  // Filter products based on category and search query
  const filterProducts = (productList: Product[], category: string, query: string) => {
    let filtered = productList;

    // Filter by category
    if (category !== 'all') {
      filtered = filtered?.filter((product) => product?.category === category);
    }

    // Filter by search query
    if (query?.trim() !== '') {
      const searchLower = query?.toLowerCase();
      filtered = filtered?.filter(
        (product) =>
          product?.name.toLowerCase().includes(searchLower) ||
          product?.category.toLowerCase().includes(searchLower),
      );
    }

    setFilteredProducts(filtered);
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    filterProducts(products, category, searchQuery);
  };

  // Handle search
  const handleSearch = (e: React?.ChangeEvent<HTMLInputElement>) => {
    const query = e?.target.value;
    setSearchQuery(query);
    filterProducts(products, activeCategory, query);
  };

  // Handle product selection
  const handleSelectProduct = (product: Product) => {
    onSelectProduct(product);
  };

  return (
    <ErrorBoundary>
      <div className={`w-full ${className}`}>
        <div className="mb-6">
          <h2 className="mb-2 text-2xl font-bold">Virtual Try-On</h2>
          <p className="text-gray-600">
            Select a product below to see how it looks on you using our AR technology.
          </p>
        </div>

        {/* Search and filter */}
        <div className="mb-6 flex items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <Button variant="outline" className="ml-2">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Categories */}
        <Tabs defaultValue={activeCategory} onValueChange={handleCategoryChange} className="mb-6">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="glasses">Glasses</TabsTrigger>
            <TabsTrigger value="jewelry">Jewelry</TabsTrigger>
            <TabsTrigger value="makeup">Makeup</TabsTrigger>
            <TabsTrigger value="clothing">Clothing</TabsTrigger>
          </TabsList>

          <TabsContent value={activeCategory} className="mt-4">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                <CardFallback count={6} />
              </div>
            ) : error ? (
              <div className="py-8 text-center">
                <p className="mb-4 text-red-500">{error}</p>
                <Button onClick={() => window?.location.reload()}>Try Again</Button>
              </div>
            ) : filteredProducts?.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">No products found matching your criteria.</p>
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    filterProducts(products, activeCategory, '');
                  }}
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {filteredProducts?.map((product) => (
                  <div
                    key={product?.id}
                    className="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      {/* This would be an actual image in production */}
                      <div
                        className="flex h-full w-full items-center justify-center bg-gray-200"
                        style={{
                          backgroundImage: `url(https://placehold?.co/600x400/e0e0e0/7d7d7d?text=${encodeURIComponent(product?.name)})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                      {/*<Image
                        src={product?.imageUrl}
                        alt={product?.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />*/}

                      {/* Badges */}
                      <div className="absolute left-2 top-2 flex flex-col gap-1">
                        {product?.isNew && <Badge className="bg-blue-500">New</Badge>}
                        {product?.isTrending && <Badge className="bg-orange-500">Trending</Badge>}
                      </div>

                      <Button
                        className="absolute bottom-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => handleSelectProduct(product)}
                      >
                        Try On
                      </Button>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <h3 className="mb-1 font-medium text-gray-900">{product?.name}</h3>
                        <span className="font-semibold text-green-600">
                          ${product?.price.toFixed(2)}
                        </span>
                      </div>

                      <p className="mb-2 text-sm capitalize text-gray-500">{product?.category}</p>

                      <div className="mt-2 flex items-center">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-current text-yellow-400" />
                          <span className="ml-1 text-sm font-medium">{product?.rating}</span>
                        </div>
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="text-sm text-gray-500">{product?.reviewCount} reviews</span>
                      </div>

                      <Button className="mt-4 w-full" onClick={() => handleSelectProduct(product)}>
                        Try On Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}
