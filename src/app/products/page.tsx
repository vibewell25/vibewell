'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductService, Product, ProductFilter, ProductSortOption } from '@/services/product-service';
import { ProductCard } from '@/components/products/product-card';
import { ProductFilters } from '@/components/products/product-filters';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<Record<string, string[]>>({});
  const [brands, setBrands] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(12);
  
  // Filter and sort state
  const [filter, setFilter] = useState<ProductFilter>({});
  const [sort, setSort] = useState<ProductSortOption>({ field: 'rating', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  
  const productService = new ProductService();
  
  // Fetch filter options on component mount
  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        // Fetch categories and subcategories
        const { categories, subcategories } = await productService.getProductCategories();
        setCategories(categories);
        setSubcategories(subcategories);
        
        // Fetch brands
        const brands = await productService.getProductBrands();
        setBrands(brands);
        
        // Fetch tags
        const tags = await productService.getProductTags();
        setTags(tags);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    }
    
    fetchFilterOptions();
  }, []);
  
  // Fetch products based on filters, sort and pagination
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      
      try {
        // Merge searchTerm into filter
        const searchFilter = { ...filter, searchTerm: searchTerm || undefined };
        
        // Fetch products
        const { products, total } = await productService.searchProducts(
          searchFilter,
          sort,
          currentPage,
          limit
        );
        
        setProducts(products);
        setTotalProducts(total);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchProducts();
  }, [filter, sort, currentPage, limit, searchTerm]);
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset to first page when searching
    setCurrentPage(1);
  };
  
  // Handle filter changes
  const handleFilterChange = (newFilter: ProductFilter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page when filter changes
  };
  
  // Handle sort changes
  const handleSortChange = (value: string) => {
    const [field, direction] = value.split('-') as [any, any];
    setSort({ field, direction });
  };
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Browse Products</h1>
      
      {/* Search and Sort */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <Input 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        
        <div className="flex items-center gap-2">
          <span className="text-sm whitespace-nowrap">Sort by:</span>
          <Select
            defaultValue="rating-desc"
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="min-w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating-desc">Rating (High to Low)</SelectItem>
              <SelectItem value="rating-asc">Rating (Low to High)</SelectItem>
              <SelectItem value="price-desc">Price (High to Low)</SelectItem>
              <SelectItem value="price-asc">Price (Low to High)</SelectItem>
              <SelectItem value="name-asc">Name (A to Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z to A)</SelectItem>
              <SelectItem value="created_at-desc">Newest First</SelectItem>
              <SelectItem value="created_at-asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Mobile/Responsive View Handling */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="md:col-span-1">
          <ProductFilters 
            categories={categories}
            subcategories={subcategories}
            brands={brands}
            tags={tags}
            onChange={handleFilterChange}
            initialFilter={filter}
          />
        </div>
        
        {/* Products Grid */}
        <div className="md:col-span-3">
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Results Summary */}
              <div className="mb-4 text-sm text-muted-foreground">
                Showing {products.length} of {totalProducts} products
              </div>
              
              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                  // Loading skeletons
                  Array.from({ length: limit }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-40 w-full rounded-lg" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  ))
                ) : products.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-xl font-medium mb-2">No products found</p>
                    <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
                  </div>
                ) : (
                  products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                )}
              </div>
              
              {/* Pagination */}
              {totalProducts > limit && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalProducts / limit)}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 