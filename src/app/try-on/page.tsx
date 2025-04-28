'use client';;
import { useState } from 'react';
import { Layout } from '@/components/layout';
import { ProductSelector } from '@/components/virtual-try-on/ProductSelector';
import { TryOnViewer } from '@/components/virtual-try-on/TryOnViewer';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/use-unified-auth';
import { ErrorBoundary } from '@/components/ui/error-boundary';

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

export default function TryOnPage() {
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Handle product selection
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCapturedImage(null);
  };

  // Handle going back to product selection
  const handleBackToProducts = () => {
    setSelectedProduct(null);
    setCapturedImage(null);
  };

  // Handle image capture
  const handleCapture = (imageUrl: string) => {
    setCapturedImage(imageUrl);
  };

  // Handle sharing
  const handleShare = async (imageUrl: string) => {
    try {
      if (navigator.share) {
        // Web Share API is supported
        const blob = await fetch(imageUrl).then((r) => r.blob());
        const file = new File([blob], 'vibewell-try-on.png', { type: 'image/png' });

        await navigator.share({
          title: `Vibewell - Try On ${selectedProduct?.name || 'Product'}`,
          text: 'Check out how this looks on me using Vibewell virtual try-on!',
          files: [file],
        });
      } else {
        // Web Share API not supported - fallback to clipboard
        // Create a textarea element to copy the URL to clipboard
        const textarea = document.createElement('textarea');
        textarea.value = imageUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        alert('Image URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Failed to share. Try downloading the image instead.');
    }
  };

  return (
    (<ErrorBoundary>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex min-h-[80vh] flex-col">
            {!user ? (
              // User not signed in
              (<div className="flex flex-col items-center justify-center py-12 text-center">
                <h2 className="mb-4 text-2xl font-bold">Sign In to Use Virtual Try-On</h2>
                <p className="mb-6 max-w-md text-gray-600">
                  To experience our virtual try-on feature and see how products look on you, please
                  sign in to your account.
                </p>
                <Button href="/auth/sign-in" className="max-w-xs">
                  Sign In
                </Button>
              </div>)
            ) : selectedProduct ? (
              // Try on viewer
              (<div className="flex-grow">
                <TryOnViewer
                  productId={selectedProduct.id}
                  productName={selectedProduct.name}
                  productType={selectedProduct.productType}
                  onCapture={handleCapture}
                  onShare={handleShare}
                  onBack={handleBackToProducts}
                />
                {/* Related products and recommendations could go here */}
              </div>)
            ) : (
              // Product selector
              (<ProductSelector onSelectProduct={handleSelectProduct} />)
            )}
          </div>
        </div>
      </Layout>
    </ErrorBoundary>)
  );
}
