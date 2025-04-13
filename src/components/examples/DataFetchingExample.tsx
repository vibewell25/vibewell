'use client';

import React, { useEffect, useState } from 'react';
import { useErrorHandler, ErrorCategory, ErrorSource, ErrorSeverity } from '../../utils/error-handler';
import { createState, StateManagerType } from '../../utils/state-manager';

// Define interface for product data
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
}

// Create state store using unified API with Redux implementation
const productState = createState<{
  products: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  filter: string;
}>(
  {
    products: [],
    selectedProduct: null,
    loading: false,
    filter: ''
  },
  StateManagerType.REDUX
);

/**
 * Example component demonstrating integration between error handling and state management
 * Shows practical usage of:
 * - Error handling with proper categorization
 * - State management with Redux
 * - Data fetching with error handling
 * - Component organization with error boundaries
 */
export default function DataFetchingExample() {
  const { Provider } = productState as any;

  return (
    <Provider>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Products Catalog</h1>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <ProductList />
          </div>
          <div className="md:col-span-4">
            <ProductDetail />
          </div>
        </div>
      </div>
    </Provider>
  );
}

// Component for product listing
function ProductList() {
  const [state, dispatch] = (productState as any).useReduxState();
  const { products, loading, filter } = state;
  const { captureError, wrapPromise } = useErrorHandler();
  
  // Fetch products with error handling
  const fetchProducts = async () => {
    // Update loading state
    dispatch({ type: 'state/setState', payload: { loading: true } });
    
    try {
      // Simulated API call
      const response = await fetch('/api/products');
      
      if (!response.ok) {
        throw new Error(`Error fetching products: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Update state with products
      dispatch({ 
        type: 'state/setState', 
        payload: { 
          products: data,
          loading: false
        } 
      });
      
      return data;
    } catch (error) {
      // Capture error with appropriate categorization
      captureError(error instanceof Error ? error : 'Failed to fetch products', {
        source: ErrorSource.NETWORK,
        category: ErrorCategory.RESOURCE,
        severity: ErrorSeverity.WARNING,
        metadata: {
          component: 'ProductList',
          endpoint: '/api/products'
        },
        // Provide retry function for user
        retryFunction: fetchProducts
      });
      
      // Update loading state
      dispatch({ type: 'state/setState', payload: { loading: false } });
      throw error;
    }
  };
  
  // Wrap the fetch function with error handling
  const fetchProductsWithErrorHandling = () => {
    return wrapPromise(fetchProducts(), {
      source: ErrorSource.NETWORK,
      category: ErrorCategory.RESOURCE
    });
  };
  
  // Fetch products on component mount
  useEffect(() => {
    fetchProductsWithErrorHandling().catch(() => {
      // Error already handled by wrapPromise
    });
  }, []);
  
  // Filter products based on search term
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ 
      type: 'state/setState', 
      payload: { filter: e.target.value } 
    });
  };
  
  // Select a product
  const selectProduct = (product: Product) => {
    dispatch({ 
      type: 'state/setState', 
      payload: { selectedProduct: product } 
    });
  };
  
  // Filter products based on search term
  const filteredProducts = filter 
    ? products.filter((product: Product) => 
        product.name.toLowerCase().includes(filter.toLowerCase()) ||
        product.description.toLowerCase().includes(filter.toLowerCase())
      )
    : products;
  
  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search products..."
          value={filter}
          onChange={handleFilterChange}
          className="w-full p-2 border rounded"
        />
      </div>
      
      {loading ? (
        <div className="py-8 text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
          <p className="mt-2">Loading products...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map((product: Product) => (
            <div 
              key={product.id}
              className="border rounded p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => selectProduct(product)}
            >
              <div className="w-full h-40 bg-gray-100 mb-2 rounded overflow-hidden">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-gray-500 truncate">{product.description}</p>
              <p className="font-bold mt-2">${product.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p>No products found{filter ? ` matching "${filter}"` : ''}.</p>
          <button 
            onClick={fetchProductsWithErrorHandling}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Products
          </button>
        </div>
      )}
    </div>
  );
}

// Component for product details
function ProductDetail() {
  const [state] = (productState as any).useReduxState();
  const { selectedProduct } = state;
  const { captureError } = useErrorHandler();
  const [isAdding, setIsAdding] = useState(false);
  
  // Add to cart with error handling
  const addToCart = async () => {
    if (!selectedProduct) return;
    
    setIsAdding(true);
    
    try {
      // Simulate API call
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: selectedProduct.id, quantity: 1 }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add item to cart: ${response.statusText}`);
      }
      
      // Show success message (would typically use a toast)
      console.log('Added to cart:', selectedProduct.name);
      
    } catch (error) {
      // Capture error with appropriate categorization
      captureError(error instanceof Error ? error : 'Failed to add to cart', {
        source: ErrorSource.NETWORK,
        category: ErrorCategory.RESOURCE,
        severity: ErrorSeverity.ERROR,
        metadata: {
          component: 'ProductDetail',
          endpoint: '/api/cart',
          productId: selectedProduct.id
        },
        // Provide retry function
        retryFunction: addToCart
      });
    } finally {
      setIsAdding(false);
    }
  };
  
  if (!selectedProduct) {
    return (
      <div className="border rounded p-6 h-full flex items-center justify-center text-gray-500">
        Select a product to view details
      </div>
    );
  }
  
  return (
    <div className="border rounded p-6">
      <div className="w-full h-64 bg-gray-100 mb-4 rounded overflow-hidden">
        <img 
          src={selectedProduct.imageUrl} 
          alt={selectedProduct.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
      <p className="text-3xl font-bold text-blue-600 mb-4">
        ${selectedProduct.price.toFixed(2)}
      </p>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Description:</h3>
        <p className="text-gray-600">{selectedProduct.description}</p>
      </div>
      <button
        onClick={addToCart}
        disabled={isAdding}
        className={`w-full py-3 rounded font-medium ${
          isAdding 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isAdding ? 'Adding...' : 'Add to Cart'}
      </button>
    </div>
  );
} 