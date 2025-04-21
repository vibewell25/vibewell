'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface ARSupportCheckProps {
  children: React.ReactNode;
  onARUnsupported?: () => void;
}

export function ARSupportCheck({ children, onARUnsupported }: ARSupportCheckProps) {
  const [isARSupported, setIsARSupported] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkARSupport();
  }, []);

  const checkARSupport = async () => {
    try {
      // Check if the browser supports WebXR
      if (navigator.xr) {
        const isSupported = await navigator.xr.isSessionSupported('immersive-ar');
        setIsARSupported(isSupported);
        if (!isSupported) {
          onARUnsupported?.();
          toast({
            title: 'AR Not Supported',
            description:
              'Your device or browser does not support AR features. You can still view the 3D model.',
            variant: 'warning',
          });
        }
      } else {
        setIsARSupported(false);
        onARUnsupported?.();
        toast({
          title: 'AR Not Supported',
          description: 'Your browser does not support WebXR. Please try a different browser.',
          variant: 'warning',
        });
      }
    } catch (error) {
      console.error('Error checking AR support:', error);
      setIsARSupported(false);
      onARUnsupported?.();
      toast({
        title: 'Error',
        description: 'Failed to check AR support. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isARSupported) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">AR Not Available</h2>
          <p className="text-gray-500">
            Your device or browser does not support AR features. You can still view the 3D model in
            3D view mode.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">To use AR features, you need:</p>
            <ul className="list-disc list-inside text-sm text-gray-500">
              <li>A device with AR capabilities (iOS 12+ or Android 8+)</li>
              <li>A compatible browser (Safari on iOS or Chrome on Android)</li>
              <li>Camera permissions enabled</li>
            </ul>
          </div>
          <Button variant="outline" onClick={checkARSupport}>
            Check Again
          </Button>
        </div>
      </Card>
    );
  }

  return <>{children}</>;
}
