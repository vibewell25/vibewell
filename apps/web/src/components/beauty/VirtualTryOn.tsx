import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Camera, Upload, Image, Settings, Share2, ChevronLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Skeleton from '@/components/ui/SkeletonLoader';
import { useLoadingState } from '@/providers/LoadingStateProvider';

// Simple notification component
interface Notification {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info';
}

function Notifications({ notifications, onDismiss }: { 
  notifications: Notification[],
  onDismiss: (id: string) => void
}) {
  if (notifications.length === 0) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map(notification => (
        <div 
          key={notification.id}
          className={cn(
            "p-4 rounded-lg shadow-lg flex items-start gap-3 max-w-sm animate-in slide-in-from-right",
            notification.type === 'success' ? 'bg-green-50 border border-green-200' : 
            notification.type === 'error' ? 'bg-red-50 border border-red-200' : 
            'bg-blue-50 border border-blue-200'
          )}
        >
          <div className="shrink-0">
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : notification.type === 'error' ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-blue-500" />
            )}
          </div>
          <div className="flex-1">
            <h4 className={cn(
              "text-sm font-medium",
              notification.type === 'success' ? 'text-green-800' : 
              notification.type === 'error' ? 'text-red-800' : 
              'text-blue-800'
            )}>
              {notification.title}
            </h4>
            {notification.description && (
              <p className={cn(
                "text-xs mt-1",
                notification.type === 'success' ? 'text-green-600' : 
                notification.type === 'error' ? 'text-red-600' : 
                'text-blue-600'
              )}>
                {notification.description}
              </p>
            )}
          </div>
          <button 
            onClick={() => onDismiss(notification.id)}
            className="shrink-0 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

export function VirtualTryOn() {
  const [activeTab, setActiveTab] = useState('camera');
  const [isLoading, setIsLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [imageSelected, setImageSelected] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const { startLoading, updateLoading, endLoading } = useLoadingState();
  
  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Function to show a notification
  const showNotification = (title: string, description?: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, title, description, type }]);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      dismissNotification(id);
    }, 5000);
    
    return id;
  };
  
  // Function to dismiss a notification
  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  useEffect(() => {
    // Simulate checking camera permissions
    const checkCamera = async () => {
      try {
        // Check if we can access the camera
        if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
          await navigator.mediaDevices.getUserMedia({ video: true });
          setCameraReady(true);
        }
      } catch (error) {
        console.error('Camera access error:', error);
        showNotification(
          'Camera Access Required',
          'Please allow camera access to use the try-on feature.',
          'error'
        );
      }
    };

    if (activeTab === 'camera') {
      checkCamera();
    }
  }, [activeTab]);

  // Simulate progressive loading of product data
  useEffect(() => {
    if (isLoading) {
      const loadingId = 'virtual-try-on-loading';
      startLoading({
        id: loadingId,
        message: 'Processing your image...',
        progress: 0,
        showSpinner: true,
      });

      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          const newProgress = Math.min(prev + 10, 100);
          updateLoading(loadingId, { progress: newProgress });
          return newProgress;
        });
      }, 200);

      return () => {
        clearInterval(interval);
        endLoading(loadingId);
      };
    }
  }, [isLoading, startLoading, updateLoading, endLoading]);

  const handleTryOn = async () => {
    try {
      setIsLoading(true);
      
      // Start timer to check for process timeouts
      const start = Date.now();
      
      // Simulate different stages of try-on processing
      await new Promise((resolve) => setTimeout(resolve, 500)); // Initial image capture
      
      if (Date.now() - start > 30000) throw new Error('Processing timeout');
      
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Face detection
      await new Promise((resolve) => setTimeout(resolve, 500)); // Product application
      
      // Set a mock result image - in a real app this would come from the server
      setResultImage('/mock-try-on-result.jpg');
      setShowResult(true);
      
      showNotification(
        'Try-On Complete',
        'Your virtual try-on has been processed successfully.',
        'success'
      );
    } catch (error) {
      showNotification(
        'Error',
        'Failed to process virtual try-on. Please try again.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageSelected(true);
      // Here we would normally upload and process the file
      // For now just simulate image selection
      showNotification(
        'Image Selected',
        `${file.name} is ready for try-on.`,
        'success'
      );
    }
  };

  const resetTryOn = () => {
    setShowResult(false);
    setResultImage(null);
  };

  return (
    <>
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Virtual Try-On</CardTitle>
            <CardDescription>
              Try on different beauty products virtually using your camera or upload a photo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {showResult ? (
              <div className="space-y-4">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                  {resultImage ? (
                    <img 
                      src={resultImage} 
                      alt="Try-on result" 
                      className="h-full w-full object-cover transition-opacity duration-300"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Camera className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={resetTryOn}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                  <Button>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Look
                  </Button>
                </div>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="camera">
                    <Camera className="mr-2 h-4 w-4" />
                    Camera
                  </TabsTrigger>
                  <TabsTrigger value="upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="camera" className="space-y-4">
                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                    {!cameraReady ? (
                      <div className="animate-pulse flex h-full flex-col items-center justify-center p-4">
                        <Camera className="mb-4 h-12 w-12 text-muted-foreground" />
                        <Skeleton className="h-4 w-48 mb-2" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Camera className="h-12 w-12 text-muted-foreground" />
                        <p className="ml-2 text-sm text-muted-foreground">Camera preview will appear here</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                    <Button 
                      onClick={handleTryOn} 
                      disabled={isLoading || !cameraReady}
                      className="w-full sm:w-auto relative overflow-hidden"
                    >
                      {isLoading ? (
                        <>
                          <div 
                            className="absolute inset-0 bg-primary/20 transition-all duration-300" 
                            style={{ width: `${loadingProgress}%` }} 
                          />
                          <span className="relative z-10">Processing...</span>
                        </>
                      ) : (
                        'Start Try-On'
                      )}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="upload" className="space-y-4">
                  <div className={cn(
                    "flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed p-8 transition-all duration-300",
                    imageSelected ? "border-primary/60 bg-primary/5" : "border-muted-foreground/25"
                  )}>
                    <Upload className={cn(
                      "h-12 w-12 transition-all duration-300",
                      imageSelected ? "text-primary" : "text-muted-foreground"
                    )} />
                    <div className="text-center">
                      <p className="text-sm font-medium">
                        {imageSelected ? "Image ready for try-on" : "Upload a photo"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {imageSelected ? "Click 'Start Try-On' below" : "Supported formats: JPG, PNG, WEBP"}
                      </p>
                    </div>
                    <label>
                      <Button variant="outline" className="cursor-pointer">
                        <Image className="mr-2 h-4 w-4" />
                        {imageSelected ? "Change Photo" : "Select Photo"}
                      </Button>
                      <input 
                        type="file" 
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  <div className="flex justify-center">
                    <Button 
                      onClick={handleTryOn} 
                      disabled={isLoading || !imageSelected}
                      className="relative overflow-hidden w-full sm:w-auto"
                    >
                      {isLoading ? (
                        <>
                          <div 
                            className="absolute inset-0 bg-primary/20 transition-all duration-300" 
                            style={{ width: `${loadingProgress}%` }} 
                          />
                          <span className="relative z-10">Processing...</span>
                        </>
                      ) : (
                        'Start Try-On'
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            )}

            <div className="rounded-lg bg-muted p-4">
              <h3 className="text-sm font-medium">Try-On Tips</h3>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                <li>• Ensure good lighting for best results</li>
                <li>• Keep your face centered in the frame</li>
                <li>• Remove any existing makeup for accurate results</li>
                <li>• Try different angles for the best match</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Try-Ons</CardTitle>
              <CardDescription>View your previous virtual try-on sessions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Display skeleton loader when loading */}
                {isLoading ? (
                  Array(2).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                        <Image className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Natural Look</p>
                        <p className="text-xs text-muted-foreground">Last tried 2 hours ago</p>
                      </div>
                    </div>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saved Looks</CardTitle>
              <CardDescription>Your favorite virtual try-on results.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Display skeleton loader when loading */}
                {isLoading ? (
                  Array(2).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                        <Image className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Evening Glam</p>
                        <p className="text-xs text-muted-foreground">Saved 3 days ago</p>
                      </div>
                    </div>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Render notifications */}
      <Notifications 
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </>
  );
}
