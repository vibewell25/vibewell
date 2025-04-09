import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAnalytics } from '@/hooks/use-analytics';
import { Facebook, Twitter, Instagram, Linkedin, Share2 } from 'lucide-react';

interface SocialShareButtonsProps {
  imageData: string;
  type: 'makeup' | 'hairstyle' | 'accessory';
  productName?: string;
  shareUrl: string;
  onShare?: (platform: string) => void;
}

export function SocialShareButtons({ 
  imageData, 
  type, 
  productName, 
  shareUrl,
  onShare 
}: SocialShareButtonsProps) {
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();

  const handleShare = async (platform: string) => {
    try {
      trackEvent('social_share_attempt', { platform, type, productName });

      const shareData = {
        title: `My ${type} try-on look${productName ? ` with ${productName}` : ''}`,
        text: `Check out my ${type} try-on look using VibeWell!${productName ? ` I'm trying on ${productName}.` : ''}`,
        url: shareUrl,
      };

      switch (platform) {
        case 'facebook':
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            '_blank'
          );
          break;
        case 'twitter':
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareUrl)}`,
            '_blank'
          );
          break;
        case 'instagram':
          // Instagram doesn't support direct sharing, so we'll download the image
          const response = await fetch(imageData);
          const blob = await response.blob();
          const file = new File([blob], `${type}-try-on.png`, { type: 'image/png' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(file);
          link.download = `${type}-try-on.png`;
          link.click();
          break;
        case 'linkedin':
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
            '_blank'
          );
          break;
        default:
          if (navigator.share) {
            await navigator.share(shareData);
          } else {
            await navigator.clipboard.writeText(shareUrl);
            toast({
              title: 'Link copied',
              description: 'Share link copied to clipboard!',
            });
          }
      }

      // Call the onShare callback if provided
      if (onShare) {
        onShare(platform);
      }

      trackEvent('social_share_success', { platform, type, productName });
    } catch (error: unknown) {
      console.error(`Error sharing to ${platform}:`, error);
      toast({
        title: 'Error',
        description: `Failed to share to ${platform}. Please try again.`,
        variant: 'destructive',
      });
      trackEvent('social_share_error', { platform, type, productName, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('facebook')}
        className="flex items-center gap-2"
      >
        <Facebook className="h-4 w-4" />
        Facebook
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('twitter')}
        className="flex items-center gap-2"
      >
        <Twitter className="h-4 w-4" />
        Twitter
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('instagram')}
        className="flex items-center gap-2"
      >
        <Instagram className="h-4 w-4" />
        Instagram
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('linkedin')}
        className="flex items-center gap-2"
      >
        <Linkedin className="h-4 w-4" />
        LinkedIn
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('native')}
        className="flex items-center gap-2"
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>
    </div>
  );
} 