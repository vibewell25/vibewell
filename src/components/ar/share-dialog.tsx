'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAnalytics } from '@/hooks/use-analytics';
import { SocialShareButtons } from './social-share-buttons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsService } from '@/services/analytics-service';
import { useEngagement } from '@/hooks/use-engagement';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageData: string;
  type: string;
  productName: string;
  userId?: string;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  isOpen,
  onClose,
  imageData,
  type,
  productName,
  userId
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();
  const analyticsService = new AnalyticsService();
  const { trackAchievement } = useEngagement();

  const handleShare = async () => {
    try {
      setIsLoading(true);
      trackEvent('share_attempt', { type, method: 'email' });

      const shareData = {
        imageData,
        type,
        productName,
        ...(userId && { userId })
      };

      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shareData),
      });

      if (!response.ok) {
        throw new Error('Failed to share image');
      }

      const data = await response.json();
      setShareUrl(data.shareUrl);

      // Track share with analytics service
      await analyticsService.trackShare({
        sessionId: data.sessionId || 'unknown',
        userId,
        platform: 'email',
        method: 'email',
        success: true
      });
      
      // Track sharing achievement
      trackAchievement('share');
      trackAchievement('share_email');

      toast({
        title: 'Success',
        description: 'Image shared successfully!',
      });
      trackEvent('share_success', { type, method: 'email' });
    } catch (error: unknown) {
      console.error('Error sharing image:', error);
      
      // Track error with analytics service
      await analyticsService.trackShare({
        sessionId: 'unknown',
        userId,
        platform: 'email',
        method: 'email',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      toast({
        title: 'Error',
        description: 'Failed to share image. Please try again.',
        variant: 'destructive',
      });
      trackEvent('share_error', { type, method: 'email', error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = imageData;
      link.download = `vibewell-${type}-${new Date().toISOString()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Track download with analytics service
      analyticsService.trackShare({
        sessionId: 'download',
        userId,
        platform: 'local',
        method: 'download',
        success: true
      });
      
      // Track download achievement
      trackAchievement('share');
      trackAchievement('download');
      
      trackEvent('image_downloaded', { type });
    } catch (error: unknown) {
      console.error('Error downloading image:', error);
      
      // Track error with analytics service
      analyticsService.trackShare({
        sessionId: 'download',
        userId,
        platform: 'local',
        method: 'download',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      toast({
        title: 'Error',
        description: 'Failed to download image. Please try again.',
        variant: 'destructive',
      });
      trackEvent('download_error', { type, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  // Handle social media sharing analytics
  const handleSocialShare = (platform: string) => {
    analyticsService.trackShare({
      sessionId: shareUrl.split('/').pop() || 'unknown',
      userId,
      platform,
      method: 'social',
      success: true
    });
    
    // Track social sharing achievement
    trackAchievement('share');
    trackAchievement('share_social');
    trackAchievement(`share_${platform}`);
    
    trackEvent('social_share', { type, platform });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Your Look</DialogTitle>
          <DialogDescription>
            Share your virtual try-on result with friends or download it for later.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-center">
            <img
              src={imageData}
              alt="Virtual try-on result"
              className="max-h-48 rounded-lg"
            />
          </div>
          
          <Tabs defaultValue="social" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="social">Social Media</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>
            
            <TabsContent value="social" className="space-y-4">
              {shareUrl ? (
                <SocialShareButtons
                  imageData={imageData}
                  type={type}
                  productName={productName}
                  shareUrl={shareUrl}
                  onShare={handleSocialShare}
                />
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  Share via email first to get a shareable link
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="email" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button
                onClick={handleShare}
                disabled={isLoading || !email}
                className="w-full"
              >
                {isLoading ? 'Sharing...' : 'Share via Email'}
              </Button>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={isLoading}
            >
              Download Image
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 