'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductService } from '@/services/product-service';
import { useAuth } from '@/hooks/use-unified-auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Camera, Share2 } from 'lucide-react';
import { ProductRecommendations } from '@/components/products/product-recommendations';
import { TryOnService } from '@/services/try-on-service';
import { FeedbackDialog } from '@/components/try-on/feedback-dialog';

export default function TryOnPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const productService = new ProductService();
  const tryOnService = new TryOnService();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const productId = Array.isArray(id) ? id[0] : id;

        if (!productId) {
          setError('Product ID is missing');
          return;
        }

        // Fetch product details
        const productData = await productService.getProduct(productId);

        if (!productData) {
          setError('Product not found');
          return;
        }

        if (!productData.ar_compatible) {
          setError('This product is not AR compatible');
          return;
        }

        setProduct(productData);

        // Here you would initialize the AR experience using the product.model_url
        // For demonstration purposes, we'll just set a timeout to simulate loading
        setTimeout(() => {
          setModelLoaded(true);
          setLoading(false);
        }, 2000);

        // Track this as a try-on session
        if (user?.id) {
          try {
            const newSessionId = await tryOnService.startSession(user.id, productId);
            setSessionId(newSessionId);
            setStartTime(new Date());
          } catch (err) {
            console.error('Failed to track try-on session:', err);
          }
        }
      } catch (err) {
        console.error('Error loading product for try-on:', err);
        setError('Failed to load product data');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();

    // Clean up function to end the session
    return () => {
      if (sessionId && user?.id && startTime) {
        const endTime = new Date();
        const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

        tryOnService
          .completeSession(sessionId, user.id, {
            duration_seconds: durationSeconds,
          })
          .catch(err => {
            console.error('Error completing try-on session:', err);
          });
      }
    };
  }, [id, user?.id]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out my virtual try-on!',
          text: 'I just tried on this product virtually at VibeWell!',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing try-on:', err);
    }
  };

  const handleCapture = async () => {
    // This would take a screenshot of the current AR view
    alert('Capture feature coming soon!');

    // In a real implementation, you would:
    // 1. Capture the current AR view as an image
    // 2. Upload it to storage
    // 3. Update the session with the screenshot URL

    if (sessionId && user?.id) {
      try {
        // Mock screenshot URL for demonstration
        const mockScreenshotUrl = `https://example.com/screenshots/${sessionId}-${Date.now()}.jpg`;

        await tryOnService.completeSession(sessionId, user?.id, {
          screenshots: [mockScreenshotUrl],
        });
      } catch (err) {
        console.error('Error saving screenshot:', err);
      }
    }
  };

  const handleFinishTryOn = () => {
    setShowFeedback(true);
  };

  const handleFeedbackClose = () => {
    setShowFeedback(false);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link href="/products">
            <Button variant="ghost" className="pl-0 flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        </div>

        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Explore Other AR-Ready Products</h2>
          <ProductRecommendations limit={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href={`/products/${id}`}>
          <Button variant="ghost" className="pl-0 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Product
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Virtual Try-On</h1>

      <div className="bg-muted rounded-lg overflow-hidden relative">
        {loading ? (
          <div className="aspect-video w-full">
            <Skeleton className="h-full w-full" />
          </div>
        ) : (
          <>
            {/* This would be replaced with an actual AR component */}
            <div className="aspect-video w-full bg-gradient-to-r from-purple-500/30 to-blue-500/30 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">AR Experience Ready</h2>
                <p className="mb-4 text-muted-foreground">
                  Use your device camera to see this product on you
                </p>
                <Button>Start AR Experience</Button>
              </div>
            </div>

            {/* Controls overlay - would be shown during active AR session */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <Button variant="secondary" size="icon" onClick={handleCapture}>
                <Camera className="h-5 w-5" />
              </Button>
              <Button variant="secondary" size="icon" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="secondary" onClick={handleFinishTryOn}>
                Finish & Give Feedback
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 text-center max-w-xl mx-auto">
        <h2 className="text-xl font-semibold mb-2">How to Use</h2>
        <ol className="text-left space-y-2 text-muted-foreground">
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">1.</span>
            <span>Click "Start AR Experience" to activate your camera</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">2.</span>
            <span>Position yourself in the frame as directed</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">3.</span>
            <span>The product will be virtually applied</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">4.</span>
            <span>Use the camera button to take screenshots</span>
          </li>
        </ol>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-semibold mb-4">Similar Products to Try</h2>
        <ProductRecommendations productId={Array.isArray(id) ? id[0] : id} showTabs={false} />
      </div>

      {/* Feedback Dialog */}
      {user?.id && sessionId && product && (
        <FeedbackDialog
          isOpen={showFeedback}
          onClose={handleFeedbackClose}
          sessionId={sessionId}
          userId={user.id}
          productName={product.name}
        />
      )}
    </div>
  );
}
