'use client';

import { useState, useEffect, useRef } from 'react';
import { ARSupportCheck } from './ar-support-check';
import { ModelErrorBoundary } from './model-error-boundary';
import { ThreeARViewer } from './three-ar-viewer';
import { ShareDialog } from './share-dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { useCache } from '@/hooks/use-cache';
import { useAnalytics } from '@/hooks/use-analytics';

interface ARViewerProps {
  modelUrl: string;
  type: 'makeup' | 'hairstyle' | 'accessory';
  onModelLoaded?: () => void;
  onModelError?: (error: Error) => void;
}

export function ARViewer({ modelUrl, type, onModelLoaded, onModelError }: ARViewerProps) {
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [modelData, setModelData] = useState<Uint8Array | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const { toast } = useToast();
  const { getCachedModel, cacheModel } = useCache();
  const { trackEvent } = useAnalytics();
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadModel();
  }, [modelUrl]);

  const loadModel = async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);
      setError(null);

      // Check cache first
      const cachedModel = await getCachedModel(modelUrl);
      if (cachedModel) {
        setLoadingProgress(100);
        setModelData(cachedModel);
        onModelLoaded?.();
        trackEvent('model_loaded_from_cache', { type });
        return;
      }

      // Load model if not in cache
      const response = await fetch(modelUrl);
      if (!response.ok) throw new Error('Failed to load model');

      const contentLength = response.headers.get('Content-Length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      let loaded = 0;

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to read model data');

      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        loaded += value.length;
        if (total > 0) {
          setLoadingProgress((loaded / total) * 100);
        }
      }

      const modelData = new Uint8Array(loaded);
      let position = 0;
      for (const chunk of chunks) {
        modelData.set(chunk, position);
        position += chunk.length;
      }

      // Cache the model
      await cacheModel(modelUrl, modelData);
      setLoadingProgress(100);
      setModelData(modelData);
      onModelLoaded?.();
      trackEvent('model_loaded', { type });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load model');
      setError(error);
      onModelError?.(error);
      trackEvent('model_load_error', { type, error: error.message });
      toast({
        title: 'Error',
        description: 'Failed to load the 3D model. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleARUnsupported = () => {
    toast({
      title: 'AR Not Supported',
      description: 'Your device does not support AR. You can still view the model in 3D mode.',
      variant: 'default',
    });
    trackEvent('ar_unsupported', { type });
  };

  const handleCapture = (dataUrl: string) => {
    setCapturedImage(dataUrl);
    setShowShareDialog(true);
    trackEvent('model_captured', { type });
  };

  return (
    <ARSupportCheck onARUnsupported={handleARUnsupported}>
      <ModelErrorBoundary onError={onModelError}>
        <div ref={viewerRef} className="relative w-full h-[500px] bg-gray-100" data-testid="ar-viewer">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center" data-testid="loader">
              <Progress value={loadingProgress} className="w-[60%] mb-4" />
              <p className="text-sm text-gray-500">
                Loading model... {Math.round(loadingProgress)}%
              </p>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button onClick={loadModel}>Retry Loading</Button>
            </div>
          )}
          {modelData && !loading && !error && (
            <ThreeARViewer
              modelData={modelData}
              type={type}
              onCapture={handleCapture}
              data-testid="canvas"
            />
          )}
        </div>
        {capturedImage && (
          <ShareDialog
            isOpen={showShareDialog}
            onClose={() => setShowShareDialog(false)}
            imageData={capturedImage}
            type={type}
          />
        )}
      </ModelErrorBoundary>
    </ARSupportCheck>
  );
} 