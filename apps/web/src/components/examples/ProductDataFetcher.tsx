import { useState, useEffect } from 'react';
import { useErrorHandler, ErrorSource, ErrorCategory, ErrorSeverity } from '@/utils/error-handler';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/skeleton';
import { withErrorBoundary } from '@/hooks/useErrorBoundary';
import { isError } from '@/utils/type-guards';
import { enhanceError } from '@/utils/error-utils';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  inStock: boolean;
// Add missing enum values locally to avoid modifying the original file
// This is a temporary solution until the error-handler.ts can be properly updated
const ExtendedErrorSource = {
  ...ErrorSource,
  API: 'api' as any,
const ExtendedErrorCategory = {
  ...ErrorCategory,
  RESOURCE_NOT_FOUND: 'resource-not-found' as any,
  SERVER: 'server' as any,
  TIMEOUT: 'timeout' as any,
/**
 * A practical example component showing error handling in a real-world API data fetching scenario.
 * This demonstrates:
 * - Handling loading states
 * - API error handling with appropriate categorization
 * - Retry functionality
 * - Network error handling
 * - Not-found resource handling
 */
function ProductDataFetcherComponent() {
  const errorHandler = useErrorHandler();
  const captureError = errorHandler.captureError;

  // Create a local implementation of withErrorHandling if it doesn't exist in the error handler
  const withErrorHandling =
    errorHandler.withErrorHandling ||
    (<T extends any[], R>(fn: (...args: T) => Promise<R>, options?: any) => {
      return async (...args: T): Promise<R> => {
        try {
          return await fn(...args);
catch (error) {
          if (isError(error)) {
            captureError(error, options);
else {
            captureError(String(error), options);
throw error;
const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [productId, setProductId] = useState('prod-123'); // Valid ID to start

  // Fetch products with proper error handling
  const fetchProducts = withErrorHandling(
    async () => {
      setLoading(true);

      try {
        // Simulate API request
        const response = await fetch('/api/products');

        if (!response.ok) {
          // Handle specific HTTP error codes
          if (response.status === 404) {
            throw new Error('Products not found');
else if (response.status === 401) {
            throw new Error('Unauthorized access to products');
else if (response.status === 403) {
            throw new Error('Forbidden access to products');
else if (response.status >= 500) {
            throw new Error('Server error occurred while fetching products');
else {
            throw new Error(`Failed to fetch products: ${response.statusText}`);
const data = await response.json();
        setProducts(data);
        return data;
finally {
        setLoading(false);
{
      source: ExtendedErrorSource.API,
      category: ExtendedErrorCategory.RESOURCE_NOT_FOUND,
      severity: ErrorSeverity.WARNING,
      metadata: {
        component: 'ProductDataFetcher',
        endpoint: '/api/products',
// Fetch a single product with custom error handling
  const fetchProductById = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');id: string) => {
    setLoading(true);

    try {
      // Simulate API request
      // For demo purposes, we'll throw different errors based on the ID
      if (id === 'not-found') {
        // Simulate 404 error
        throw new Error('Product not found');
else if (id === 'server-error') {
        // Simulate 500 error
        throw new Error('Internal server error');
else if (id === 'timeout') {
        // Simulate timeout error
        throw new Error('Request timed out');
else if (id === 'network') {
        // Simulate network error
        const networkError = new Error('Network error');
        networkError.name = 'TypeError'; // Simulate a fetch network error
        throw networkError;
// Simulate successful response for any other ID
      const mockProduct: Product = {
        id,
        name: `Product ${id}`,
        price: 99.99,
        description: 'This is a sample product description',
        inStock: true,
// Set as the only product in our list
      setProducts([mockProduct]);
catch (error) {
      // Use the enhanceError utility to properly handle and categorize the error
      const enhanced = enhanceError(error, {
        source: ExtendedErrorSource.API,
        metadata: {
          productId: id,
          endpoint: `/api/products/${id}`,
          timestamp: new Date().toISOString(),
// Create a retry function
      const retry = () => fetchProductById(id);

      // Capture and handle the error
      const appError = captureError(enhanced.originalError || enhanced.errorMessage, {
        source: enhanced.source,
        category: enhanced.category,
        severity: enhanced.severity,
        metadata: enhanced.metadata,
        retry, // Pass retry function directly, compatible with error handler
// Clear products since fetch failed
      setProducts([]);

      // Re-throw to allow parent components to also handle if needed
      throw appError;
finally {
      setLoading(false);
// Wrap the fetchProductById with the error handler
  const handleFetchProduct = withErrorHandling(() => fetchProductById(productId), {
    // These are default values that will be overridden by the specific ones in fetchProductById
    source: ExtendedErrorSource.API,
    category: ErrorCategory.UNKNOWN,
    severity: ErrorSeverity.ERROR,
// Initial data fetch
  useEffect(() => {
    fetchProducts().catch(console.error);
[fetchProducts]);

  // UI for testing different error scenarios
  return (
    (<div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold">Product Data Fetcher</h2>
        <p className="text-gray-600">
          This component demonstrates error handling in API data fetching scenarios.
        </p>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setProductId('prod-123')}
            className={productId === 'prod-123' ? 'bg-primary text-primary-foreground' : ''}
          >
            Valid Product
          </Button>
          <Button
            variant="outline"
            onClick={() => setProductId('not-found')}
            className={productId === 'not-found' ? 'bg-primary text-primary-foreground' : ''}
          >
            Not Found Error
          </Button>
          <Button
            variant="outline"
            onClick={() => setProductId('server-error')}
            className={productId === 'server-error' ? 'bg-primary text-primary-foreground' : ''}
          >
            Server Error
          </Button>
          <Button
            variant="outline"
            onClick={() => setProductId('timeout')}
            className={productId === 'timeout' ? 'bg-primary text-primary-foreground' : ''}
          >
            Timeout Error
          </Button>
          <Button
            variant="outline"
            onClick={() => setProductId('network')}
            className={productId === 'network' ? 'bg-primary text-primary-foreground' : ''}
          >
            Network Error
          </Button>
        </div>

        <Button onClick={() => handleFetchProduct()} className="mt-4 w-full md:w-auto">
          Fetch Product
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          // Loading skeleton
          (Array(3)
            .fill(0)
            .map((_, index) => (
              <Card key={index} className="space-y-3 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-8 w-1/4" />
                </div>
              </Card>
            )))
        ) : products.length > 0 ? (
          // Products display
          (products.map((product) => (
            <Card key={product.id} className="space-y-3 p-4">
              <h3 className="text-lg font-bold">{product.name}</h3>
              <p className="font-medium text-green-600">${product.price.toFixed(2)}</p>
              <p className="text-gray-600">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className={product.inStock ? 'text-green-500' : 'text-red-500'}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </div>
            </Card>
          )))
        ) : (
          // Empty state
          (<div className="col-span-full flex flex-col items-center justify-center rounded-lg border p-8">
            <p className="mb-4 text-gray-500">No products found</p>
            <Button variant="outline" onClick={() => fetchProducts()}>
              Retry
            </Button>
          </div>)
        )}
      </div>
    </div>)
// Wrap with error boundary for component-level error handling
const ProductDataFetcher = withErrorBoundary(ProductDataFetcherComponent);

export default ProductDataFetcher;
