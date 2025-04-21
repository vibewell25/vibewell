import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Image, Video, Settings, Share2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';

export function VirtualTryOn() {
  const [activeTab, setActiveTab] = useState('camera');
  const [isLoading, setIsLoading] = useState(false);

  const handleTryOn = async () => {
    try {
      setIsLoading(true);
      // Simulate try-on process
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: 'Try-On Complete',
        description: 'Your virtual try-on has been processed successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process virtual try-on.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Virtual Try-On</CardTitle>
          <CardDescription>
            Try on different beauty products virtually using your camera or upload a photo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
              <div className="aspect-video w-full rounded-lg bg-muted">
                {/* Camera preview will go here */}
                <div className="flex h-full items-center justify-center">
                  <Camera className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>
              <div className="flex justify-center space-x-4">
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button onClick={handleTryOn} disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Start Try-On'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed p-8">
                <Upload className="h-12 w-12 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">Upload a photo</p>
                  <p className="text-xs text-muted-foreground">Supported formats: JPG, PNG, WEBP</p>
                </div>
                <Button variant="outline">
                  <Image className="mr-2 h-4 w-4" />
                  Select Photo
                </Button>
              </div>
              <div className="flex justify-center">
                <Button onClick={handleTryOn} disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Start Try-On'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Try-Ons</CardTitle>
            <CardDescription>View your previous virtual try-on sessions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Recent try-ons will be listed here */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center space-x-4">
                  <Image className="h-10 w-10 rounded-md" />
                  <div>
                    <p className="text-sm font-medium">Natural Look</p>
                    <p className="text-xs text-muted-foreground">Last tried 2 hours ago</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
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
              {/* Saved looks will be listed here */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center space-x-4">
                  <Image className="h-10 w-10 rounded-md" />
                  <div>
                    <p className="text-sm font-medium">Evening Glam</p>
                    <p className="text-xs text-muted-foreground">Saved 3 days ago</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
