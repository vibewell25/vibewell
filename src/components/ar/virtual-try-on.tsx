'use client';

import { useState, useEffect, useRef } from 'react';
import { ARSupportCheck } from './ar-support-check';
import { ModelErrorBoundary } from './model-error-boundary';
import { ThreeARViewer } from './three-ar-viewer';
import { ShareDialog } from './share-dialog';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { useARCache } from '@/hooks/use-ar-cache';
import { useAnalytics } from '@/hooks/use-analytics';
import { AnalyticsService } from '@/services/analytics-service';
import { useEngagement } from '@/hooks/use-engagement';
import { BadgeNotification } from '@/components/engagement/badge-notification';

interface ModelInfo {
  url: string;
  type: 'makeup' | 'hairstyle' | 'accessory';
  name: string;
  id: string;
}

interface VirtualTryOnProps {
  models: ModelInfo[];
  onModelLoaded?: () => void;
  onModelError?: (error: Error) => void;
  userId?: string;
}

export function VirtualTryOn({ models, onModelLoaded, onModelError, userId }: VirtualTryOnProps) {
  const [selectedModelIndex, setSelectedModelIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [modelData, setModelData] = useState<Uint8Array | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();
  const viewerRef = useRef<HTMLDivElement>(null);
  const analyticsService = new AnalyticsService();
  const { trackAchievement } = useEngagement();

  const {
    getModel,
    prefetchModels,
    cancelLoading,
    loadingProgress: cacheLoadingProgress,
    error: cacheError,
    stats
  } = useARCache({
    autoAdjustCacheSize: true,
    prefetchEnabled: true,
  });

  const selectedModel = models[selectedModelIndex];

  // Start session timing when component mounts
  useEffect(() => {
    setSessionStartTime(Date.now());

    return () => {
      // Track session duration on unmount
      if (sessionStartTime && userId) {
        const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
        analyticsService.trackTryOnSession({
          userId,
          type: selectedModel.type,
          productId: selectedModel.id,
          productName: selectedModel.name,
          duration,
          intensity,
          success: !error,
        });

        // Track achievement for engagement features
        if (!error) {
          trackAchievement('try_on_complete');
          trackAchievement(`try_on_${selectedModel.type}`);
        }
      }
    };
  }, []);

  // Get models from cache
  useEffect(() => {
    if (selectedModel) {
      setLoading(true);
      setError(null);
      setLoadingProgress(0);

      // Load the model
      const loadModel = async () => {
        try {
          // Get model data from cache with progress tracking
          const data = await getModel(selectedModel.url, selectedModel.type, (progress) =>
            setLoadingProgress(progress),
          );

          setModelData(data);
          setLoading(false);

          if (onModelLoaded) {
            onModelLoaded();
          }

          trackEvent('virtual_try_on_model_loaded', {
            type: selectedModel.type,
            modelName: selectedModel.name,
            modelId: selectedModel.id,
            intensity,
          });

          // Prefetch next models
          const currentIndex = selectedModelIndex;
          if (prefetchModels) {
            // Prefetch the next 2 models with decreasing priority
            const modelsToFetch = [];

            for (let i = 1; i <= 2; i++) {
              const nextIndex = (currentIndex + i) % models.length;
              const model = models[nextIndex];
              modelsToFetch.push({
                url: model.url,
                type: model.type,
                priority: 10 - i * 2, // Higher priority for the next model
              });
            }

            prefetchModels(modelsToFetch);
          }
        } catch (error) {
          console.error('Error loading model:', error);
          const err = error instanceof Error ? error : new Error('Unknown error loading model');
          setError(err);
          setLoading(false);

          if (onModelError) {
            onModelError(err);
          }

          trackEvent('virtual_try_on_error', {
            type: selectedModel.type,
            error: err.message,
            modelId: selectedModel.id,
            modelName: selectedModel.name,
          });

          toast({
            title: 'Error',
            description: 'Failed to load the 3D model. Please try again.',
            variant: 'destructive',
          });
        }
      };

      loadModel();

      // Clean up on unmount or when model changes
      return () => {
        // Cancel any active loading
        if (cancelLoading && selectedModel) {
          cancelLoading(selectedModel.url);
        }
      };
    }
  }, [
    selectedModel,
    selectedModelIndex,
    getModel,
    prefetchModels,
    cancelLoading,
    onModelLoaded,
    onModelError,
    models,
    intensity,
    trackEvent,
    toast,
    userId,
    analyticsService,
    trackAchievement,
  ]);

  const handleARUnsupported = () => {
    toast({
      title: 'AR Not Supported',
      description: 'Your device does not support AR. You can still view the model in 3D mode.',
      variant: 'default',
    });
    trackEvent('ar_unsupported', {
      type: selectedModel.type,
      modelId: selectedModel.id,
      modelName: selectedModel.name,
    });
  };

  const handleCapture = (dataUrl: string) => {
    setCapturedImage(dataUrl);
    setShowShareDialog(true);
    trackEvent('virtual_try_on_captured', {
      type: selectedModel.type,
      modelId: selectedModel.id,
      modelName: selectedModel.name,
    });

    // Track capture achievement
    trackAchievement('capture');
  };

  const handleModelChange = (i: number) => {
    if (!models || models.length === 0) return;

    // Calculate next model index
    const nextIndex = (selectedModelIndex + i) % models.length;
    setSelectedModelIndex(nextIndex);
  };

  const handleIntensityChange = (newIntensity: number) => {
    setIntensity(newIntensity);
    trackEvent('virtual_try_on_intensity_change', {
      type: selectedModel.type,
      intensity: newIntensity,
      modelId: selectedModel.id,
      modelName: selectedModel.name,
    });
  };

  return (
    <div className="flex flex-col space-y-4">
      <ARSupportCheck onARUnsupported={handleARUnsupported}>
        <ModelErrorBoundary onError={onModelError}>
          <div className="mb-4 flex justify-center space-x-4">
            {models.map((model, index) => (
              <Button
                key={model.id}
                variant={selectedModelIndex === index ? 'default' : 'outline'}
                onClick={() => handleModelChange(index)}
                className="text-sm"
              >
                {model.name}
              </Button>
            ))}
          </div>

          {/* Intensity slider */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Intensity</label>
              <span className="text-sm text-gray-500">{intensity}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={intensity}
              onChange={(e) => handleIntensityChange(parseInt(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
            />
          </div>

          <div
            ref={viewerRef}
            className="relative h-[500px] w-full overflow-hidden rounded-lg bg-gray-100"
          >
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Progress value={loadingProgress} className="mb-4 w-[60%]" />
                <p className="text-sm text-gray-500">
                  Loading model... {Math.round(loadingProgress)}%
                </p>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="mb-4 text-red-500">Failed to load model: {error.message}</p>
                <Button
                  onClick={() => {
                    setLoading(true);
                    setLoadingProgress(0);
                    setError(null);
                  }}
                >
                  Retry Loading
                </Button>
              </div>
            )}
            {modelData && !loading && !error && (
              <ThreeARViewer
                modelData={modelData}
                type={selectedModel.type}
                intensity={intensity}
                onCapture={handleCapture}
              />
            )}
          </div>

          {/* Cache stats display for debugging */}
          {process.env.NODE_ENV === 'development' && stats && (
            <div className="mt-4 rounded-lg bg-gray-100 p-4 text-xs">
              <h4 className="mb-2 font-semibold">Cache Statistics</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>Models: {stats.modelCount}</div>
                <div>Size: {(stats.totalSize / (1024 * 1024)).toFixed(2)} MB</div>
                <div>Storage: {(stats.deviceQuota / (1024 * 1024)).toFixed(0)} MB</div>
                <div>Used: {stats.percentUsed.toFixed(1)}%</div>
              </div>
            </div>
          )}

          {/* Add badge notification component */}
          <BadgeNotification />

          {capturedImage && (
            <ShareDialog
              isOpen={showShareDialog}
              onClose={() => setShowShareDialog(false)}
              imageData={capturedImage}
              type={selectedModel.type}
              productName={selectedModel.name}
              userId={userId}
            />
          )}
        </ModelErrorBoundary>
      </ARSupportCheck>
    </div>
  );
}
